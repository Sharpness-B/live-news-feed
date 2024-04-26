import { useState, useEffect } from 'react';
import { TextField, Typography, Button, Chip, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { writeCustomFeedsToDB, readCustomFeedsFromDB } from  "../../../data/services/firestore";

import './CustomFeedInput.css';

const CustomFeedInput = ({ user, setSelectedCustomFeeds, setPayingUserModalVisible }) => {
  const [feeds, setFeeds] = useState([]);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    const fetchFeeds = async () => {
      const feedsFromDB = await readCustomFeedsFromDB(user);
      setFeeds(feedsFromDB);

      // No selected if not paying user
      if (!user.isPayingUser) {
        setSelectedCustomFeeds([])
        return
      }

      // Set selected custom feeds
      setSelectedCustomFeeds(feedsFromDB.filter(feed => feed.isSelected));
    }

    fetchFeeds();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newFeed = { id: "custom_"+(feeds.length + 1), url, title, category: 'Custom', isSelected: false };
    await writeCustomFeedsToDB(user, [...feeds, newFeed]);

    setFeeds([...feeds, newFeed]);
    setUrl('');
    setTitle('');
  };

  const handleFeedClick = async (feed) => {
    // First, check if user is paying - return if user is not paying
    if (!user.isPayingUser) {
        setPayingUserModalVisible(true);
        return
    }

    // handleFeedClick logic
    const updatedFeeds = feeds.map(x => {
      if (x.id === feed.id) {
        x.isSelected = !x.isSelected
      }
      return x;
    });
    await writeCustomFeedsToDB(user, updatedFeeds);

    setSelectedCustomFeeds(updatedFeeds.filter(feed => feed.isSelected));
  };

  const handleDeleteFeed = async (feedToDelete) => {
    const updatedFeeds = feeds.filter(feed => feed.id !== feedToDelete.id);
    await writeCustomFeedsToDB(user, updatedFeeds);

    setFeeds(updatedFeeds);
    setSelectedCustomFeeds(updatedFeeds.filter(feed => feed.isSelected));
  };

  return (
    <div className="container">
      <Typography variant="h6">Add custom RSS feeds</Typography>
      <form onSubmit={handleSubmit} className="form-container">
        <TextField
          label="URL https://www.website.rss"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="input-field"
          size="small"
        />
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field"
          size="small"
        />
        <Button type="submit">Add Feed</Button>
        <div className="chips-container">
          {feeds.map((feed, index) => (
            <Chip
              label={feed.title}
              clickable
              color={feed.isSelected && user.isPayingUser ? 'primary' : 'default'}
              onClick={() => handleFeedClick(feed)}
              onDelete={() => handleDeleteFeed(feed)}
              deleteIcon={<IconButton><DeleteIcon /></IconButton>}
              key={index}
            />
          ))}
        </div>
      </form>
    </div>
  );
};

export default CustomFeedInput;