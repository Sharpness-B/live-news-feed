// CookieConsentComponent.js
import React, { useEffect, useState } from 'react';
import { Snackbar, Button } from '@mui/material';
import Cookies from 'js-cookie';

export function CookieConsentComponent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const consent = Cookies.get('cookieConsent');
    if (!consent) {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    Cookies.set('cookieConsent', 'true', { expires: 365 }); // Cookie consent for 1 year
    setOpen(false);
  };

  const handleDismiss = () => {
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      message="Vi bruker informasjonskapsler for å forbedre opplevelsen din og gi deg nyhetsvarsler."
      action={
        <>
          <Button variant="contained" color="primary" size="small" onClick={handleAccept}>
            Godta
          </Button>
          <Button color="inherit" size="small" onClick={handleDismiss}>
            Avvis
          </Button>
        </>
      }
    />
  );
}