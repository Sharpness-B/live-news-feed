import Cookies from 'js-cookie';
import hash from 'object-hash';
import { useState, useEffect } from "react";

export const alertNewItem = (allFlattenedItems) => {
 ////////////////////////
  // alert new artickle //
  ////////////////////////
  const [isNewItemAdded, setIsNewItemAdded] = useState(false);

  //////////////////
  // alert if new //
  //////////////////
  useEffect(() => {
    // const consent = Cookies.get('cookieConsent');
    // if (consent === 'true') { consent not needed for stuff critical to functionality that the user wants.

      
    // Get the current hour from UNIX epoch
    const currentHour = Math.floor(Date.now() / 3600000); // Convert to hours
  
    // Generate hashes and timestamps for current items
    const currentItemHashes = allFlattenedItems.map(item => {
      const date = new Date(item.pubDate);
      const timestamp = Math.floor(date.getTime() / 3600000); // Convert to hours
  
      // Ignore articles older than 24 hours or with invalid date
      if (isNaN(timestamp) || currentHour - timestamp > 24) {
        return null;
      }
      // Generate a shorter hash and timestamp key-value pair
      return { h: hash(item).substring(0, 5), t: timestamp }; 
    }).filter(Boolean);
  
    // Get hashes and timestamps from the cookie
    const seenArticles = Cookies.get('seenArticles');
    let seenArticleHashes = seenArticles ? JSON.parse(seenArticles) : [];
  
    // Filter out hashes older than 24 hours, with a 1-hour buffer
    seenArticleHashes = seenArticleHashes.filter(item => currentHour - item.t < 25);
  
    // If there are new hashes in the list and the cookie was already defined before, alert the user
    if (seenArticleHashes.length>0 && currentItemHashes.some(item => !seenArticleHashes.some(seen => seen.h === item.h))) {
      setIsNewItemAdded(true);
    }
  
    // Merge new hashes with existing ones, remove duplicates
    const mergedHashes = [...seenArticleHashes, ...currentItemHashes].filter((item, index, self) =>
      index === self.findIndex((t) => (
        t.h === item.h && t.t === item.t
      ))
    );
  
    // Update cookie with merged hashes
    if (mergedHashes.length > 0) {
      Cookies.set('seenArticles', JSON.stringify(mergedHashes));
    }


  }, [allFlattenedItems]);
  
  // return
  return { isNewItemAdded, setIsNewItemAdded };
};