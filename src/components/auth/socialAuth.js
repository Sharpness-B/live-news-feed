import React from "react";
import { styled, Button, Stack } from "@mui/material";
import {
  signInWithGoogle,
  signWithMicrosoft
} from "../../data/services/authservice";
import { FaMicrosoft, FaGoogle } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const SocialButton = styled(Button)({
  fontFamily: "Poppins",
  fontWeight: 500,
  color: "darkslategray",
  padding: "10px 20px",
  textTransform: "capitalize",
  transition: "300ms ease-in",
  "&:hover": {
    color: "black",
    transform: "translateY(-15px)",
    backgroundColor: "transparent",
  },
});

export const SignWithGoggleButton = () => (
  <SocialButton onClick={signInWithGoogle} startIcon={<FaGoogle />}>
    {"Google"}
  </SocialButton>
);

export const SignWithMicrosoftButton = () => {
  const navigate = useNavigate();

  return (
    <SocialButton onClick={()=>{signWithMicrosoft().then(()=>navigate('/infoindeks'));}} startIcon={<FaMicrosoft />}>
      Microsoft
    </SocialButton>
  );
};

const SocialAuth = () => {
  return (
    <Stack
      direction={"row"}
      justifyContent={"space-around"}
      sx={{ width: "100%", mb: 1 }}
    >
      <SignWithGoggleButton />
      {/* <SignWithMicrosoftButton /> */}
    </Stack>
  );
};
export default SocialAuth;
