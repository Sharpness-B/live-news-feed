import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { CircularProgress, Snackbar, Alert } from '@mui/material';
import { Grid, Typography, Box } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import NavBar from "../../common/navBar";
import CustomFeedInput from './CustomFeedInput';
import FilterBar from './FilterBar';
import SelectFeeds from './SelectFeeds';
import PayingUserModal from '../../common/PayingUserModal';
import NewsTable from './NewsTable';

import { alertNewItem } from "../../../utils/alertNewItem";

import { useUser } from "../../../context/useUser";


import FolderSelector from "./SelectFolder";

import { useFeedData } from "../../../utils/fetchFeeds";

import "./Feed.css"


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

  // choose 2nd folder
  const [selected2ndDisplayFolder, setSelected2ndDisplayFolder] = useState("all");
  let secondFolderItems = selected2ndDisplayFolder === "all" ? allFlattenedItems : allFlattenedItems.filter(item => item.folderId.includes(selected2ndDisplayFolder));

  const handleChangeSelect2nd = (event) => {
    setSelected2ndDisplayFolder(event.target.value);
  };

  // choose 1st folder
  const [selected1stDisplayFolder, setSelected1stDisplayFolder] = useState("all");
  useEffect(() => {
    const selectedFolder = folders.find(obj => obj.isSelected === true);
    if (selectedFolder) {
      setSelected1stDisplayFolder(selectedFolder.id);
    }
  }, [folders]);
  let firstFolderItems = selected1stDisplayFolder === "all" ? allFlattenedItems : allFlattenedItems.filter(item => item.folderId.includes(selected1stDisplayFolder));
  
  const handleChangeSelect1st = (event) => {
    setSelected1stDisplayFolder(event.target.value);
  };

  //////////////////
  // alert if new //
  //////////////////
  const { isNewItemAdded, setIsNewItemAdded } = alertNewItem(allFlattenedItems)

  /////////////////////////////////////////
  // read and delete local storage logic //
  /////////////////////////////////////////
  //delete
  const [deletedItems, setDeletedItems] = useState(() => {
    const savedItems = localStorage.getItem('deletedItems');
    return savedItems ? new Set(JSON.parse(savedItems)) : new Set();
  });
  useEffect(() => {
    localStorage.setItem('deletedItems', JSON.stringify(Array.from(deletedItems)));
  }, [deletedItems]);

  //read
  const [readItems, setReadItems] = useState(() => {
    const savedItems = localStorage.getItem('readItems');
    return savedItems ? new Set(JSON.parse(savedItems)) : new Set();
  });
  useEffect(() => {
    localStorage.setItem('readItems', JSON.stringify(Array.from(readItems)));
  }, [readItems]);
  


  ////////////////
  // news feeds //
  ////////////////
  const [isPanel1Expanded, setPanel1Expanded] = useState(true);
  const [isPanel2Expanded, setPanel2Expanded] = useState(true);
  
  const panel1 = (
    <Grid item xs={isPanel1Expanded && isPanel2Expanded ? 6 : 12}>
      <Accordion expanded={isPanel1Expanded} onChange={() => setPanel1Expanded(!isPanel1Expanded)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <h2>Nyheter fra:</h2>
              <select className="custom-feed-select" value={selected1stDisplayFolder} onChange={handleChangeSelect1st} onClick={(e) => e.stopPropagation()}>
                <option value="all">Alle mapper</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>{folder.name}</option>
                ))}
              </select>
          </AccordionSummary>
          <AccordionDetails>
              <NewsTable filtered_items={firstFolderItems} isFetching={isFetching} deletedItems={deletedItems} setDeletedItems={setDeletedItems} readItems={readItems} setReadItems={setReadItems} />
          </AccordionDetails>
      </Accordion>
    </Grid>
  );

const panel2 = (
  <Grid item xs={isPanel1Expanded && isPanel2Expanded ? 6 : 12}>
    <Accordion expanded={isPanel2Expanded} onChange={() => setPanel2Expanded(!isPanel2Expanded)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <h2>Nyheter fra:</h2>
            <select className="custom-feed-select" value={selected2ndDisplayFolder} onChange={handleChangeSelect2nd} onClick={(e) => e.stopPropagation()}>
              <option value="all">Alle mapper</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>{folder.name}</option>
              ))}
            </select>
        </AccordionSummary>
        <AccordionDetails>
            <NewsTable filtered_items={secondFolderItems} isFetching={isFetching} deletedItems={deletedItems} setDeletedItems={setDeletedItems} readItems={readItems} setReadItems={setReadItems} />
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
      <Accordion style={{ marginTop: '0', paddingTop: '0', borderTop: '5px solid #1976d2', backgroundColor: 'rgba(0, 0, 0, 0)' }} defaultExpanded>
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

      {/* Loading status */}
      <Box position="fixed" bottom={2} right={-3} width={24} height={24} display="flex" justifyContent="center" alignItems="center">
        {isFetching ? (
          <CircularProgress size={12} color="success"/>
        ) : (
          <CheckCircleOutlineIcon color="success" fontSize="small"/>
        )}
      </Box>
    </>
  );
}
