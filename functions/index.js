/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

const request = require('request-promise');

exports.proxy = onRequest(async (req, res) => {
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
        console.error(`Failed to fetch:`, error);
        res.status(500).send(error);
    }
});