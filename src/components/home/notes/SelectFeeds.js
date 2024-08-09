
import { writeSelectedFeedsToDB, readSelectedFeedsFromDB } from "../../../data/services/firestore"
import { useEffect } from "react";
import { Grid, Typography, Chip, Box } from '@mui/material';

import { feeds } from "../../../utils/rssFeedsList";


const SelectFeeds = ({ user, selectedFolder, selectedFeeds, setSelectedFeeds, setPayingUserModalVisible }) => {    
         // Fetch selected feeds from DB on component mount
    useEffect(() => {
        const fetchSelectedFeeds = async () => {
            try {
                let id_list;
                if (user.isPayingUser) { id_list = await readSelectedFeedsFromDB(user, selectedFolder.id) } 
                else                   { id_list = [1] }

                const selectedFeeds = feeds.filter(feed => id_list.includes(feed.id));
                setSelectedFeeds(selectedFeeds);
            } catch (error) {
                console.log("Database error: could not fetch previously selected news feeds", error);
            }
        }
        fetchSelectedFeeds();
    }, [user, user.isPayingUser, selectedFolder, setSelectedFeeds]);

    const handleFeedClick = async (feed) => {
        // First, check if user is paying - return if user is not paying
        if (!user.isPayingUser) {
            setPayingUserModalVisible(true);
            return
        }

        const newFeeds = selectedFeeds.find((x) => x.id === feed.id)
            ? selectedFeeds.filter((x) => x.id !== feed.id)
            : [...selectedFeeds, feed];

        setSelectedFeeds(newFeeds);

        await writeSelectedFeedsToDB(user, selectedFolder.id, newFeeds.map(feed => feed.id)); // if it fails -> set it back to false
    };

    return (
        <Box sx={{ display: 'flex', overflowX: 'auto', whiteSpace: 'nowrap', mt: 2, ml: 4}}>
            {Object.entries(feeds.reduce((categories, feed) => {
            if (!categories[feed.category]) {
                categories[feed.category] = [];
            }
            categories[feed.category].push(feed);
            return categories;
            }, {})).map(([category, feeds]) => (
            <Grid container direction="column" alignItems="flex-start" sx={{ minWidth: 200, mr: 2 }} key={category}>
                <Typography variant="h6">{category}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {feeds.map((feed, index) => (
                    <Chip
                    label={feed.title}
                    clickable
                    color={selectedFeeds.some((x) => x.id === feed.id) ? 'primary' : 'default'}
                    onClick={() => handleFeedClick(feed)}
                    key={index}
                    sx={{ m: 0.5 }}
                    />
                ))}
                </Box>
            </Grid>
            ))}
        </Box>
    );
};

export default SelectFeeds;