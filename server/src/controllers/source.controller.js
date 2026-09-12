import { ValidationError } from "../utils/app.error";
import {
     bulkDeleteSourcesForWorkspace,
    importWebsiteSource,
    importYoutubeSource,
    listSourcesForWorkspace,
    uploadPdfSource,
    getSourceForWorkspace, 
    deleteSourceForWorkspace} from "../services/source.services";
import { 
    bulkDeleteSourcesSchema,
    createSourceSchema,
    listsourceQuery,
    sourceIdParamSchema,
    importWebsiteSchema,
    importYoutubeSchema
 } from "../validators/source.validator";
 import { workspaceIdParamSchema } from "../validators/workspace.validator";
 import { getZodFieldErrors } from "../utils/zod-error";

 const parseSourceParams = (params)=>{
    const parsed = sourceIdParamSchema.safeParse(params);
    if(!parsed.success){
        throw new ValidationError("invalid source id "),
            getZodFieldErrors(parsed.error)
        
    }
    return parsed.data;
 }

 const parseWorkspaceId = (params)=>{
    const parsed = workspaceIdParamSchema.safeParse(params);
if(!parsed.success){
    throw new ValidationError("workspaceId not valid "),
    getZodFieldErrors(parsed.error);

} 
return parsed.data;
}
const parseListQuery = (query)=>{
    const parsed = listsourceQuery.safeParse(query);
    if(!parsed.success){
        throw new ValidationError("query is invalid "),
        getZodFieldErrors(parsed.error)
    }
    return parsed.data
}

const parseCreateBody = (body)=>{

    const parsed = createSourceSchema.safeParse(body);
    if(!parsed.success){
        throw new ValidationError("body data is not valid"),
        getZodFieldErrors(parsed.error)
    }
    return parsed.data
}
const parseBulkDeleteBody = (body)=>{
    const parsed = bulkDeleteSourcesSchema.safeParse(body);
    if(!parsed.success){
        throw new ValidationError("validation failled"),
        getZodFieldErrors(parsed.error);
    }
    return parsed.data;
}

const listSource = (req,res)=>{

    const {workspaceId} = parseWorkspaceId(req.params);
    const filter = parseListQuery(query);
    const sources = listSourcesForWorkspace(workspaceId,filter,req.session.User.id);
    res.json(sources);

}
const createSource = async (req,res)=> {
    const { workspaceId } = parseWorkspaceId(req.params);
    const input = parseCreateBody(req.body);
    const source = await createTextOrMarkdownSource(
        workspaceId,
        req.session.user.id,
        input,
    );
    res.status(201).json(source);
}

const getSource = (req,res)=>{
    const {workspaceId,sourceId} = parseSourceParams(req.params);
    const userId = req.session.User.id;
    const source = getSourceForWorkspace(workspaceId,sourceId,userId);
    res.json(source)
}

const deleteSource = async(req,res)=>{
    const {workspaceId,sourceId} = parseSourceParams(req.params);
    const userId = req.session.User.id;
    await deleteSourceForWorkspace(workspaceId,sourceId,userId)
    res.status(204).send();

}
const bulkDeleteSources = async(req,res)=>{
    const {workspaceId} = parseWorkspaceId(req.params);
    const input  = parseBulkDeleteBody(req.body);
    const userId = req.session.User.id;
    await bulkDeleteSourcesForWorkspace(workspaceId,input.sourceIds,userId)
    res.status(204).send();
}

const uploadPdf = async (req,res)=>{
    const {workspaceId} = parseWorkspaceId(req.params);
    const file = req.file;
    if(!file){
        throw new ValidationError("pdf is required");
    }
    const userId = req.session.User.id;
  const title = typeof req.body.title === "string" ? req.body.title : undefined;
//   This line says: "If the client sent a title and it is actually a piece of text (a string), use it. If they sent something weird (like an array, an object, or nothing at all), set it to undefined."
   const source = await uploadPdfSource(
    workspaceId,
    userId,
    title,
    file
   )
   req.status(201).json(source);
}

const importWebsite = async (req,res)=>{
    const {workspaceId} = parseWorkspaceId(req.params);
    const input = importWebsiteSchema.parse(req.body);
    const userId = req.session.User.id;
    const source = await importWebsiteSource(workspaceId,userId,input);
    res.status(201).json(source);
}

const importYoutube = async(req,res)=>{
    const {workspaceId} = parseWorkspaceId(req.params);
    const input = importYoutubeSchema.parse(req.body);
    const userId = req.session.User.id;
    const source = await importYoutubeSource(workspaceId,userId,input);
    res.status(201).json(source);
}

export {
    importYoutube,
    importWebsite,
    bulkDeleteSources,
    uploadPdf,
    deleteSource,
    getSource,
    listSource,
    createSource
}