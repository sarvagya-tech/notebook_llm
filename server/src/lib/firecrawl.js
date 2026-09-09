import { Firecrawl } from 'firecrawl';
import { ValidationError } from '../utils/app.error';

const scrapeWebsite = async(url)=>{

    const apikey = process.env.FIRECRAWL_API_KEY

    if(!apikey){
        throw new ValidationError("Firecrawl is not configured on the server");
    }

    const client = new Firecrawl({apikey});
    const result = await client.scrape(url,{
        formats : ["markdown"],
    });
        const markdown = result.markdown?.trim();

    if (!markdown) {
        throw new ValidationError("Could not extract content from this URL");
    }

  return {
        markdown,
        title: result.metadata?.title,
        sourceUrl: result.metadata?.sourceURL ?? url,
    };

}
export {scrapeWebsite};