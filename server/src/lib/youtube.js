import { YoutubeTranscript } from "youtube-transcript"
import { ValidationError } from "../utils/app.error"

const fetchYoutubeTranscript = async (url)=>{
    const videoId = url.match(
          /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
        )?.[1] ?? url.match(/youtube\.com\/shorts\/([\w-]{11})/)?.[1];

        if(!videoId){
            throw new ValidationError("enter a valid youtube url");
        }
    
        try {
            const segments = await YoutubeTranscript.fetchTranscript(videoId);
            const content = segments.map((segment)=>segment.text.join(" ").trim());
            if(!content){
                throw new ValidationError("no transcript found with this video");

            }
            return {videoId,content}
        } catch (error) {
            throw new ValidationError("could not fetch the transcript");
            
        }
}
export {fetchYoutubeTranscript};