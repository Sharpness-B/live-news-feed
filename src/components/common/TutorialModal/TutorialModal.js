import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, MobileStepper } from '@mui/material';
import { makeStyles } from '@mui/styles';

import tutorial1img from "./tutorial1.png";
import tutorial2img from "./regex.png";

const useStyles = makeStyles({
  dialog: {
    fontFamily: "Poppins, sans-serif",
    textAlign: "center"
  },
  image: {
    width: "100%",
    height: "auto"
  }
});

const tutorialSteps = [
  {
    title: 'Velkommen til InfoIndeks!',
    imgPath: tutorial1img,
    description: 'Velg nyhetskilder eller legg til egne.'
  },
  {
    title: 'Lag egne søk og filtre for hver mappe',
    imgPath: tutorial1img,
    description: 'Filtrene og søkene blir lagret og brukt kun i mappen som er valgt'
  },
  {
    title: 'Lag avanserte filtre med regex',
    imgPath: tutorial2img,
    description: 'Alt med både Musk og Oslo: ^(?=.*Musk)(?=.*Oslo).*'
  },
  // Add more steps here
  // ...
];

const TutorialModal = ({modalOpen, setModalOpen}) => {
  useEffect(()=>{
    if (!Cookies.get('tutorialSeen')) setModalOpen(true);
  }, [])

  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);

  const handleClose = () => {
    setModalOpen(false)
    Cookies.set('tutorialSeen', 'true', { expires: 365 });
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Dialog open={modalOpen} onClose={handleClose} className={classes.dialog}>
      <DialogTitle>{tutorialSteps[activeStep].title}</DialogTitle>
      <DialogContent>
        <img src={tutorialSteps[activeStep].imgPath} alt="Tutorial" className={classes.image} />
        <Typography variant="body1">
          {tutorialSteps[activeStep].description}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Lukk
        </Button>
      </DialogActions>
      <MobileStepper
        steps={tutorialSteps.length}
        position="static"
        activeStep={activeStep}
        nextButton={
          <Button size="small" onClick={handleNext} disabled={activeStep === tutorialSteps.length - 1}>
            Neste
          </Button>
        }
        backButton={
          <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
            Tilbake
          </Button>
        }
      />
    </Dialog>
  );
};

export default TutorialModal;