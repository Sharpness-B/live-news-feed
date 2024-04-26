import { Typography, Stack } from "@mui/material";
import { StyledLink } from "../common/styled";
export const SignUpMetaData = () => {
  return (
    <>
      <Typography
        component="h1"
        variant="h4"
        sx={{ fontFamily: "Poppins", fontWeight: "600" }}
      >
        Registrer bruker
      </Typography>
      <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
        <Typography
          variant="overline"
          sx={{
            color: "gray",
            fontFamily: "Poppins",
            textTransform: "capitalize",
          }}
        >
          {"Har du allerede en bruker?"}
        </Typography>
        <div style={{ width: 10 }}></div>
        <StyledLink to="/login">{"  Logg inn"}</StyledLink>
      </Stack>
    </>
  );
};
export const SignInMeta = () => {
  return (
    <>
      <Typography
        component="h1"
        variant="h4"
        sx={{
          fontFamily: "Poppins",
          fontWeight: "600",
        }}
      >
        {" Velkommen tilbake!"}
      </Typography>
      <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
        <Typography
          variant="overline"
          sx={{
            color: "gray",
            fontFamily: "Poppins",
            textTransform: "capitalize",
          }}
        >
          {"Har du ikke en bruker?"}
        </Typography>
        <div style={{ width: 10 }}></div>
        <StyledLink to="/signup">{"Registrer ny bruker"}</StyledLink>
      </Stack>
    </>
  );
};
