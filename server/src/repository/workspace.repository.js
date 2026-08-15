import prisma from "../lib/db.js";

export const workspaceSelect = {
    id: true,
    title: true,
    description: true,
    icon: true,
    defaultModel: true,
    createdAt: true,
    updatedAt: true,
};

export function findWorkspacesByUserId(userId) {
    return prisma.workspace.findMany({
        where: { userId },
        select: workspaceSelect,
        orderBy: { updatedAt: "desc" },
    });
}

export function findWorkspaceByIdAndUserId(workspaceId, userId) {
    return prisma.workspace.findFirst({
        where: { id: workspaceId, userId },
        select: workspaceSelect,
    });
}

export function createWorkspaceRecord(userId, data) {
    return prisma.workspace.create({
        data: {
            userId,
            ...data,
        },
        select: workspaceSelect,
    });
}

export function updateWorkspaceRecord(workspaceId, data) {
    return prisma.workspace.update({
        where: { id: workspaceId },
        data,
        select: workspaceSelect,
    });
}

export async function deleteWorkspaceRecord(workspaceId) {
    await prisma.workspace.delete({
        where: { id: workspaceId },
    });
}
