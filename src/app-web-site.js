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
        const userId = req.params.userId;

        res.render('home', { userId });
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
            const dashboardInOrder = dashboard ? dashboard.reverse() : dashboard;
            res.render('dashboard', { userId, dashboard: dashboardInOrder });
        }
        catch (error) {
            console.log(error);
            // To be improved
            res.redirect(`/`);
        }
    }

    /**
     * Creates a post on the dashboard.
     * @param {Object} req 
     * @param {Object} res 
     */
    async function createPost(req, res) {
        const userId = req.params.userId;
        const token = getBearerToken(req);
        const post = req.body.post;
        const inpFile = req.body.inpFile;

        try {
            await services.createPost(userId, token, post);
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
    async function getProfilePage(req, res) {
        const userId = req.params.userId;
        const token = getBearerToken(req);

        try {
            const user = await services.getUser(userId, token);

            res.render('profile', { userId, user });
        } catch (error) {
            console.log(error);
            // To be improved
            res.redirect(`/`);
        }

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
            if (error.name == 'ALREADY_EXISTS')
                res.render('register_login', { already_exists: error })
            else
                res.redirect(`/`);

            console.log(error);
        }
    }

    /**
     * Logins user.
     * @param {Object} req 
     * @param {Object} res 
     */
    async function loginUser(req, res) {
        const userId = req.body.userId;
        const token = getBearerToken(req);
        const password = req.body.password;

        try {
            await services.loginUser(userId, token, password);
            res.redirect(`/user/${userId}/dashboard`);
        } catch (error) {
            if (error.name == 'FORBIDDEN')
                res.render('register_login', { forbidden: error })
            else
                res.redirect(`/`);

            console.log(error);
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


    // --------------------------- Search Users ---------------------------
    /**
     * Gets the search page.
     * @param {Object} req 
     * @param {Object} res 
     */
    function getSearchPage(req, res) {
        const userId = req.params.userId;

        try {
            // To be improved
            res.render('search', { userId });
        } catch (error) {
            // To be improved
            res.redirect(`/`);
        }
    }

    /**
     * Search for a user
     * @param {Object} req 
     * @param {Object} res 
     */
    function searchUser(req, res) {
        const userId = req.params.userId;
        const searchedUserId = req.query.searchedUserId;

        try {
            // To be implemented
            res.redirect(`/`);
        } catch (error) {
            // To be improved
            res.redirect(`/`);
        }
    }


    const router = express.Router();
    router.use(express.urlencoded({ extended: true }));

    // Homepage
    router.get('/', getHomePage);

    // Homepage when logged in
    router.get('/user/:userId/home', getHomePage);


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


    // Search page
    router.get('/user/:userId/search', getSearchPage);

    // Search user
    router.get('/user/{{userId}}/searchUser', searchUser);

    return router;
};
