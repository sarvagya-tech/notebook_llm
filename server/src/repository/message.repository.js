import prisma from "../lib/db.js";

export const messageSelect = {
    id: true,
    conversationId: true,
    role: true,
    content: true,
    citations: true,
    createdAt: true,
};

export function findMessagesByConversationId(conversationId) {
    return prisma.message.findMany({
        where: { conversationId },
        select: messageSelect,
        orderBy: { createdAt: "asc" },
    });
}

export function countMessagesByConversationId(conversationId) {
    return prisma.message.count({
        where: { conversationId },
    });
}

export function createMessageRecord(data) {
    return prisma.message.create({
        data: {
            conversationId: data.conversationId,
            role: data.role,
            content: data.content,
            citations: data.citations,
        },
        select: messageSelect,
    });
}
