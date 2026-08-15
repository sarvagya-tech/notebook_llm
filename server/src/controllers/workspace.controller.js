import { createWorkSpaceByUser,
    listWorkspacesByUser,
    updateWorkSpaceByUser,
    getWorkspaceByIdForUser
 } from "../services/workspace.services";
 import { ValidationError } from "../utils/app.error";
 import { getZodFieldErrors } from "../utils/zod-error";

 import { createWorkspaceSchema,updateWorkspaceSchema,workspaceIdParamSchema } from "../validators/workspace.validator";


 const parseWorkspaceId = (params)=>{

    const parsed = workspaceIdParamSchema.safeParse(params);

    if(!parsed.success){
        throw new va
    }

    return parsed.data;

 }

 const parseCreateBody = (body)=>{

    const parsed = createWorkspaceSchema.safeParse(body);
        if (!parsed.success) {
        throw new ValidationError(
            "Validation failed",
            getZodFieldErrors(parsed.error),
        );
    }

    return parsed.data;
}

const parseUpdateBody = (body)=>{

    const parsed = updateWorkspaceSchema.safeParse(body);

    
    if (!parsed.success) {
        throw new ValidationError(
            "Validation failed",
            getZodFieldErrors(parsed.error),
        );

}
return parsed.data;
}

const listWorkspaces = (req,res)=>{
    const userId = req.session.user.id,

    const workspaces = listWorkspacesByUser(userId);
    res.json(workspaces);

}

const getWorkspace = (req,res)=>{
    const {workspaceId} = parseWorkspaceId(req.params);
    const workspace = await getWorkspaceByIdForUser({
        workspaceId : workspaceId,
        userId : req.session.user.id
    });
    res.json(workspace);
}

const createWorkspace = async (req,res)=>{

    const data = parseCreateBody(req.body);
    const workspace = await createWorkSpaceByUser({
        userId : req.session.user.id,
        data : data
    });
    res.status(201).json(workspace);


}

const updateWorkspace = (req,res)=>{
    const {workspaceId} = parseWorkspaceId(req.params);
    const data = parseUpdateBody(req.body);
    const workspace = updateWorkSpaceByUser({
        workspaceId : workspaceId,
        data : data,
        userId : req.session.user.id
    });
    res.json(workspace);

}

// const deleteWorkspace = ()=>{

// }

export {
    listWorkspaces,
    createWorkspace,
    updateWorkspace,
    getWorkspace
}


 