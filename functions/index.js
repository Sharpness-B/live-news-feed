/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started



const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const request = require('request-promise');
const admin = require('firebase-admin');
admin.initializeApp();

const cors = require('cors');
const allowedOrigins = ['http://localhost:3000', 'https://live-news-feed-8be46.web.app/', 'https://live-news-feed-8be46.firebaseapp.com/'];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}

exports.proxy = onRequest((req, res) => {
    cors(corsOptions)(req, res, async () => {
        // Check for ID token in the 'Authorization' header
        if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
            logger.error('No Firebase ID token was passed as a Bearer token in the Authorization header.');
            res.status(403).send('Unauthorized');
            return;
        }

        // Read the ID token from the 'Authorization' header.
        let idToken = req.headers.authorization.split('Bearer ')[1];

        let decodedToken;
        try {
            // Verify the ID token
            decodedToken = await admin.auth().verifyIdToken(idToken);
        } catch (error) {
            logger.error('Error verifying Firebase ID token:', error);
            res.status(403).send('Unauthorized');
            return;
        }

        logger.info('Token is valid. User ID:', decodedToken.uid);

        const targetURLs = req.body.urls;
        if (!targetURLs) {
            res.status(400).send('Missing URLs parameter');
            return;
        }

        try {
            const responses = await Promise.all(
                targetURLs.map(url => request({url: url, method: 'GET'}))
            );
            res.send(responses);
        } catch (error) {
            logger.error(`Failed to fetch:`, error);
            res.status(500).send(error);
        }
    });
});