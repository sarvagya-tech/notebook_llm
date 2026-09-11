import { uploadPdfToCloudinary } from "../lib/cloudinary";
import { scrapeWebsite } from "../lib/firecrawl";
import { createSourceRecord,
    updateSourceRecord,
    findSourceById,
    findSourceByIdAndWorkspaceId, 
    deleteSourceRecord} from "../repository/source.repository";
import { NotFoundError } from "../utils/app.error";
import { importWebSearchSchema,listSourcesQuerySchema,importWebsiteSchema,createSourceSchema } from "../validators/source.validator";
import { getWorkspaceByIdForUser } from "./workspace.services";

const assertsWorkspaceAcess =  async (workspaceId,userId)=>{
    await getWorkspaceByIdForUser(workspaceId,userId);
}
// const craeteAndProcessSource = ()=>{
    
// }

const listSourcesForWorkspace = async (workspaceId,userId,filters)=>{
await assertsWorkspaceAcess(workspaceId,userId)
const source = await findSourcesByWorkspaceId(workspaceId)
return source;
}

const getSourceForWorkspace = async (workspaceId,sourceId,userId)=>{
    await assertsWorkspaceAcess(workspaceId,userId);
    const source = await findSourceByIdAndWorkspaceId(workspaceId,sourceId);
    if(!source){
        throw NotFoundError("source not found");
    }
    return source;
}

const deleteSourceForWorkspace = async(workspaceId,sourceId,userId)=>{
    await assertsWorkspaceAcess(workspaceId,userId);
       await deleteSourceRecord(sourceId);
}

const bulkDeleteSourcesForWorkspace = async (workspaceId,sourceIds,userId)=>{
    await assertsWorkspaceAcess(workspaceId,userId);

    for(const sourceId of sourceIds){
        deleteSourceForWorkspace(workspaceId,sourceId,userId);

    }

}
const importWebsiteSource = async (workspaceId,userId,data)=>{
    await getWorkspaceByIdForUser(workspaceId);
    const scraped = await scrapeWebsite(data.url);
    const websiteSource = await createSourceRecord(
        {
            workspaceId,
            title : data.title || scraped.title || data.url,
            type : "WEBSITE",
            content : scraped.markdown,
            url : scraped.sourceUrl,
            status : "PENDING",
            metadata :{
                importedFrom : scraped.sourceUrl
            }
        }
    )
    return websiteSource;

}


