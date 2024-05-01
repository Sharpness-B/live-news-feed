import { useState, useEffect, createContext, useContext } from "react";
import { Navigate } from "react-router-dom";
import { FormControl, InputLabel, Select, MenuItem, Snackbar, Alert } from '@mui/material';
import { Grid, Typography, Chip, Box } from '@mui/material';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import NavBar from "../../common/navBar";
import CustomFeedInput from './CustomFeedInput';
import FilterBar from './FilterBar';
import SelectFeeds from './SelectFeeds';
import PayingUserModal from '../../common/PayingUserModal';
import NewsTable from './NewsTable';

import { useUser } from "../../../context/useUser";
import { useInterval } from 'react-use';
import Parser from 'rss-parser';
import hash from 'object-hash';
import FolderSelector from "./SelectFolder";


// to read rss feeds
const parser = new Parser();





export default function Home() {
  const { user } = useUser();

  /////////////////////////// 
  // status of all folders //
  ///////////////////////////
  const [folders, setFolders] = useState([]);
  const selectedFolder = folders.find(obj => obj.isSelected === true);

  ////////////////////////
  // select feeds logic //
  //////////////////////// 
  const [selectedCustomFeeds, setSelectedCustomFeeds] = useState([]);
  const [selectedFeeds, setSelectedFeeds] = useState([]);


  ////////////////////////
  // alert new artickle //
  ////////////////////////
  const [isNewItemAdded, setIsNewItemAdded] = useState(false);

  ///////////////////////
  // paying user modal //
  ///////////////////////
  const [payingUserModalIsOpen, setPayingUserModalVisible] = useState(false);


  
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
  }, [selectedFeeds, selectedCustomFeeds]);

  // Fetch feeds every 10 seconds
  useInterval(fetchFeeds, 10000);

  // flatten all feeds into one item array, and then sort them after date
  const flattened_items = feedData
    .flatMap(feed => feed.data.items.map(item => ({ ...item, newspaper: feed.title })))
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));



  /////////////
  // filters //
  /////////////
  // init
  const [filters, setFilters] = useState({ keywords: [], endDate: '' });

  // filter flattened_items
  const filtered_items = flattened_items.filter(item => (
    // if empty list of keywords AND item object contains at least one key word
    (filters.keywords.length===0 || filters.keywords.some(word => JSON.stringify(item).includes(word)))
    // on or within end date
    && (item.pubDate ? (filters.endDate ? new Date(item.pubDate) >= new Date(filters.endDate) : true) : false)
  ));

  //////////////////
  // alert if new //
  //////////////////
  // State variable to store hashes
  const [itemHashes, setItemHashes] = useState([]);
  useEffect(() => {
    // Calculate hashes for current items
    const currentItemHashes = flattened_items.map(item => hash(item));
    // Compare the new list of hashes with the current state list
    const newHashes = currentItemHashes.filter(h => !itemHashes.includes(h));
    // If there are new hashes in the list, alert the user
    if (newHashes.length > 0) {
        // alert('A new hash has been added!');
        setIsNewItemAdded(true);
    }
    // Update itemHashes state to the new list only if there are changes
    if (JSON.stringify(currentItemHashes) !== JSON.stringify(itemHashes)) {
        setItemHashes(currentItemHashes);
    }
  }, [flattened_items]);



  if (!user) {
    return <Navigate to="/signup" />;
  }

  return (
    <>
      <NavBar />     

      {/* Folder selector */}
      <FolderSelector user={user} folders={folders} setFolders={setFolders} />

      {/* Settings and filters */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography marginLeft={"8px"}>{selectedFolder && selectedFolder.name} / Innstillinger</Typography>
        </AccordionSummary>
        
        <AccordionDetails>
          {/* Select feeds bar */}
          <SelectFeeds     user={user} selectedFolder={selectedFolder} selectedFeeds={selectedFeeds} setSelectedFeeds={setSelectedFeeds} setPayingUserModalVisible={setPayingUserModalVisible} />
          {/* Custom rss input */}
          <CustomFeedInput user={user} selectedFolder={selectedFolder} setSelectedCustomFeeds={setSelectedCustomFeeds} setPayingUserModalVisible={setPayingUserModalVisible} />
          {/* Filters */}
          <FilterBar user={user} filters={filters} setFilters={setFilters} />
        </AccordionDetails>
      </Accordion>

      {/* Read selected feeds (one feed)*/}
      <NewsTable filtered_items={filtered_items} />

      {/* Paying user alert */}
      <PayingUserModal open={payingUserModalIsOpen} handleClose={() => setPayingUserModalVisible(false)} />

      {/* New item alert */}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isNewItemAdded}
        autoHideDuration={5000}
        onClose={() => setIsNewItemAdded(false)}
      >
        <Alert severity="info">
          Ny artikkel
        </Alert>
      </Snackbar>
    </>
  );
}
