import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const sessionUser = await getServerSession(authOptions);
        const userId = sessionUser?.user?.id;

        const { id } = await params;

        const session = await prisma.chatSession.findFirst({
            where: { 
                id,
                userId: userId || undefined
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: "asc"
                    }
                }
            }
        });

        if (!session) {
            return Response.json({ error: "Session not found." }, { status: 404 });
        }

        return Response.json(session);
    } catch (error: any) {
        console.error("[GET /api/chat/sessions/[id] Error]:", error);
        return Response.json({
            error: "Failed to retrieve chat session.",
            details: error.message || String(error)
        }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const sessionUser = await getServerSession(authOptions);
        const userId = sessionUser?.user?.id;

        const { id } = await params;

        // Verify ownership before deleting
        const sessionExists = await prisma.chatSession.findFirst({
            where: {
                id,
                userId: userId || undefined
            }
        });

        if (!sessionExists) {
            return Response.json({ error: "Session not found or access denied." }, { status: 404 });
        }

        await prisma.chatSession.delete({
            where: { id }
        });

        return Response.json({ success: true, message: "Chat session deleted successfully." });
    } catch (error: any) {
        console.error("[DELETE /api/chat/sessions/[id] Error]:", error);
        return Response.json({
            error: "Failed to delete chat session.",
            details: error.message || String(error)
        }, { status: 500 });
    }
}
