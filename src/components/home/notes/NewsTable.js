import React, { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import { Box, CircularProgress } from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import ClearIcon from '@mui/icons-material/Clear';

const NewsRow = ({ item, isRead, handleButtonClick }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleRowClick = () => {
        setIsOpen(!isOpen);
    };
    useEffect(() => setIsOpen(false), [isRead]);

    let date;
    let timeString = "";
    let isNewArticle = false;

    date = new Date(item.pubDate);
    if (!isNaN(date.getTime())) {
        const options = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false };
        timeString = date.toLocaleDateString('nb-NO', options);
        timeString = timeString.replace('.,', ',');
        isNewArticle = (new Date() - date) < 5 * 60 * 1000;
    }

    return (
        <TableRow 
            onClick={handleRowClick}
            sx={{ 
                cursor: 'pointer', 
                padding: '4px', 
                opacity: isRead ? 0.5 : 1
            }}
        >
            <TableCell component="th" scope="row" style={{ width: '20px', padding: '0px', textAlign: 'left' }}>
                <img
                    src={item.imageUrl}
                    style={{ width: '15px', height: '15px', marginTop: '4px' }}
                    title={item.newspaper}
                />
            </TableCell>
            <TableCell style={{ width: 'auto', padding: '4px' }}>
                <Typography variant="subtitle1" sx={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '0.875rem', lineHeight: 1 }}>
                    {item.title}
                </Typography>
                {isOpen && (
                    <Typography variant="body2" sx={{ fontFamily: 'Poppins', letterSpacing: '-0.8px', fontWeight: 300, lineHeight: 1 }}>
                        {item.contentSnippet}
                    </Typography>
                )}
            </TableCell>
            <TableCell style={{ width: '110px', padding: '0px', textAlign: 'center' }}>
                <Typography variant="caption" sx={{ fontFamily: '"Fira Code", monospace', letterSpacing: '0px', display: 'inline', lineHeight: 1}}>
                    {isNewArticle && <AccessAlarmIcon sx={{ fontSize: 16, verticalAlign: 'middle', color: 'red' }} />}
                    {timeString}
                </Typography>
            </TableCell>
            <TableCell style={{ width: '60px', padding: '0px', textAlign: 'right' }}>
                <a href={item.link} target="_blank" rel="noreferrer" style={{ color: 'black', textDecoration: 'underline', paddingLeft: '5px' }}>
                    Les mer
                </a>
            </TableCell>
            <TableCell style={{ width: '15px', padding: '0px', textAlign: 'right' }}>
                {isRead ? (
                    <DoneIcon  onClick={(event) => { event.stopPropagation(); handleButtonClick(); }} sx={{ height: '15px', verticalAlign: 'middle' }} />
                ) : (
                    <ClearIcon onClick={(event) => { event.stopPropagation(); handleButtonClick(); }} sx={{ height: '15px', verticalAlign: 'middle' }} />
                )}
            </TableCell>
        </TableRow>
    );
};

const NewsTable = ({ filtered_items, isFetching, readItems, setReadItems }) => {
    
    const handleButtonClick = (id) => {
        if (readItems.includes(id)) {
            setReadItems(prevItems => prevItems.filter(item => item !== id));
        } else {
            setReadItems(prevItems => [...prevItems, id]);
        }
    };

    const sortedItems = [...filtered_items].sort((a, b) => {
        const aIsRead = readItems.includes(a.id_hash);
        const bIsRead = readItems.includes(b.id_hash);
        return aIsRead ? 1 : bIsRead ? -1 : 0;
    });

    return (
        <TableContainer>
            <Table>
                <TableBody>
                    {sortedItems.map((item, index) => {
                        const isRead = readItems.includes(item.id_hash);
                        return (
                            <NewsRow
                                key={index}
                                item={item}
                                isRead={isRead}
                                handleButtonClick={() => handleButtonClick(item.id_hash)}
                            />
                        );
                    })}
                </TableBody>
            </Table>

            {isFetching && filtered_items.length===0 && (
                <Box display="flex" justifyContent="center" alignItems="center" overflow="hidden" paddingBottom={1}>
                    <CircularProgress />
                </Box>
            )}
        </TableContainer>
    );
};

export default NewsTable;