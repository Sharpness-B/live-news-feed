
import { writeSelectedFeedsToDB, readSelectedFeedsFromDB } from "../../../data/services/firestore"
import { useEffect } from "react";
import { Grid, Typography, Chip, Box } from '@mui/material';


const feeds = [
    // { id:1, category: 'Norge', title: 'VG Forsiden', url: 'https://www.vg.no/rss/feed/forsiden/' },
    { id:1, category: 'Norge', title: 'VG Innenriks', url: 'https://www.vg.no/rss/feed/?categories=1069' },
    { id:3, category: 'Norge', title: 'VG Utenriks', url: 'https://www.vg.no/rss/feed/?categories=1070' },
    { id:4, category: 'Norge', title: 'E24 – Alle nyheter', url: 'http://e24.no/rss2/' },
    { id:5, category: 'Norge', title: 'E24 – Børs og finans', url: 'https://e24.no/rss2/?seksjon=boers-og-finans' },
    // ... add more feeds here
    // { id:6, category: 'Internasjonal', title: 'BBC Overview', url: 'https://www.bbc.com/news/10628494' },
    { id:7, category: 'Internasjonal', title: 'BBC World News', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
    { id:8, category: 'Internasjonal', title: 'BBC Top Stories', url: 'http://feeds.bbci.co.uk/news/rss.xml' },
    // { id:9, category: 'Internasjonal', title: 'CNN Overview', url: 'https://edition.cnn.com/services/rss/' },
    { id:10, category: 'Internasjonal', title: 'CNN Top Stories', url: 'http://rss.cnn.com/rss/edition.rss' },
  
    // { id:11, category: 'Dansk', title: 'Dansk', url: 'http://www.startside.nu/rss_feeds_kategori.php?action=category&cid=1' },
  
    // ... add more feeds here
  ];


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
    }, [user, selectedFolder, setSelectedFeeds]);

    const handleFeedClick = async (feed) => {
        // First, check if user is paying - return if user is not paying
        if (!user.isPayingUser) {
            setPayingUserModalVisible(true);
            return
        }

        const newFeeds = selectedFeeds.find((x) => x.id === feed.id)
            ? selectedFeeds.filter((x) => x.id !== feed.id)
            : [...selectedFeeds, feed];

        await writeSelectedFeedsToDB(user, selectedFolder.id, newFeeds.map(feed => feed.id));

        setSelectedFeeds(newFeeds);
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