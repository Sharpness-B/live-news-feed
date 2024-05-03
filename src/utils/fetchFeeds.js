import { getFoldersFromDB, readFiltersFromDB, readSelectedFeedsFromDB, readCustomFeedsFromDB } from "../data/services/firestore";
import { feeds } from "./rssFeedsList";
import { useEffect, useState } from 'react';
import { useInterval } from 'react-use';

import Parser from 'rss-parser';
const parser = new Parser();

import { getAuth, onAuthStateChanged } from "firebase/auth";
const auth = getAuth();



// get all settings from db
export const getCollectiveSettings = async (user) => {
    // Retrieve folders and use Promise.all to combine data for each folder
    const collectiveSettings = await Promise.all(
        (await getFoldersFromDB(user)).map(async (folder) => {
            // Retrieve filters, feeds, and custom feeds for the folder. If not paying user, only read filters
            const [filters, feeds, customFeeds] = await Promise.all([
                readFiltersFromDB(user, folder.id),
                user.isPayingUser ? readSelectedFeedsFromDB(user, folder.id) : Promise.resolve([1]),
                user.isPayingUser ? readCustomFeedsFromDB(user, folder.id)   : Promise.resolve([]),
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
    let successfulFeeds = [];
    let failedFeeds = [];

    try {
        const idToken = await auth.currentUser.getIdToken(true);
        const proxyUrl = 'https://proxy-5hnkoydcca-uc.a.run.app';
        const urls = feedArray.map(feed => feed.url);
        
        const rawFeeds = await fetch(proxyUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ urls: urls })
        }).then(res => res.json());

        const allFeedsData = await Promise.all(rawFeeds.map((rawFeed, index) => {
            if (rawFeed) {
                return parser.parseString(rawFeed)
                    .then(data => {
                        successfulFeeds.push({ ...feedArray[index], data });
                        return { ...feedArray[index], data };
                    })
                    .catch(error => {
                        console.error(`Failed to parse feed ${feedArray[index].title}:`, error);
                        failedFeeds.push(feedArray[index]);
                        return null;
                    });
            } else {
                failedFeeds.push(feedArray[index]);
                return null;
            }
        }));

        const successfulFeedsData = allFeedsData.filter(feed => feed !== null);

        return successfulFeedsData;
    } catch (error) {
        console.error(`Failed to fetch feeds:`, error);
        return [];
    }
};



// Add the folder id to the feed item if it passes the folder's filters
export const applyFilters = (successfulFeedsData, collectiveSettings) => {
    successfulFeedsData.forEach(feed => {
        feed.data.items = feed.data.items.map(item => {
            item.folderId = feed.folderId.filter(folderId => {
                const folder = collectiveSettings.find(setting => setting.folderId === folderId);
                if (!folder) {return false}

                const { searchKeywords, excludeKeywords, searchInTitle, exactMatch, customRegex, useRegex } = folder.filters;
                const itemString = JSON.stringify(item).toLowerCase();

                let searchKeywordsPass = searchKeywords.length === 0;
                let searchString;
                if (!searchKeywordsPass) {
                    searchString = searchInTitle ? item.title.toLowerCase() : itemString;
                    if (exactMatch) {
                        searchKeywordsPass = searchKeywords.some(word => searchString === word.toLowerCase());
                    } else {
                        searchKeywordsPass = searchKeywords.some(word => searchString.includes(word.toLowerCase()));
                    }
                }

                let excludeKeywordsPass = !excludeKeywords.some(word => itemString.includes(word.toLowerCase()));

                let regexPass = true;
                if (customRegex && useRegex) {
                    const regex = new RegExp(customRegex, 'i'); // 'i' flag for case insensitive matching
                    regexPass = regex.test(itemString);
                }



                // logic test
                if (useRegex) {
                    if (searchKeywords.length > 0) return regexPass || (searchKeywordsPass && excludeKeywordsPass);
                    else                           return regexPass;
                }
                else {
                    return searchKeywordsPass && excludeKeywordsPass;
                }
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
            .map(item => ({ 
                ...item, 
                newspaper: feed.title, // Add the feed title to each item
                imageUrl: feed.data.image?.url // Add the image URL from the feed to each item
            })))
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
