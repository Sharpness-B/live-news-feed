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

const { customParserCheck } = require('./customParserCheck');
const Parser = require('rss-parser');
const parser = new Parser();

const cors = require('cors');
const allowedOrigins = ['http://localhost:3000', 'https://live-news-feed-8be46.web.app', 'https://live-news-feed-8be46.firebaseapp.com', 'https://validaterssfeed-5hnkoydcca-uc.a.run.app/', 'https://validaterssfeed-5hnkoydcca-uc.a.run.app'];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}

async function validateAuthToken(req, res) {
    // Check for ID token in the 'Authorization' header
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        logger.error('No Firebase ID token was passed as a Bearer token in the Authorization header.');
        res.status(403).send('Unauthorized');
        return null;
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
        return null;
    }

    logger.info('Token is valid. User ID:', decodedToken.uid);
    return decodedToken;
}

exports.proxy = onRequest((req, res) => {
    cors(corsOptions)(req, res, async () => {
        const decodedToken = await validateAuthToken(req, res);
        if (!decodedToken) return;

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

exports.validateRssFeed = onRequest(async (req, res) => {
    cors(corsOptions)(req, res, async () => {
        const decodedToken = await validateAuthToken(req, res);
        if (!decodedToken) return;

        const rssUrl = req.body.rssUrl;
        if (!rssUrl) {
            res.status(400).send('Missing rssUrl parameter');
            return;
        }

        logger.warn("run")

        try {
            await parser.parseURL(rssUrl);  // This will throw an error if the URL is not a valid RSS feed
            logger.warn("pass1")
            res.send({ valid: true });
        } catch (error) {
            try {
                const xml = await request(rssUrl);  // Fetch the XML content of the RSS feed
                await customParserCheck(xml);  // This will throw an error if the content is not valid XML or if custom parser does not work
                logger.warn("pass2")
                res.send({ valid: true });
            } catch (error) {
                logger.error(`Failed to validate RSS feed:`, error);
                res.send({ valid: false });
            }
        }
    });
});