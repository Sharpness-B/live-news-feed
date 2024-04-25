import { useState, useEffect } from 'react';
import { TextField, Button, Chip, Typography } from '@mui/material';
import { writeFiltersToDB, readFiltersFromDB } from "../../../data/services/firestore";
import './CustomFeedInput.css';

const FilterBar = ({ user, filters, setFilters }) => {
    // const [filters, setFilters] = useState({ keywords: [], endDate: '' });
    const [keywordInput, setKeywordInput] = useState('');
    const [filtersLoaded, setFiltersLoaded] = useState(false);
  
    useEffect(() => {
        const fetchFilters = async () => {
            const filtersFromDB = await readFiltersFromDB(user);
            setFilters(filtersFromDB);
            setFiltersLoaded(true);
        }
  
        fetchFilters();
    }, [user]);
  
    useEffect(() => {
        if (filtersLoaded) {
            const saveFilters = async () => {
                await writeFiltersToDB(user, filters);
            }
        
            saveFilters();
        }
    }, [filters, filtersLoaded, user]);

    const handleKeywordSubmit = (e) => {
        e.preventDefault();
        if (keywordInput && !filters.keywords.includes(keywordInput)) {
            setFilters(prevFilters => ({ ...prevFilters, keywords: [...prevFilters.keywords, keywordInput]}));
        }
        setKeywordInput('');
    };

    const handleKeywordDelete = (keywordToDelete) => () => {
        setFilters(prevFilters => ({ ...prevFilters, keywords: prevFilters.keywords.filter(keyword => keyword !== keywordToDelete)}));
    };

    const handleEndDateChange = (e) => {
        setFilters(prevFilters => ({ ...prevFilters, endDate: e.target.value}));
    };

    return (
        <div className='container'>
            <Typography variant="h6">Search for keywords</Typography>
            <form onSubmit={handleKeywordSubmit} className='form-container'>
                <TextField
                    className='input-field'
                    label="End Date"
                    type="date"
                    value={filters.endDate}
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
                    {filters.keywords.map((keyword) => (
                        <Chip key={keyword} label={keyword} onDelete={handleKeywordDelete(keyword)} />
                    ))}
                </div>
            </form>
        </div>
    );
};

export default FilterBar;