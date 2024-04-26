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
            <Typography variant="h6">Søk etter nøkkelord</Typography>
            <form onSubmit={handleKeywordSubmit} className='form-container'>
                <TextField
                    className='input-field'
                    label="Siste dato og tidspunkt"
                    type="datetime-local"
                    value={filters.endDate}
                    onChange={handleEndDateChange}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                />
            
                <TextField
                    className='input-field'
                    label="Nøkkelord"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    size="small"
                />
                <Button type="submit">Legg til</Button>
                
                <div className="chips-container">
                    {filters.keywords.map((keyword) => (
                        <Chip color={"primary"} key={keyword} label={keyword} onDelete={handleKeywordDelete(keyword)} />
                    ))}
                </div>
            </form>
        </div>
    );
};

export default FilterBar;