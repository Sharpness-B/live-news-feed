import {
  AppBar,
  Toolbar,
  Avatar,
  Button,
  Box,
  ClickAwayListener,
  ListItemText,
  MenuItem,
  Paper,
} from "@mui/material";
import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../context/useUser";
import { logOut } from "../../data/services/authservice";
import { LogoLink } from "./styled";

import TutorialModal from "./TutorialModal/TutorialModal";

export default function NavBar() {
  const { user, userInfo } = useUser();
  // menu
  const [open, setOpen] = useState(false);

  // tutorial modal
  const [tutorialModalOpen, setTutorialModalOpen] = useState(false);  

  const LogOut = useCallback(async () => {
    try {
      await logOut();
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // if no user or loading, nothing shows
  if (!user) return null;

  return (
    <AppBar position="static" color={"inherit"}>
      <Toolbar sx={{ display: "flex", flexDirection: "row" }}>
        <div style={{ flexGrow: 1 }}>
          <LogoLink variant="text" component={Link} to="/">
            {"InfoIndeks"}
          </LogoLink>
        </div>
        <Button onClick={()=>setTutorialModalOpen(true)}>Info</Button>

        <ClickAwayListener onClickAway={handleClose}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              onClick={handleToggle}
              src={(userInfo && userInfo.photoURL) || user.photoURL}
              sx={{
                ml: 1,
                border: "2px dashed gray",
                transition: "250ms ease-in-out",
                "&:hover": {
                  cursor: "pointer",
                  transform: "scale(1.2)",
                },
              }}
            />
            {open && (
              <Paper 
                sx={{ 
                  position: 'absolute', 
                  top: '100%', 
                  right: 0, 
                  mt: 1, 
                  minWidth: 150,
                  zIndex: 1 
                }}
              >
                <MenuItem component={Link} to="/profile" onClick={handleClose}>
                  <ListItemText primary="Konto" />
                </MenuItem>
                <MenuItem
                  onClick={async () => {
                    await LogOut();
                    handleClose();
                  }}
                  component={Link}
                  to="/"
                >
                  <ListItemText primary="Logg ut" />
                </MenuItem>
              </Paper>
            )}
          </Box>
        </ClickAwayListener>
      </Toolbar>
      
      <TutorialModal modalOpen={tutorialModalOpen} setModalOpen={setTutorialModalOpen} onClose={() => setTutorialModalOpen(false)} />
    </AppBar>
  );
}
