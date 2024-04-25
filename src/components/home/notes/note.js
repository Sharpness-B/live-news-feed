import { Navigate } from "react-router-dom";
import NoteContainer from "./noteContainer";
// import { Grid } from "@mui/material";
import NoteDetails from "./notedetails";
import NavBar from "../../common/navBar";
import { useUser } from "../../../context/useUser";
import CurrentNote from "../../../context/useCurrentNote";

import CustomFeedInput from './CustomFeedInput';

import { createContext, useContext, useState, useEffect } from "react";
import { FormControl, InputLabel, Select, MenuItem, Snackbar, Alert } from '@mui/material';
import { Grid, Typography, Chip, Box } from '@mui/material';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';

import { writeSelectedFeedsToDB, readSelectedFeedsFromDB } from "../../../data/services/firestore";


import { useInterval } from 'react-use';


import hash from 'object-hash'; 




import Parser from 'rss-parser';


// to read rss feeds
const parser = new Parser();



const feeds = [
  // { id:1, category: 'Norway', title: 'VG Forsiden', url: 'https://www.vg.no/rss/feed/forsiden/' },
  { id:2, category: 'Norway', title: 'VG Innenriks', url: 'https://www.vg.no/rss/feed/?categories=1069' },
  { id:3, category: 'Norway', title: 'VG Utenriks', url: 'https://www.vg.no/rss/feed/?categories=1070' },
  { id:4, category: 'Norway', title: 'E24 – Alle nyheter', url: 'http://e24.no/rss2/' },
  { id:5, category: 'Norway', title: 'E24 – Børs og finans', url: 'https://e24.no/rss2/?seksjon=boers-og-finans' },
  // ... add more feeds here
  // { id:6, category: 'International', title: 'BBC Overview', url: 'https://www.bbc.com/news/10628494' },
  { id:7, category: 'International', title: 'BBC World News', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { id:8, category: 'International', title: 'BBC Top Stories', url: 'http://feeds.bbci.co.uk/news/rss.xml' },
  // { id:9, category: 'International', title: 'CNN Overview', url: 'https://edition.cnn.com/services/rss/' },
  { id:10, category: 'International', title: 'CNN Top Stories', url: 'http://rss.cnn.com/rss/edition.rss' },

  { id:11, category: 'Danish', title: 'Dansk', url: 'http://www.startside.nu/rss_feeds_kategori.php?action=category&cid=1' },

  // ... add more feeds here
];









export default function Home() {
  const { user } = useUser();



  ////////////////////////
  // select feeds logic //
  //////////////////////// 
  const [selectedCustomFeeds, setSelectedCustomFeeds] = useState([]);
  const [selectedFeeds, setSelectedFeeds] = useState([]);

  // Fetch selected feeds from DB on component mount
  useEffect(() => {
    const fetchSelectedFeeds = async () => {
      try {
        const id_list = await readSelectedFeedsFromDB(user);
        
        // Find the feeds corresponding to the ids
        const selectedFeeds = feeds.filter(feed => id_list.includes(feed.id));
        
        // Set the found feeds as the initial state
        setSelectedFeeds(selectedFeeds);
      } catch (error) {
        console.log("Database error: could not fetch previously selected news feeds", error);
      }
    }
    
    fetchSelectedFeeds();
  }, []); // Empty dependency array means this effect runs once on mount

  

  const handleFeedClick = (feed) => {
    setSelectedFeeds((prevFeeds) => {
      const newFeeds = prevFeeds.find((x) => x.id === feed.id)
        ? prevFeeds.filter((x) => x.id !== feed.id)
        : [...prevFeeds, feed];
        
      const updateFeeds = async () => {
        try {
          const id_list = newFeeds.map(item => item.id);
          const id = await writeSelectedFeedsToDB(user, id_list);
        } catch (error) {
          console.log("Database error: could not save set of news feeds", error);
        }
      }
      
      // Call the async function
      updateFeeds();
    
      // Return the updated feeds to update the state
      return newFeeds;
    })
  };




  ////////////////////////
  // alert new artickle //
  ////////////////////////
  const [isNewItemAdded, setIsNewItemAdded] = useState(true);




  /////////////////////////////
  // read selected rss feeds //
  /////////////////////////////
  const [feedData, setFeedData] = useState([]);
  const [hashes, setHashes] = useState(new Set());

  const fetchFeeds = async () => {
    // Create a local copy of hashes state
    let currentHashes = new Set(hashes);

    const mergedFeeds = [...selectedFeeds, ...selectedCustomFeeds];
  
    const allFeedsData = await Promise.all(mergedFeeds.map(async (feed) => {
      try {
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const data = await parser.parseURL(proxyUrl + encodeURIComponent(feed.url));
  
        // Map the items, adding an 'isNew' property
        data.items = data.items.map(item => {
          const itemHash = hash(item);
          const isNew = !currentHashes.has(itemHash) && currentHashes.size; //if not has from before and not emptry (first load)
          // Add the new hash to currentHashes
          if(isNew) {
            currentHashes.add(itemHash);
            setIsNewItemAdded(true); // alert
          }
          return { ...item, isNew };
        });

        return { ...feed, data };
      } 
      catch (error) {
        console.error(`Failed to fetch feed ${feed.title}:`, error);
        return null; // return null for feeds that failed to fetch
      }
    }));

    // Filter out any feeds that failed to fetch
    const successfulFeedsData = allFeedsData.filter(Boolean);

    // Update the set of item hashes state
    setHashes(currentHashes);

    setFeedData(successfulFeedsData);
  }

  // Fetch feeds initially when selectedFeeds changes
  useEffect(() => {
    fetchFeeds();
  }, [selectedFeeds]);

  // Fetch feeds every 10 seconds
  useInterval(fetchFeeds, 10000);

  // flatten all feeds into one item array
  const items = feedData
    .flatMap(feed => feed.data.items.map(item => ({ ...item, newspaper: feed.title })))
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));







    
  if (!user) return <Navigate to="/login" />;

  return (
    <>
      <NavBar />
      {/* New item alert */}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isNewItemAdded}
        autoHideDuration={5000}
        onClose={() => setIsNewItemAdded(false)}
      >
        <Alert severity="error">
          A new article has been added!
        </Alert>
      </Snackbar>

      {/* Select feeds bar */}
      <Box sx={{ display: 'flex', overflowX: 'auto', whiteSpace: 'nowrap', p: 4}}>
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

      {/* Add filter feeds bar */}
      <CustomFeedInput user={user} setSelectedCustomFeeds={setSelectedCustomFeeds} />

        

      {/* Read selected feeds (one feed)*/}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
        {items.map((item, index) => {
          let date;
          let timeString;
          let isNewArticle = false;
          try {
            date = new Date(item.pubDate);
            const options = { hour: '2-digit', minute: '2-digit', hour12: false};
            timeString = new Intl.DateTimeFormat('default', options).format(date);
            // Check if the article is less than 5 minutes old
            isNewArticle = (new Date() - date) < 5 * 60 * 1000;
          } catch {}

          return (
            <Box key={index} sx={{ my: 1, p: 2, width: { xs: '100%', sm: '500px' }, backgroundColor: '#f6f6f6', borderRadius: '5px' }}>
              <Typography variant="h4" sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>{item.title}</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Poppins', letterSpacing: '-0.8px', fontWeight: 300 }}>
                {isNewArticle && <AccessAlarmIcon sx={{ fontSize: 20, verticalAlign: 'middle', color: 'red' }} />} {/* Display icon if the article is less than 5 minutes old */}
                {timeString} {item.newspaper}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontFamily: 'Poppins', letterSpacing: '-0.8px', fontWeight: 300 }}>{item.contentSnippet}</Typography>
              <a href={item.link} target="_blank" rel="noreferrer" style={{ color: 'black', textDecoration: 'none' }}>Read more</a>
            </Box>
          );
        })}
      </Box>
    </>
  );
}
