import { useState, useEffect, createContext, useContext } from "react";
import { Navigate } from "react-router-dom";
import { FormControl, InputLabel, Select, MenuItem, Snackbar, Alert } from '@mui/material';
import { Grid, Typography, Chip, Box } from '@mui/material';
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

import { CookieConsentComponent } from "../../common/CookieConsentComponent";

import { useUser } from "../../../context/useUser";

import Cookies from 'js-cookie';
import hash from 'object-hash';
import FolderSelector from "./SelectFolder";


import { useFeedData } from "../../../utils/fetchFeeds";




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

  ///////////////////////
  // paying user modal //
  ///////////////////////
  const [payingUserModalIsOpen, setPayingUserModalVisible] = useState(false);

  /////////////
  // filters //
  /////////////
  const [filters, setFilters] = useState({});

  //////////////////
  // Feed content //
  //////////////////
  const { allFlattenedItems, specifiedFolderItems, isFetching } = useFeedData(user, selectedFeeds, selectedCustomFeeds, filters, selectedFolder)

  // console.log(isFetching)

  ////////////////////////
  // alert new artickle //
  ////////////////////////
  const [isNewItemAdded, setIsNewItemAdded] = useState(false);

  //////////////////
  // alert if new //
  //////////////////
  useEffect(() => {
    const consent = Cookies.get('cookieConsent');
    if (consent === 'true') {

      
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


  }
  }, [allFlattenedItems]);
  


  ////////////////
  // news feeds //
  ////////////////
  const [isPanel1Expanded, setPanel1Expanded] = useState(true);
  const [isPanel2Expanded, setPanel2Expanded] = useState(true);
  
  const panel1 = (
    <Grid item xs={isPanel1Expanded && isPanel2Expanded ? 6 : 12}>
        <Accordion expanded={isPanel1Expanded} onChange={() => setPanel1Expanded(!isPanel1Expanded)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <h2>Nyheter fra valgt mappe: {selectedFolder && selectedFolder.name}</h2>
            </AccordionSummary>
            <AccordionDetails>
                <NewsTable filtered_items={specifiedFolderItems} />
            </AccordionDetails>
        </Accordion>
    </Grid>
  );

const panel2 = (
    <Grid item xs={isPanel1Expanded && isPanel2Expanded ? 6 : 12}>
        <Accordion expanded={isPanel2Expanded} onChange={() => setPanel2Expanded(!isPanel2Expanded)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <h2>Nyheter fra alle mapper</h2>
            </AccordionSummary>
            <AccordionDetails>
                <NewsTable filtered_items={allFlattenedItems} />
            </AccordionDetails>
        </Accordion>
    </Grid>
);





  if (!user) {
    return <Navigate to="/signup" />;
  }

  return (
    <>
      <NavBar />     

      {/* Folder selector */}
      <FolderSelector user={user} folders={folders} setFolders={setFolders} />

      {/* Settings and filters */}
      <Accordion style={{ marginTop: '8px' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography marginLeft={"8px"}>{selectedFolder && selectedFolder.name} / Innstillinger</Typography>
        </AccordionSummary>
        
        <AccordionDetails>
          {/* Select feeds bar */}
          <SelectFeeds     user={user} selectedFolder={selectedFolder} selectedFeeds={selectedFeeds} setSelectedFeeds={setSelectedFeeds} setPayingUserModalVisible={setPayingUserModalVisible} />
          {/* Custom rss input */}
          <CustomFeedInput user={user} selectedFolder={selectedFolder} setSelectedCustomFeeds={setSelectedCustomFeeds} setPayingUserModalVisible={setPayingUserModalVisible} />
          {/* Filters */}
          <FilterBar user={user} selectedFolder={selectedFolder} filters={filters} setFilters={setFilters} />
        </AccordionDetails>
      </Accordion>

      {/* News feeds: selected folder and all folders */}
      <Grid container spacing={3} padding={3}>
          {isPanel2Expanded ? panel1 : panel2}
          {isPanel2Expanded ? panel2 : panel1}
      </Grid>

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

      <CookieConsentComponent />
    </>
  );
}
