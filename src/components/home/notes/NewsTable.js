import React, { useState, useEffect, useRef } from 'react';
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import { FixedSizeList as List } from 'react-window';
import { height } from '@mui/system';

const NewsRow = ({ item, isDeleted, handleDeleteButtonClick, isRead, markAsReadOrUnread, active, setActive, index }) => {
    const [isOpen, setIsOpen] = useState(false);
    const rowRef = useRef(null);

    const handleRowClick = () => {
        // setIsOpen(!isOpen);
        // setActive(index);  // Set this row as active
    };

    useEffect(() => setIsOpen(false), [isDeleted]);
    useEffect(() => {if (isOpen && isRead) setIsOpen(false);}, [isRead]);
    useEffect(() => {
        if (active && rowRef.current) {
            rowRef.current.focus();
        }
    }, [active]);

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
            ref={rowRef}
            onClick={handleRowClick}
            onKeyDown={(event) => {
                if (event.key === 'ArrowRight') {
                    setActive((prevActive) => prevActive + 1);
                    if (!isRead) markAsReadOrUnread();
                } else if (event.key === 'ArrowLeft') {
                    setActive((prevActive) => prevActive - 1);
                    if (!isRead) markAsReadOrUnread();
                }
            }}
            tabIndex={0}
            sx={{ 
                // cursor: 'pointer', 
                padding: '4px', 
                opacity: isDeleted ? 0.2 : (isRead ? 0.5 : 1)
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
            <TableCell style={{ width: '15px', padding: '0px', textAlign: 'right', cursor: 'pointer', }}>
                {isDeleted ? (
                    <RestoreFromTrashIcon  onClick={(event) => { event.stopPropagation(); handleDeleteButtonClick(); }} sx={{ height: '15px', verticalAlign: 'middle' }} />
                ) : (
                    <DeleteIcon onClick={(event) => { event.stopPropagation(); handleDeleteButtonClick(); }} sx={{ height: '15px', verticalAlign: 'middle' }} />
                )}
            </TableCell>
            <TableCell style={{ width: '15px', padding: '0px', textAlign: 'right', cursor: 'pointer', }}>
                {isRead ? (
                    <VisibilityIcon  onClick={(event) => { event.stopPropagation(); markAsReadOrUnread(); }} sx={{ height: '15px', verticalAlign: 'middle' }} />
                ) : (
                    <VisibilityOffIcon onClick={(event) => { event.stopPropagation(); markAsReadOrUnread(); }} sx={{ height: '15px', verticalAlign: 'middle' }} />
                )}
            </TableCell>
        </TableRow>
    );
};

const NewsTable = ({ filtered_items, isFetching, deletedItems, setDeletedItems, readItems, setReadItems }) => {
    const [activeRow, setActiveRow] = useState(0);
    
    const handleDeleteButtonClick = (id) => {
        setDeletedItems(prevItems => {
            const newItems = new Set(prevItems);
            if (newItems.has(id)) {
                newItems.delete(id);
            } else {
                newItems.add(id);
            }
            return newItems;
        });
    };
    
    const markAsReadOrUnread = (id) => {
        setReadItems(prevItems => {
            const newItems = new Set(prevItems);
            if (newItems.has(id)) {
                newItems.delete(id);
            } else {
                newItems.add(id);
            }
            return newItems;
        });
    };

    const sortedItems = [...filtered_items].sort((a, b) => {
        const aIsDeleted = deletedItems.has(a.id_hash);
        const bIsDeleted = deletedItems.has(b.id_hash);
        return aIsDeleted ? 1 : bIsDeleted ? -1 : 0;
    });

    return (
        <TableContainer>
            <List
                height={1000} // Adjust based on your requirement
                style={{height: "calc(100vh - 180px)"}}
                itemCount={sortedItems.length}
                itemSize={25} // Adjust based on the height of your rows
                width='100%' // Add a width to your List
                >
                {({ index, style }) => {
                    const item = sortedItems[index];
                    const isDeleted = deletedItems.has(item.id_hash);
                    const isRead = readItems.has(item.id_hash);
                    return (
                        <div style={style}>
                            <Table>
                            <TableBody>
                                <NewsRow
                                    key={index}
                                    item={item}
                                    isDeleted={isDeleted}
                                    handleDeleteButtonClick={() => handleDeleteButtonClick(item.id_hash)}
                                    isRead={isRead}
                                    markAsReadOrUnread={() => markAsReadOrUnread(item.id_hash)}
                                    active={index === activeRow}
                                    setActive={setActiveRow}
                                    index={index}
                                />
                            </TableBody>
                            </Table>
                        </div>
                    );
                }}
            </List>

            {isFetching && filtered_items.length === 0 && (
            <Box display="flex" justifyContent="center" alignItems="center" overflow="hidden" paddingBottom={1}>
                <CircularProgress />
            </Box>
            )}
        </TableContainer>
    );
};

export default NewsTable;