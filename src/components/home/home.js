import { Container, Stack, Typography, Fade } from "@mui/material";
import { Navigate, Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useUser } from "../../context/useUser";
import NavBar from "../common/navBar";
import { BlackButton } from "../common/styled";
import bookImage from "../img/home.jpg";
import Quotes from "./notes/quote";

export default function Home() {
  // const { user } = useUser();
  // if (!user) return <Navigate to="/login" />;
  return (
    <>
      {/* <NavBar /> */}
      <Fade in duration={2000}>
        <Container maxWidth="lg">
          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"space-around"}
            sx={{ height: "80vh" }}
            spacing={5}
          >
            <Container
              maxWidth="xs"
              sx={{ display: "flex", gap: 1.2, flexDirection: "column" }}
            >
              <Typography
                variant={"h2"}
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 600,
                }}
              >
                {"Oversikt og hurtighet"}
              </Typography>

              <Typography
                variant={"subtitle1"}
                sx={{
                  letterSpacing: "-0.8px",
                  fonntWeight: 300,
                  fontFamily: "Poppins",
                }}
              >
                {
                  "InfoIndeks samler nyhetsstrømmene dine på ett sted. Dette gir deg oversikt og hurtighet. Et forsprang."
                }
              </Typography>
              <BlackButton component={Link} to={"/infoindeks"}>
                {"Til InfoIndeks"}
              </BlackButton>
              {/* <BlackButton component={Link} to={"/signup"}>
                {"Registrer bruker"}
              </BlackButton> */}
            </Container>
            <LazyLoadImage
              src={bookImage}
              effect="blur"
              style={{
                boxShadow: "0px 5px 12px 2px rgba(80, 80, 80, 0.5)",
                transform: "scale(0.7)",
              }}
            />
          </Stack>
        </Container>
      </Fade>
      <footer>
        <Quotes />
      </footer>
    </>
  );
}
