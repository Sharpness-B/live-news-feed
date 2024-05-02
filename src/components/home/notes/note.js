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

import { useUser } from "../../../context/useUser";

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

  ////////////////////////
  // alert new artickle //
  ////////////////////////
  const [isNewItemAdded, setIsNewItemAdded] = useState(false);

  ///////////////////////
  // paying user modal //
  ///////////////////////
  const [payingUserModalIsOpen, setPayingUserModalVisible] = useState(false);

  /////////////
  // filters //
  /////////////
  const [filters, setFilters] = useState({ searchKeywords: [], excludeKeywords: [] });

  //////////////////
  // Feed content //
  //////////////////
  const { allFlattenedItems, specifiedFolderItems } = useFeedData(user, selectedFeeds, selectedCustomFeeds, filters, selectedFolder)



  //////////////////
  // alert if new //
  //////////////////
  // State variable to store hashes
  // const [itemHashes, setItemHashes] = useState([]);
  // useEffect(() => {
  //   // Calculate hashes for current items
  //   const currentItemHashes = flattened_items.map(item => hash(item));
  //   // Compare the new list of hashes with the current state list
  //   const newHashes = currentItemHashes.filter(h => !itemHashes.includes(h));
  //   // If there are new hashes in the list, alert the user
  //   if (newHashes.length > 0) {
  //       // alert('A new hash has been added!');
  //       setIsNewItemAdded(true);
  //   }
  //   // Update itemHashes state to the new list only if there are changes
  //   if (JSON.stringify(currentItemHashes) !== JSON.stringify(itemHashes)) {
  //       setItemHashes(currentItemHashes);
  //   }
  // }, [flattened_items]);


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
    </>
  );
}
