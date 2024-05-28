// if rss feeds are not v1 or v2, try a generic template:
import { parseString } from 'xml2js';

export const customParser = (xml) => {
  return new Promise((resolve, reject) => {
    parseString(xml, (err, result) => {
      if (err) {
        console.error(err);
        reject(err);
      } 

      else {
        const feed = {
          title: result.rss.channel[0].title[0],
          
          image: result.rss.channel[0].image ? {
            url: result.rss.channel[0].image[0].url[0]
          } : {url:""},

          items: result.rss.channel[0].item.map((item) => ({
            title:   item.title[0],
            link:    item.link[0],
            pubDate: item.pubDate[0],
            content:        item.description[0],
            contentSnippet: item.description[0]
          })),
        };
        resolve(feed);
      }
    });
  });
};