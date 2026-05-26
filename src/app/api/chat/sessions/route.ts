import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const sessionUser = await getServerSession(authOptions);
        const userId = sessionUser?.user?.id;

        const sessions = await prisma.chatSession.findMany({
            where: {
                userId: userId || undefined
            },
            orderBy: {
                updatedAt: "desc"
            },
            select: {
                id: true,
                title: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return Response.json(sessions);
    } catch (error: any) {
        console.error("[GET /api/chat/sessions Error]:", error);
        return Response.json({
            error: "Failed to fetch chat sessions.",
            details: error.message || String(error)
        }, { status: 500 });
    }
}
