import { Navigate } from "react-router-dom";
import NoteContainer from "./noteContainer";
// import { Grid } from "@mui/material";
import NoteDetails from "./notedetails";
import NavBar from "../../common/navBar";
import { useUser } from "../../../context/useUser";
import CurrentNote from "../../../context/useCurrentNote";

import { createContext, useContext, useState, useEffect } from "react";
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Grid, Typography, Chip, Box } from '@mui/material';

import { writeSelectedFeedsToDB, readSelectedFeedsFromDB } from "../../../data/services/firestore";




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





  /////////////////////////////
  // read selected rss feeds //
  /////////////////////////////
  const [feedData, setFeedData] = useState([]);

  useEffect(() => {
    const fetchFeeds = async () => {
      const allFeedsData = await Promise.all(selectedFeeds.map(async (feed) => {
        try {
          const proxyUrl = 'https://api.allorigins.win/raw?url=';
          const data = await parser.parseURL(proxyUrl + encodeURIComponent(feed.url));
          return { ...feed, data };
        } catch (error) {
          console.error(`Failed to fetch feed ${feed.title}:`, error);
        }
      }));
    
      // Filter out any feeds that failed to fetch
      const successfulFeedsData = allFeedsData.filter(Boolean);
      setFeedData(successfulFeedsData);
    };
    
    fetchFeeds();
  }, [selectedFeeds]);

  // flatten all feeds into one item array
  const items = feedData
    .flatMap(feed => feed.data.items.map(item => ({ ...item, newspaper: feed.title })))
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));






    
  if (!user) return <Navigate to="/login" />;

  return (
    <>
      <NavBar />

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
        {/* should be able to unclick and delete */}

      {/* Read selected feeds (one feed)*/}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
        {items.map((item, index) => (
          <Box key={index} sx={{ my: 1, p: 2, width: { xs: '100%', sm: '500px' }, backgroundColor: '#f6f6f6', borderRadius: '5px' }}>
            <Typography variant="h4"        sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>{item.title}</Typography>
            <Typography variant="body2"     sx={{ fontFamily: 'Poppins', letterSpacing: '-0.8px', fontWeight: 300 }}>{new Date(item.pubDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} {item.newspaper}</Typography>
            <Typography variant="subtitle1" sx={{ fontFamily: 'Poppins', letterSpacing: '-0.8px', fontWeight: 300 }}>{item.contentSnippet}</Typography>
            <a href={item.link} target="_blank" rel="noreferrer" style={{ color: 'black', textDecoration: 'none' }}>Read more</a>
          </Box>
        ))}
      </Box>

      {/* Read selected feeds (one column per source)*/}
      {/* <Box sx={{ display: 'flex', overflowX: 'auto', p: 2 }}>
        {feedData.map((feed, index) => (
          <Box 
            sx={{ 
              minWidth: '400px', 
              width: { xs: '100%', sm: '500px' },
              mr: 2, 
              p: 2, 
              wordWrap: 'break-word', 
              overflowWrap: 'break-word' 
            }} 
            key={index}
          >
            <Typography variant="h6">{feed.title}</Typography>
            {feed.data.items.map((item, index) => (
              <Box key={index} sx={{ my: 1 }}>
                <Typography variant="h6" sx={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>{item.title}</Typography>
                <Typography variant="body2" sx={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>{item.contentSnippet}</Typography>
              </Box>
            ))}
          </Box>
        ))}
      </Box> */}
    </>
  );
}
