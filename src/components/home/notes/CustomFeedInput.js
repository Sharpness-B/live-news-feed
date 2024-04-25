import { useState, useEffect } from 'react';
import { TextField, Button, Chip, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { writeCustomFeedsToDB, readCustomFeedsFromDB } from  "../../../data/services/firestore";

const CustomFeedInput = ({ user }) => {
  const [feeds, setFeeds] = useState([]);
  const [selectedFeeds, setSelectedFeeds] = useState([]);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    const fetchFeeds = async () => {
      const feedsFromDB = await readCustomFeedsFromDB(user);
      setFeeds(feedsFromDB);
      setSelectedFeeds(feedsFromDB.filter(feed => feed.isSelected));
    }

    fetchFeeds();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newFeed = { id: feeds.length + 1, url, title, category: 'Custom', isSelected: false };
    await writeCustomFeedsToDB(user, [...feeds, newFeed]);

    setFeeds([...feeds, newFeed]);
    setUrl('');
    setTitle('');
  };

  const handleFeedClick = async (feed) => {
    const updatedFeeds = feeds.map(x => {
      if (x.id === feed.id) {
        x.isSelected = !x.isSelected
      }
      return x;
    });
    await writeCustomFeedsToDB(user, updatedFeeds);

    setSelectedFeeds(updatedFeeds.filter(feed => feed.isSelected));
  };

  const handleDeleteFeed = async (feedToDelete) => {
    const updatedFeeds = feeds.filter(feed => feed.id !== feedToDelete.id);
    await writeCustomFeedsToDB(user, updatedFeeds);

    setFeeds(updatedFeeds);
    setSelectedFeeds(updatedFeeds.filter(feed => feed.isSelected));
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <TextField
          label="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Button type="submit">Add Feed</Button>
      </form>
      <div>
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
    </div>
  );
};

export default CustomFeedInput;