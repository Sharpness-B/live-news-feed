import { useState, useEffect } from 'react';
import { TextField, Typography, Button, Chip, IconButton } from '@mui/material';
import { Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { writeCustomFeedsToDB, readCustomFeedsFromDB } from  "../../../data/services/firestore";

import { getAuth, onAuthStateChanged } from "firebase/auth";
const auth = getAuth();

import './Inputs.css';

const CustomFeedInput = ({ user, selectedFolder, setSelectedCustomFeeds, setPayingUserModalVisible }) => {
  const [feeds, setFeeds] = useState([]);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  const [showCustomInfo, setShowCustomInfo] = useState(false);
  const [addCustomStatus, setAddCustomStatus] = useState("info");

  useEffect(() => {
    const fetchFeeds = async () => {
      const feedsFromDB = await readCustomFeedsFromDB(user, selectedFolder.id);
      // unselect everything if not paying user
      if(!user.isPayingUser) { feedsFromDB.forEach(feed => {feed.isSelected = false;});}

      setFeeds(feedsFromDB);
      setSelectedCustomFeeds(feedsFromDB.filter(feed => feed.isSelected));
    }

    if (selectedFolder) {
      fetchFeeds();
    }
  }, [user, selectedFolder]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let isValid = true;
    try {
      const idToken = await auth.currentUser.getIdToken(true);
      const response = await fetch('https://validaterssfeed-5hnkoydcca-uc.a.run.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ rssUrl: url })
      });
      const result = await response.json();
      isValid = result.valid
    } catch{}

    if (isValid) {
      // main code
      const newFeed = { id: "custom_"+(feeds.length + 1), url, title, category: 'Custom', isSelected: true };
      await writeCustomFeedsToDB(user, selectedFolder.id, [...feeds, newFeed]);
      setFeeds([...feeds, newFeed]);
      
      setSelectedCustomFeeds(feeds.filter(feed => feed.isSelected));

      setAddCustomStatus("success")
    } else {
      setAddCustomStatus("error")
    }

    setUrl('');
    setTitle('');
    setShowCustomInfo(true)
  };

  const handleFeedClick = async (feed) => {
    if (!user.isPayingUser) {
        setPayingUserModalVisible(true);
        return
    }

    const updatedFeeds = feeds.map(x => {
      if (x.id === feed.id) {
        x.isSelected = !x.isSelected
      }
      return x;
    });

    setSelectedCustomFeeds(updatedFeeds.filter(feed => feed.isSelected));

    await writeCustomFeedsToDB(user, selectedFolder.id, updatedFeeds); // if it fails -> set it back to false
  };

  const handleDeleteFeed = async (feedToDelete) => {
    const updatedFeeds = feeds.filter(feed => feed.id !== feedToDelete.id);
    await writeCustomFeedsToDB(user, selectedFolder.id, updatedFeeds);

    setFeeds(updatedFeeds);
    setSelectedCustomFeeds(updatedFeeds.filter(feed => feed.isSelected));
  };

  return (
    <>
      <div className="container">
        <Typography variant="h6">Legg til egne RSS kanaler</Typography>
        <form onSubmit={handleSubmit} className="form-container">
          <TextField
            label="URL https://www.|.rss"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="input-field"
            size="small"
          />
          <TextField
            label="Beskrivelse"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            size="small"
          />
          <Button type="submit">Legg til</Button>
          <div className="chips-container">
            {feeds.map((feed, index) => (
              <Chip
                label={feed.title}
                clickable
                color={feed.isSelected ? 'primary' : 'default'}
                onClick={() => handleFeedClick(feed)}
                onDelete={() => handleDeleteFeed(feed)}
                deleteIcon={<IconButton><DeleteIcon /></IconButton>}
                key={index}
              />
            ))}
          </div>
        </form>
      </div>

      {/* New item alert */}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={showCustomInfo}
        autoHideDuration={5000}
        onClose={() => setShowCustomInfo(false)}
      >
        <Alert severity={addCustomStatus}>
          {addCustomStatus==="success" ? "Ny RSS er vellykket lagt til" : "Kunne ikke legge til RSS, sjekk URLen"}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CustomFeedInput;