// if rss feeds are not v1 or v2, try a generic template:
const parseString = require('xml2js').parseString;

module.exports.customParserCheck = (xml) => {
  return new Promise((resolve, reject) => {
    parseString(xml, (err, result) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        // Ensure the required properties exist before using them
        if (!result || !result.rss || !result.rss.channel || !result.rss.channel[0] || !result.rss.channel[0].item) {
          reject(new Error('Invalid RSS feed structure'));
          return;
        }

        for (const item of result.rss.channel[0].item) {
          // Verify that each item has the required properties
          if (!item.title || !item.link || !item.pubDate || !item.description) {
            reject(new Error('Invalid item in RSS feed'));
            return;
          }
        }

        // If no errors were found, resolve the promise
        resolve();
      }
    });
  });
};