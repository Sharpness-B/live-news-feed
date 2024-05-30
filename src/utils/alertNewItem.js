import Cookies from 'js-cookie';
import { useState, useEffect } from "react";

export const alertNewItem = (allFlattenedItems) => {
  // assumes that allflatteneditems is sorted (as it is)
  const latestNewsByNewspaper = allFlattenedItems.reduce((acc, { newspaper, pubDate }) => {
    const unixSeconds = Math.floor(new Date(pubDate).getTime()/1000) // stores only number vs long time string
    if (!acc[newspaper] || unixSeconds > acc[newspaper]) {
      acc[newspaper] = unixSeconds;
    }
    return acc;
  }, {});

  const [isNewItemAdded, setIsNewItemAdded] = useState(false);

  useEffect(() => {
    const seenNews = Cookies.get('seenNews');
    let seenNewsByNewspaper = seenNews ? JSON.parse(seenNews) : {};

    let updatedNewsByNewspaper = {...seenNewsByNewspaper};

    for (const newspaper in latestNewsByNewspaper) {
      if (!seenNewsByNewspaper[newspaper] || new Date(latestNewsByNewspaper[newspaper]) > new Date(seenNewsByNewspaper[newspaper])) {
        updatedNewsByNewspaper[newspaper] = latestNewsByNewspaper[newspaper];
        setIsNewItemAdded(true);
      }
    }

    Cookies.set('seenNews', JSON.stringify(updatedNewsByNewspaper), { expires: 1 });

  }, [latestNewsByNewspaper]);

  return { isNewItemAdded, setIsNewItemAdded };
};