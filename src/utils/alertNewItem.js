import Cookies from 'js-cookie';
import { useState, useEffect } from "react";

export const alertNewItem = (allFlattenedItems) => {
  // assumes that allflatteneditems is sorted (as it is)
  const latestNewsByNewspaper = allFlattenedItems.reduce((acc, { newspaper, pubDate }) => {
    if (!acc[newspaper] || new Date(pubDate) > new Date(acc[newspaper])) {
      acc[newspaper] = pubDate;
    }
    return acc;
  }, {});

  const [isNewItemAdded, setIsNewItemAdded] = useState(false);

  useEffect(() => {
    const seenNews = Cookies.get('seenNews');
    let seenNewsByNewspaper = seenNews ? JSON.parse(seenNews) : {};
    console.log(seenNewsByNewspaper)

    let updatedNewsByNewspaper = {...seenNewsByNewspaper};

    for (const newspaper in latestNewsByNewspaper) {
      if (!seenNewsByNewspaper[newspaper] || new Date(latestNewsByNewspaper[newspaper]) > new Date(seenNewsByNewspaper[newspaper])) {
        updatedNewsByNewspaper[newspaper] = latestNewsByNewspaper[newspaper];
        setIsNewItemAdded(true);
      }
    }

    Cookies.set('seenNews', JSON.stringify(updatedNewsByNewspaper));

    console.log(JSON.stringify(updatedNewsByNewspaper))
  }, [latestNewsByNewspaper]);

  return { isNewItemAdded, setIsNewItemAdded };
};