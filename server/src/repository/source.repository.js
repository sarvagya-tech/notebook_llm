import prisma from "../lib/db";



export const sourceSelect = {
    id: true,
    workspaceId: true,
    type: true,
    title: true,
    content: true,
    url: true,
    status: true,
    metadata: true,
    createdAt: true,
    updatedAt: true,
};

const createSourceRecord = (data)=>{
    const sourcerecord = prisma.source.create({
        data:{
            workspaceId : data.workspaceId,
            type :data.type,
            title :data.title,
            content : data.content ?? null,
            url : data.url ?? null,
            status : data.status ?? "PENDING",
            metadata : data.metadata
        },
        select:sourceSelect,

    });
    return sourcerecord

}

const findSourceByIdAndWorkspaceId = (sourceId,workspaceId)=>{

    const source = prisma.source.findFirst({
        where:{
            id:sourceId,workspaceId,
        },
        select: sourceSelect
    });
    return source;

}
const deleteSourceRecord = (sourceId)=>{
    const source = prisma.source.delete({
        where:{
            id : sourceId
        }
    })
    return source
}

const findSourceById = (sourceId)=>{
    const source = prisma.source.findUnique({
        where:{
            id : sourceId
        }
    });
    return source;

}

const updateSourceRecord = (sourceId,data)=>{

    const updatedSource = prisma.source.update({
        where:{
            id:{sourceId}
        },
        data,
        select : sourceSelect
    })
return updatedSource;
}

export{
    createSourceRecord,
    updateSourceRecord,
    findSourceById,
    deleteSourceRecord,
    findSourceByIdAndWorkspaceId


}