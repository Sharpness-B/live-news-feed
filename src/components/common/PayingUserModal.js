import { Dialog, DialogContent, DialogContentText, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const PayingUserModal = ({ open, handleClose }) => {
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title" style={{position: 'relative'}}>
                {"Access Restricted"}
                <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close" style={{position: 'absolute', right: 16, top: 4}}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    To access custom RSS feeds and add your own, you need to be a paying user.
                </DialogContentText>
                <DialogContentText>
                    <br />
                    Contact sales: <a href="mailto:mail@sales.com" style={{color: 'inherit', textDecoration: 'none'}}>mail@sales.com</a>
                </DialogContentText>
            </DialogContent>
        </Dialog>
    );
};

export default PayingUserModal;