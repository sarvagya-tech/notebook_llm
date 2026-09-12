
import {extractText,getDocumentProxy} from 'unpdf'


const downloadPdf = async (url)=>{
    const response = await fetch(url);

    if(!response.ok){
        throw new Error(`failed to download the pdf (${response.status})`)
        }
    return response.arrayBuffer();

}
 const extractPdfFromBuffer = async(buffer)=>{
    const arrayBuffer = buffer instanceof Buffer
        ? buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
        : buffer;
        
        const pdf = getDocumentProxy(new Uint8Array(arrayBuffer));
        const { totalPages, text } = await extractText(pdf, { mergePages: true })
        const pages = Array.isArray(text)
    ? text.map((page) => page.trim())
    : [String(text).trim()];

const joined = pages.filter(Boolean).join("\n\n");

if (!joined) {
    throw new Error("No text could be extracted from the PDF");
}

return {
    text: joined,
    pages,
    pageCount: totalPages,
};
}

export async function extractPdfFromCloudinary(input) {
    try {
        const buffer = await downloadPdf(input.fileUrl);
        return await extractPdfFromBuffer(buffer);
    } catch (error) {
        const isUnauthorized =
            error instanceof Error && error.message.includes("(401)");

        if (!isUnauthorized || !input.publicId) {
            throw error;
        }

        const signedUrl = getSignedCloudinaryDownloadUrl(
            input.publicId,
            input.resourceType ?? "raw",
        );

        if (!signedUrl) {
            throw new Error(
                "PDF download requires authentication. Add CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to server/.env, or re-upload the PDF.",
            );
        }

        const buffer2 = await downloadPdf(signedUrl);
        return extractPdfFromBuffer(buffer2);
    }
}



 