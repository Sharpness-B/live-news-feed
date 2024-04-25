import { useState } from 'react';
import { TextField, Button, Chip, Typography } from '@mui/material';

import { useEffect } from 'react';
import { writeFiltersToDB, readFiltersFromDB } from "../../../data/services/firestore";

import './CustomFeedInput.css';

const FilterBar = ({ user }) => {
    const [keywords, setKeywords] = useState([]);
    const [endDate, setEndDate] = useState('');
    const [keywordInput, setKeywordInput] = useState('');
    const [filtersLoaded, setFiltersLoaded] = useState(false); // New state variable
  
    useEffect(() => {
      const fetchFilters = async () => {
        const filtersFromDB = await readFiltersFromDB(user);
        setKeywords(filtersFromDB.keywords);
        setEndDate(filtersFromDB.endDate);
        setFiltersLoaded(true); // Set filtersLoaded to true after loading
      }
  
      fetchFilters();
    }, [user]);
  
    useEffect(() => {
      if (filtersLoaded) { // Only save if filters have been loaded
        const saveFilters = async () => {
          await writeFiltersToDB(user, { keywords, endDate });
        }
        
        saveFilters();
      }
    }, [keywords, endDate, filtersLoaded, user]); // Add filtersLoaded as a dependency




  const handleKeywordSubmit = (e) => {
    e.preventDefault();
    if (keywordInput && !keywords.includes(keywordInput)) {
      setKeywords([...keywords, keywordInput]);
    }
    setKeywordInput('');
  };

  const handleKeywordDelete = (keywordToDelete) => () => {
    setKeywords((keywords) => keywords.filter((keyword) => keyword !== keywordToDelete));
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  return (
    <div className='container'>
        <Typography variant="h6">Search for keywords</Typography>
        <form onSubmit={handleKeywordSubmit} className='form-container'>
            <TextField
                className='input-field'
                label="End Date"
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
            />
            
            <TextField
                className='input-field'
                label="Keyword"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
            />
            <Button type="submit">Add Keyword</Button>
            
            <div className="chips-container">
                {keywords.map((keyword) => (
                    <Chip key={keyword} label={keyword} onDelete={handleKeywordDelete(keyword)} />
                ))}
            </div>
        </form>
    </div>
  );
};

export default FilterBar;