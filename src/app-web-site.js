'use strict';

// Application Web Site

const express = require('express');

module.exports = function (services, guest) {

    /**
     * Gets the home page.
     * @param {Object} req 
     * @param {Object} res 
     */
    function getHomepage(req, res) {
        res.render('home');
    }

    /**
     * Gets the dashboard page.
     * @param {Object} req 
     * @param {Object} res 
     */
    function getDashboard(req, res) {
        res.render('dashboard');
    }

    /**
     * Gets the profile page.
     * @param {Object} req 
     * @param {Object} res 
     */
    function getProfile(req, res) {
        res.render('profile');
    }

    const router = express.Router();
    router.use(express.urlencoded({ extended: true }));

    // Homepage
    router.get('/', getHomepage);

    // Dashboard
    router.get('/dashboard', getDashboard);

    // Profile
    router.get('/user/profile', getProfile);

    return router;
};
