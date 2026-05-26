import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY || ""
);

export async function POST(req: Request) {
    try {
        // Basic check for API key
        if (!process.env.GEMINI_API_KEY) {
            console.error("Gemini API Error: GEMINI_API_KEY is not defined in environment variables.");
            return Response.json({
                reply: "Gemini connection failed: API key is not configured.",
                error: "GEMINI_API_KEY env variable is missing."
            }, { status: 500 });
        }

        // Validate request body
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return Response.json({
                reply: "Malformed request payload.",
                error: "Invalid JSON body."
            }, { status: 400 });
        }

        if (!body || typeof body.prompt !== "string" || !body.prompt.trim()) {
            return Response.json({
                reply: "Please provide a valid prompt.",
                error: "Missing or invalid 'prompt' field in request body."
            }, { status: 400 });
        }

        const { prompt, stream, sessionId } = body;

        const sessionUser = await getServerSession(authOptions);
        const userId = sessionUser?.user?.id;

        // Resolve or create ChatSession
        let activeSessionId = sessionId;
        let session;
        if (activeSessionId && activeSessionId !== "new") {
            try {
                session = await prisma.chatSession.findFirst({
                    where: { 
                        id: activeSessionId,
                        userId: userId || undefined
                    }
                });
            } catch (dbError) {
                console.error("[Prisma Lookup Session Error]:", dbError);
            }
        }

        if (!session) {
            const title = prompt.length > 40 ? `${prompt.substring(0, 40)}...` : prompt;
            try {
                session = await prisma.chatSession.create({
                    data: { 
                        title,
                        userId: userId || undefined
                    }
                });
                activeSessionId = session.id;
            } catch (dbCreateError) {
                console.error("[Prisma Create Session Error]:", dbCreateError);
                return Response.json({
                    reply: "Database error: Failed to initialize chat session.",
                    error: String(dbCreateError)
                }, { status: 500 });
            }
        }

        // Save User prompt as message
        try {
            await prisma.chatMessage.create({
                data: {
                    role: "user",
                    content: prompt,
                    sessionId: activeSessionId
                }
            });
        } catch (dbMsgError) {
            console.error("[Prisma Create Message Error]:", dbMsgError);
        }

        // Use the latest supported model: gemini-2.5-flash
        let modelName = "gemini-2.5-flash";
        let model = genAI.getGenerativeModel({
            model: modelName,
        });

        if (stream === true) {
            console.log(`[Gemini API] Generating streaming content for prompt (session=${activeSessionId}): "${prompt.substring(0, 60)}..."`);
            const encoder = new TextEncoder();
            
            let resultStream;
            try {
                resultStream = await model.generateContentStream(prompt);
            } catch (e: any) {
                const errText = String(e);
                if (errText.includes("503") || errText.includes("Service Unavailable") || errText.includes("high demand") || errText.includes("overloaded")) {
                    console.warn(`[Gemini API] gemini-2.5-flash overloaded/unavailable. Falling back to gemini-1.5-flash...`);
                    modelName = "gemini-1.5-flash";
                    model = genAI.getGenerativeModel({ model: modelName });
                    resultStream = await model.generateContentStream(prompt);
                } else {
                    throw e;
                }
            }

            const customStream = new ReadableStream({
                async start(controller) {
                    try {
                        let replyText = "";
                        for await (const chunk of resultStream.stream) {
                            const chunkText = chunk.text();
                            if (chunkText) {
                                replyText += chunkText;
                                controller.enqueue(encoder.encode(chunkText));
                            }
                        }

                        // Save AI reply to DB on successful streaming completion
                        if (replyText.trim()) {
                            try {
                                await prisma.chatMessage.create({
                                    data: {
                                        role: "model",
                                        content: replyText,
                                        sessionId: activeSessionId
                                    }
                                });
                                await prisma.chatSession.update({
                                    where: { id: activeSessionId },
                                    data: { updatedAt: new Date() }
                                });
                            } catch (dbSaveReplyError) {
                                console.error("[Prisma Save Streaming Reply Error]:", dbSaveReplyError);
                            }
                        }
                        controller.close();
                    } catch (streamError: any) {
                        console.error("[Gemini Streaming Error]:", streamError);
                        const errMsg = `\n\n[Streaming Error]: ${streamError.message || String(streamError)}`;
                        controller.enqueue(encoder.encode(errMsg));
                        controller.close();
                    }
                }
            });

            return new Response(customStream, {
                headers: {
                    "Content-Type": "text/plain; charset=utf-8",
                    "Cache-Control": "no-cache, no-transform",
                    "Connection": "keep-alive",
                    "X-Session-Id": activeSessionId,
                    "Access-Control-Expose-Headers": "X-Session-Id"
                },
            });
        }

        console.log(`[Gemini API] Generating static content for prompt (session=${activeSessionId}): "${prompt.substring(0, 60)}..."`);
        let result;
        try {
            result = await model.generateContent(prompt);
        } catch (e: any) {
            const errText = String(e);
            if (errText.includes("503") || errText.includes("Service Unavailable") || errText.includes("high demand") || errText.includes("overloaded")) {
                console.warn(`[Gemini API] gemini-2.5-flash overloaded/unavailable. Falling back to gemini-1.5-flash...`);
                modelName = "gemini-1.5-flash";
                model = genAI.getGenerativeModel({ model: modelName });
                result = await model.generateContent(prompt);
            } else {
                throw e;
            }
        }
        const text = result.response.text();

        // Save AI reply to DB for non-streaming response
        try {
            await prisma.chatMessage.create({
                data: {
                    role: "model",
                    content: text,
                    sessionId: activeSessionId
                }
            });
            await prisma.chatSession.update({
                where: { id: activeSessionId },
                data: { updatedAt: new Date() }
            });
        } catch (dbSaveReplyError) {
            console.error("[Prisma Save Static Reply Error]:", dbSaveReplyError);
        }

        return Response.json({
            reply: text,
            sessionId: activeSessionId
        }, {
            headers: {
                "X-Session-Id": activeSessionId,
                "Access-Control-Expose-Headers": "X-Session-Id"
            }
        });
    } catch (error: any) {
        console.error("[Gemini API Route Error]:", error);

        return Response.json({
            reply: "Gemini connection failed. Please check the terminal logs for more details.",
            error: error.message || String(error),
        }, { status: 500 });
    }
}