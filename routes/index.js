const express = require('express');
const mid = require('../middleware');

const router  = express.Router();

// Index Route
router.get('/', mid.isNotLoggedIn, (req, res) => {
    res.render('landing');
});

// Mobile Route
router.get('/mobile', mid.isNotLoggedIn, (req, res) => {
    res.render('mobile');
});

// About Route
router.get('/about', (req, res) => {
    res.render('about/about', {
        version: process.env.VERSION
    });
});

// Privacy Policy
router.get('/PrivacyPolicy', (req, res) => {
    res.render('about/privacy');
});

// Cookie Policy
router.get('/CookiePolicy', (req, res) => {
    res.render('about/cookie');
});

module.exports = router;
