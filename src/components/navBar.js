import { AppBar, Toolbar, Typography, Button, Avatar } from "@mui/material";
import { Box } from "@mui/system";
import { Link } from "react-router-dom";
import { useUser } from "../context/userContext";
import { logOut } from "../services/authservice";

export default function NavBar() {
  const { user } = useUser();
  const LogOut = async () => {
    try {
      await logOut();
    } catch (e) {
      console.warn(e);
    }
  };
  const HelperButtons = () => {
    return user ? (
      <>
        <Button component={Link} to="/notes">
          Notes
        </Button>
        <Button onClick={LogOut}>Logout</Button>
        <Avatar src={user.photoURL} />
      </>
    ) : (
      <>
        <Button to="/login" component={Link}>
          Login
        </Button>
        <Button to="/signup" component={Link}>
          SignUp
        </Button>
      </>
    );
  };
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        color={"inherit"}
        elevation={0}
        sx={{ borderBottom: "1px solid grey" }}
      >
        <Toolbar sx={{ display: "flex", flexDirection: "row" }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            My Note
          </Typography>
          <HelperButtons />
        </Toolbar>
      </AppBar>
    </Box>
  );
}
