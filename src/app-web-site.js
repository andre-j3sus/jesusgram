'use strict';

// Application Web Site

const express = require('express');

module.exports = function (services, guest) {

    /**
     * Gets the token from the request.
     * @param {Object} req 
     * @returns the token from the request
     */
    function getBearerToken(req) {
        return guest.token; // To be improved...
    }


    /**
     * Gets the home page.
     * @param {Object} req 
     * @param {Object} res 
     */
    function getHomePage(req, res) {
        res.render('home');
    }

    // --------------------------- Dashboard ---------------------------
    /**
     * Gets the dashboard page.
     * @param {Object} req 
     * @param {Object} res 
     */
    async function getDashboardPage(req, res) {
        const userId = req.params.userId;
        const token = getBearerToken(req);

        try {
            const dashboard = await services.getUserDashboard(userId, token);
            res.render('dashboard', { user: userId, dashboard });
        }
        catch (error) {
            // To be improved
            res.redirect(`/`);
        }
    }

    /**
     * Creates a post on the dashboard.
     * @param {Object} req 
     * @param {Object} res 
     */
    function createPost(req, res) {
        const userId = req.params.userId;
        const token = getBearerToken(req);
        const post = req.body.post;

        try {
            services.createPost(userId, token, post);
            res.redirect(`/user/${userId}/dashboard`);
        } catch (error) {
            // To be improved
            res.redirect(`/user/${userId}/dashboard`);
        }
    }


    // --------------------------- User ---------------------------
    /**
     * Gets the profile page.
     * @param {Object} req 
     * @param {Object} res 
     */
    function getProfilePage(req, res) {
        const userId = req.params.userId;

        res.render('profile', { user: userId });
    }

    /**
     * Gets the register/login page.
     * @param {Object} req 
     * @param {Object} res 
     */
    function getRegisterLoginPage(req, res) {
        res.render('register_login');
    }

    /**
     * Registers new user.
     * @param {Object} req 
     * @param {Object} res 
     */
    async function registerUser(req, res) {
        const userName = req.body.userName;
        const userId = req.body.userId;
        const password = req.body.password;

        try {
            await services.createUser(userId, userName, password);
            res.redirect(`/user/${userId}/dashboard`);
        } catch (error) {
            // To be improved
            res.redirect(`/`);
        }
    }

    /**
     * Logins user.
     * @param {Object} req 
     * @param {Object} res 
     */
    function loginUser(req, res) {
        const userId = req.body.userId;
        const token = getBearerToken(req);
        const password = req.body.password;

        try {
            // To be improved
            res.redirect(`/user/${userId}/dashboard`);
        } catch (error) {
            // To be improved
            res.redirect(`/`);
        }
    }

    /**
     * Logout user.
     * @param {Object} req 
     * @param {Object} res 
     */
    function logoutUser(req, res) {
        const userId = req.body.userId;
        const password = req.body.password;

        try {
            // To be improved
            res.redirect('/');
        } catch (error) {
            // To be improved
            res.redirect(`/`);
        }
    }

    const router = express.Router();
    router.use(express.urlencoded({ extended: true }));

    // Homepage
    router.get('/', getHomePage);

    // Dashboard
    router.get('/user/:userId/dashboard', getDashboardPage);

    // Create post
    router.post('/user/:userId/dashboard', createPost);

    // Profile
    router.get('/user/:userId/profile', getProfilePage);

    // Register/Login page
    router.get('/user/register-login', getRegisterLoginPage);

    // Register new user
    router.post('/user/register', registerUser);

    // Login user
    router.post('/user/login', loginUser);

    // Logout user
    router.get('/user/:userId/logout', logoutUser);

    return router;
};
