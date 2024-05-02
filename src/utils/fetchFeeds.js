import { getFoldersFromDB, readFiltersFromDB, readSelectedFeedsFromDB, readCustomFeedsFromDB } from "../data/services/firestore";
import { feeds } from "./rssFeedsList";
import { useEffect, useState } from 'react';
import { useInterval } from 'react-use';

import Parser from 'rss-parser';
const parser = new Parser();




// get all settings from db
export const getCollectiveSettings = async (user) => {
    // Retrieve folders and use Promise.all to combine data for each folder
    const collectiveSettings = await Promise.all(
        (await getFoldersFromDB(user)).map(async (folder) => {
            // Retrieve filters, feeds, and custom feeds for the folder
            const [filters, feeds, customFeeds] = await Promise.all([
                readFiltersFromDB(user, folder.id),
                readSelectedFeedsFromDB(user, folder.id),
                readCustomFeedsFromDB(user, folder.id),
            ]);

            // Return combined data for the folder
            return { 
                folderId: folder.id,
                folderName: folder.name,
                isSelected: folder.isSelected,

                filters,
                feeds,
                customFeeds
            };
        })
    );

    // console.log(collectiveSettings);
    return collectiveSettings;
};



// list the selected rss feeds and in what folders each is selected
export const getCollectiveFeeds = (collectiveSettings) => {
    // Initialize an empty object to store the feeds
    let feedObj = {};

    // Loop through each folder in the collective settings
    collectiveSettings.forEach((folder) => {
        // Loop through each feed in the folder
        folder.feeds.forEach((feedId) => {
            // If the feed is not already in the feedObj, add it with the current folder's id
            if (!feedObj[feedId]) {
                feedObj[feedId] = {
                    folderId: [folder.folderId],
                    url: feeds.find(feed => feed.id === feedId).url,
                    title: feeds.find(feed => feed.id === feedId).title
                };
            } else { // Otherwise, just append the current folder's id to the folderId field
                feedObj[feedId].folderId.push(folder.folderId);
            }
        });

        // Loop through each custom feed in the folder
        folder.customFeeds.forEach((customFeed) => {
            // If the custom feed is selected and its URL is not already in the feedObj, add it with the current folder's id
            if (customFeed.isSelected && !feedObj[customFeed.url]) {
                feedObj[customFeed.url] = {
                    folderId: [folder.folderId],
                    url: customFeed.url,
                    title: customFeed.title
                };
            } else if (customFeed.isSelected) { // Otherwise, just append the current folder's id to the folderId field
                feedObj[customFeed.url].folderId.push(folder.folderId);
            }
        });
    });

    // Convert the feedObj to an array
    const feedArray = Object.values(feedObj);

    return feedArray;
};



// fetching the feeds
export const fetchFeeds = async (feedArray) => {
    // Initialize an empty array to store the successfully fetched feeds
    let successfulFeeds = [];

    // Initialize an empty array to store the feeds that failed to fetch
    let failedFeeds = [];

    const allFeedsData = await Promise.all(feedArray.map(async (feed) => {
        try {
            const proxyUrl = 'https://api.allorigins.win/raw?url=';
            const data = await parser.parseURL(proxyUrl + encodeURIComponent(feed.url));

            // Add the folder id to the feed item if it passes the folder's filters
            // data.items = data.items.map(item => {
            //     item.folderId = feed.folderId.filter(folderId => {
            //         const folder = collectiveSettings.find(setting => setting.folderId === folderId);
            //         const filters = folder.filters;
            //         return (filters.searchKeywords.length === 0 || filters.searchKeywords.some(word => JSON.stringify(item).includes(word))) 
            //             && (!filters.excludeKeywords.some(word => JSON.stringify(item).includes(word)));
            //     });
            //     return item;
            // });

            // Add the feed data and folder ids to the successful feeds array
            successfulFeeds.push({ ...feed, data });

            return { ...feed, data };
        } 
        catch (error) {
            console.error(`Failed to fetch feed ${feed.title}:`, error);

            // Add the feed to the failed feeds array
            failedFeeds.push(feed);

            return null; // return null for feeds that failed to fetch
        }
    }));

    // Remove null values from the allFeedsData array
    const successfulFeedsData = allFeedsData.filter(feed => feed !== null);

    // console.log('Successful feeds:', successfulFeeds);
    // console.log('Failed feeds:', failedFeeds);

    return successfulFeedsData;
};



// Add the folder id to the feed item if it passes the folder's filters
export const applyFilters = (successfulFeedsData, collectiveSettings) => {
    successfulFeedsData.forEach(feed => {
        // Apply the filters for each folder to the items in the feed
        feed.data.items = feed.data.items.map(item => {
            item.folderId = feed.folderId.filter(folderId => {
                const folder = collectiveSettings.find(setting => setting.folderId === folderId);
                const filters = folder.filters;
                return (filters.searchKeywords.length === 0 || filters.searchKeywords.some(word => JSON.stringify(item).includes(word))) 
                    && (!filters.excludeKeywords.some(word => JSON.stringify(item).includes(word)));
            });
            return item;
        });
    });
};


// filter based on folder id on each item, and flatten the items into one feed. sort the feed by date.
export const flattenAndSortItems = (successfulFeedsData, folderId) => {
    const flattenedItems = successfulFeedsData
        .flatMap(feed => feed.data.items
            .filter(item => item.folderId.length > 0 && (!folderId || item.folderId.includes(folderId))) // Always include items that have at least one folder id, and if a folderId is specified, only include items with the specified folderId
            .map(item => ({ ...item, newspaper: feed.title }))) // Add the title to each item
        .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)); // Sort the items by date

    return flattenedItems;
};




// the previous pipeline made reactive. The previous version is commented out and more easy to understand. 
export const useFeedData = (user, selectedFeeds, selectedCustomFeeds, filters, selectedFolder) => {
    const [feedCollectiveSettings, setFeedCollectiveSettings] = useState([]);
    const [filterCollectiveSettings, setFilterCollectiveSettings] = useState([]);
    const [successfulFeedsData, setSuccessfulFeedsData] = useState([]);
    const [allFlattenedItems, setAllFlattenedItems] = useState([]);
    const [specifiedFolderItems, setSpecifiedFolderItems] = useState([]);

    // update newCollectiveSettings for fetching feeds
    useEffect(() => {
        const fetchAndUpdateSettings = async () => {
            const newCollectiveSettings = await getCollectiveSettings(user);
            setFeedCollectiveSettings(newCollectiveSettings);
        };
        
        if (user) {
            fetchAndUpdateSettings();
        }
    }, [user, selectedFeeds, selectedCustomFeeds]); 

    // update newCollectiveSettings for filtering
    useEffect(() => {
        const fetchAndUpdateSettings = async () => {
            const newCollectiveSettings = await getCollectiveSettings(user);
            setFilterCollectiveSettings(newCollectiveSettings);
        };
        
        if (user) {
            fetchAndUpdateSettings();
        }
    }, [user, filters]);



    // fetch feeds ...
    const fetchAndUpdateFeeds = async () => {
        if (feedCollectiveSettings.length > 0) {
            const feedArray = getCollectiveFeeds(feedCollectiveSettings);
            const newSuccessfulFeedsData = await fetchFeeds(feedArray);
            setSuccessfulFeedsData(newSuccessfulFeedsData); 
            // console.log("fetch!")       
        }    
    };
    // ... when feedCollectiveSettings updates
    useEffect(fetchAndUpdateFeeds, [feedCollectiveSettings]);
    // ... every 10 seconds
    useInterval(fetchAndUpdateFeeds, 10000);



    // Apply filters. Flatten and sort all items that have at least one folder id.
    useEffect(() => {
        if (successfulFeedsData.length > 0) {
            applyFilters(successfulFeedsData, filterCollectiveSettings);

            setAllFlattenedItems(flattenAndSortItems(successfulFeedsData));
            
            if (selectedFolder) {
                setSpecifiedFolderItems(flattenAndSortItems(successfulFeedsData, selectedFolder.id));
            }
        }
    }, [successfulFeedsData, selectedFolder, filterCollectiveSettings]);



    // return
    return { allFlattenedItems, specifiedFolderItems };
};






// export const pipeline = async (user, specifiedFolderId) => {
//     const collectiveSettings = await getCollectiveSettings(user)
//     const feedArray = getCollectiveFeeds(collectiveSettings)
//     const successfulFeedsData = await fetchFeeds(feedArray)
//     // Apply filters to the successful feeds data
//     applyFilters(successfulFeedsData, collectiveSettings);

//     // Flatten and sort all items that have at least one folder id
//     const allFlattenedItems = flattenAndSortItems(successfulFeedsData);

//     // Flatten and sort only the items with the specified folder id
//     const specifiedFolderItems = flattenAndSortItems(successfulFeedsData, specifiedFolderId);

//     console.log('All items:', allFlattenedItems)
//     console.log('Items with specified folder id:', specifiedFolderItems)
// }
