import { findWorkspaceByIdAndUserId,
    findWorkspacesByUserId,
    createWorkspaceRecord,
    updateWorkspaceRecord,
    deleteWorkspaceRecord
} from "../repository/workspace.repository";
import { NotFoundError } from "../utils/app.error";



const listWorkspacesByUser = (userId)=>{

    const workspace = findWorkspacesByUserId(userId);

}

const getWorkspaceByIdForUser = async(userId,workspaceId)=>{

    const workspace = await findWorkspaceByIdAndUserId(userId,workspaceId);
    if(!workspace){
      throw new NotFoundError("workspace not found ")
    }
    return workspace

}

const createWorkSpaceByUser = async(userId,data)=>{
    const workspace = await createWorkspaceRecord(userId,data);

    return workspace

}

const updateWorkSpaceByUser = async (workspaceId,userId,data)=>{

    const workspace = await getWorkspaceByIdForUser(userId,workspaceId);

    const updateWorkspace = await updateWorkspaceRecord(workspaceId,data);
    return updateWorkspace;


}

// const deleteWorkSpaceForUser = (workspaceId,userId)=>{

//     const getworkspace = await getWorkspaceByIdForUser(userId,workspaceId);
    
// }

export{
    listWorkspacesByUser,
    getWorkspaceByIdForUser,
    createWorkSpaceByUser,
    updateWorkSpaceByUser




}
