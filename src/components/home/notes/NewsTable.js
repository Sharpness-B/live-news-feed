import React, { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';

import { Box, CircularProgress } from '@mui/material';


const NewsTable = ({ filtered_items, isFetching }) => {
    const [openArticles, setOpenArticles] = useState([]);

    return (
        <TableContainer>
            {/* Uncomment the Typography component if you want to display the title */}
            {/* <Typography variant="h6">{title}</Typography> */}
            <Table>
                <TableBody>
                    {filtered_items.map((item, index) => {
                        let date;
                        let timeString = "";
                        let isNewArticle = false;
                        
                        date = new Date(item.pubDate);
                        if (!isNaN(date.getTime())) { // check if date is valid
                            const options = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false };
                            timeString = date.toLocaleDateString('nb-NO', options);
                            timeString = timeString.replace('.,', ',');
                            // Check if the article is less than 5 minutes old
                            isNewArticle = (new Date() - date) < 5 * 60 * 1000;
                        }

                        const isOpen = openArticles[index];

                        const handleClick = () => {
                            const newOpenArticles = [...openArticles];
                            newOpenArticles[index] = !isOpen;
                            setOpenArticles(newOpenArticles);
                        };

                        return (
                            <TableRow key={index} sx={{ cursor: 'pointer', padding: '4px' }} onClick={handleClick}>
                                <TableCell component="th" scope="row" style={{ width: '20px', padding: '0px', textAlign: 'left' }}>
                                    {/* Display the image and use the title attribute to show the newspaper name on hover */}
                                    <img
                                        src={item.imageUrl}  // Image URL from the feed
                                        // alt={item.newspaper} //makes the row very tall
                                        style={{ width: '15px', height: '15px', marginTop: '4px' }} // Limit the height of the logo
                                        title={item.newspaper} // Show newspaper name when hovering over the image
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
                            </TableRow>
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





    //   <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2 }}>
    //     {filtered_items.map((item, index) => {
    //       let date;
    //       let timeString;
    //       let isNewArticle = false;
    //       try {
    //         date = new Date(item.pubDate);
    //         const options = { hour: '2-digit', minute: '2-digit', hour12: false };
    //         timeString = new Intl.DateTimeFormat('default', options).format(date);
    //         // Check if the article is less than 5 minutes old
    //         isNewArticle = (new Date() - date) < 5 * 60 * 1000;
    //       } catch {}

    //       const isOpen = openArticles[index];

    //       const handleClick = () => {
    //         const newOpenArticles = [...openArticles];
    //         newOpenArticles[index] = !isOpen;
    //         setOpenArticles(newOpenArticles);
    //       };

    //       return (
    //         <Box key={index} sx={{ my: 0.5, p: 0.5, maxWidth: '1000px', width: '100%', backgroundColor: '#f6f6f6', borderRadius: '5px', cursor: 'pointer' }} onClick={handleClick}>
    //           <Typography variant="subtitle1" sx={{ fontFamily: 'Poppins', fontWeight: 600, lineHeight: 1 }}>{item.title}</Typography>
    //           <Typography variant="caption" sx={{ fontFamily: 'Poppins', letterSpacing: '-0.8px', fontWeight: 300, display: 'inline', lineHeight: 1 }}> 
    //             {isNewArticle && <AccessAlarmIcon sx={{ fontSize: 16, verticalAlign: 'middle', color: 'red' }} />} {/* Display icon if the article is less than 5 minutes old */}
    //             {timeString} {item.newspaper} <a href={item.link} target="_blank" rel="noreferrer" style={{ color: 'black', textDecoration: 'underline', paddingLeft: '5px' }}>Les mer</a>
    //           </Typography>
    //           {isOpen && <Typography variant="body2" sx={{ fontFamily: 'Poppins', letterSpacing: '-0.8px', fontWeight: 300, lineHeight: 1 }}>{item.contentSnippet}</Typography>}
    //       </Box>
    //       );
    //     })}
    //   </Box> 