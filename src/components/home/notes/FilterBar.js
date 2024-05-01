import { useState, useEffect } from 'react';
import { TextField, Button, Chip, Typography } from '@mui/material';
import { writeFiltersToDB, readFiltersFromDB } from "../../../data/services/firestore";
import './CustomFeedInput.css';

const FilterBar = ({ user, selectedFolder, filters, setFilters }) => {
    const [searchKeywordInput, setSearchKeywordInput] = useState('');
    const [excludeKeywordInput, setExcludeKeywordInput] = useState('');
    const [filtersLoaded, setFiltersLoaded] = useState(false);

    useEffect(() => {
        const fetchFilters = async () => {
            const filtersFromDB = await readFiltersFromDB(user, selectedFolder.id);
            setFilters(filtersFromDB);
            setFiltersLoaded(true);
        }

        fetchFilters();
    }, [user, selectedFolder]);

    useEffect(() => {
        if (filtersLoaded) {
            const saveFilters = async () => {
                await writeFiltersToDB(user, selectedFolder.id, filters);
            }
        
            saveFilters();
        }
    }, [user, filters]);

    const handleSearchKeywordSubmit = (e) => {
        e.preventDefault();
        if (searchKeywordInput && !filters.searchKeywords.includes(searchKeywordInput)) {
            setFilters(prevFilters => ({ ...prevFilters, searchKeywords: [...prevFilters.searchKeywords, searchKeywordInput]}));
        }
        setSearchKeywordInput('');
    };

    const handleExcludeKeywordSubmit = (e) => {
        e.preventDefault();
        if (excludeKeywordInput && !filters.excludeKeywords.includes(excludeKeywordInput)) {
            setFilters(prevFilters => ({ ...prevFilters, excludeKeywords: [...prevFilters.excludeKeywords, excludeKeywordInput]}));
        }
        setExcludeKeywordInput('');
    };

    const handleSearchKeywordDelete = (keywordToDelete) => () => {
        setFilters(prevFilters => ({ ...prevFilters, searchKeywords: prevFilters.searchKeywords.filter(keyword => keyword !== keywordToDelete)}));
    };

    const handleExcludeKeywordDelete = (keywordToDelete) => () => {
        setFilters(prevFilters => ({ ...prevFilters, excludeKeywords: prevFilters.excludeKeywords.filter(keyword => keyword !== keywordToDelete)}));
    };

    return (
        <div className='container'>
            <Typography variant="h6">Filtrer på nøkkelord</Typography>
            <form onSubmit={handleSearchKeywordSubmit} className='form-container'>
                <TextField
                    className='input-field'
                    label="Søk etter ord"
                    value={searchKeywordInput}
                    onChange={(e) => setSearchKeywordInput(e.target.value)}
                    size="small"
                />
                <Button type="submit">Søk</Button>

                <div className="chips-container">
                    {filters.searchKeywords && filters.searchKeywords.map((keyword) => (
                        <Chip color="primary" key={keyword} label={keyword} onDelete={handleSearchKeywordDelete(keyword)} />
                    ))}
                </div>
            </form>
            <form onSubmit={handleExcludeKeywordSubmit} className='form-container'>
                <TextField
                    className='input-field'
                    label="Ekskluder ord"
                    value={excludeKeywordInput}
                    onChange={(e) => setExcludeKeywordInput(e.target.value)}
                    size="small"
                />
                <Button type="submit">Filtrer</Button>

                <div className="chips-container">
                    {filters.excludeKeywords && filters.excludeKeywords.map((keyword) => (
                        <Chip color="primary" key={keyword} label={keyword} onDelete={handleExcludeKeywordDelete(keyword)} />
                    ))}
                </div>
            </form>
        </div>
    );
};

export default FilterBar;