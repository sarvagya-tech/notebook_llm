import {z} from "zod";

export const sourceTypeSchema = z.enum([
    "PDF",
    "WEBSITE",
    "YOUTUBE",
    "MARKDOWN",
    "TEXT"
]);

export const sourceStatusSchema = z.enum([
    "PENDING",
    "PROCESSING",
    "READY",
    "FAILED"
]);

export const workspaceIdParamSchema = z.object({
    workspaceId : z.string().trim().min(1),
})

export const sourceIdParamSchema = z.object({
    workspaceId : z.string().trim().min(1),
    sourceId : z.string().trim().min(1)
});

export const listsourceQuery = z.object({
    q:z.string().trim().min(1),
    type: sourceTypeSchema.optional(),
    status: sourceStatusSchema.optional()
});

export const createTextSourceSchema = z.object({
    type : z.literal("TEXT"),
    title : z.string().trim().min(1,"title is required").max(200),
    content : z.string().trim().min(1,"content is required")
})

export const createMarkdownSourceSchema = z.object({
    type :z.literal("MARKDOWN"),
    title: z.string().trim().min(1,"title is required"),
    content : z.string().trim().min(1,"content is required")
})

export const importWebsiteSchema = z.object({
    url : z.string().trim().url("enter a valid url"),
    title : z.string().trim().max(200).optional()
})

export const importYoutubeSchema = z.object({
    url: z.string().trim().min(1, "YouTube URL is required"),
    title: z.string().trim().max(200).optional(),
});
export const bulkDeleteSourcesSchema = z.object({
    sourceIds: z.array(z.string().trim().min(1)).min(1),
});

export const reprocessSourcesSchema = z.object({
    sourceIds: z.array(z.string().trim().min(1)).optional(),
});

export const importWebSearchSchema = z.object({
    title: z.string().trim().min(1).max(200),
    content: z.string().trim().min(1),
    url: z.string().trim().url(),
});
