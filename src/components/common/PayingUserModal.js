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
                {"Begrenset tilgang"}
                <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close" style={{position: 'absolute', right: 16, top: 4}}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Oppgrader til en betalt bruker for å få tilgang til flere nyhetsstrømmer og for å legge til dine egne.
                </DialogContentText>
                <DialogContentText>
                    <br />
                    Ta kontakt for å komme i gang: <a href="mailto:mail@sales.com" style={{color: 'inherit', textDecoration: 'none'}}>mail@sales.com</a>
                </DialogContentText>
            </DialogContent>
        </Dialog>
    );
};

export default PayingUserModal;