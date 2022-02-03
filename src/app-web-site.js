'use strict';

// Application Web Site

const express = require('express');
const upload = require("./upload");

module.exports = function (services) {

    /**
     * Gets the userId from the request.
     * @param {Object} req 
     * @returns the userId from the request
     */
    function getUserId(req) {
        return req.user && req.user.userId;
    }

    /**
     * Gets the token from the request.
     * @param {Object} req 
     * @returns the token from the request
     */
    function getBearerToken(req) {
        return req.user && req.user.token;
    }

    /**
     * Gets the home page.
     * @param {Object} req 
     * @param {Object} res 
     */
    function getHomePage(req, res) {
        res.render('home', { user: req.user });
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
            res.render(
                'dashboard',
                {
                    user: req.user,
                    dashboard: dashboardInOrder
                }
            );
        }
        catch (error) {
            console.log(error);
            res.render('error', { error });
        }
    }

    /**
     * Creates a post on the dashboard.
     * @param {Object} req 
     * @param {Object} res 
     */
    async function createPost(req, res) {
        await upload(req, res);
        console.log(req.body);
        const userId = req.params.userId;
        const token = getBearerToken(req);
        const post = req.body.post;
        const image = req.body.image;

        try {
            await services.createPost(userId, token, post);
            res.redirect(`/user/${userId}/dashboard`);
        } catch (error) {
            console.log(error);
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

        try {
            const userProfile = await services.getUser(userId);
            const myProfile = userProfile.userId == req.user.userId;
            const follows = !myProfile && req.user.following.some((following) => following == userProfile.userId);

            res.render('profile', { user: req.user, userProfile, myProfile, follows });
        } catch (error) {
            console.log(error);
            res.render('error', { error });
        }
    }

    /**
     * Follows a user.
     * @param {Object} req 
     * @param {Object} res 
     */
    async function followUser(req, res) {
        const userId = req.params.userId;

        try {
            const userToFollow = await services.getUser(userId);
            const user = await services.followUser(req.user, userToFollow);
            req.logIn(user, (err) => { });

            res.redirect(`/user/${userToFollow.userId}/profile`);
        } catch (error) {
            console.log(error);
            res.render('error', { error });
        }
    }

    /**
     * Unfollows a user.
     * @param {Object} req 
     * @param {Object} res 
     */
    async function unfollowUser(req, res) {
        const userId = req.params.userId;

        try {
            const userToUnfollow = await services.getUser(userId);
            const user = await services.unfollowUser(req.user, userToUnfollow);
            req.logIn(user, (err) => { });

            res.redirect(`/user/${userToUnfollow.userId}/profile`);
        } catch (error) {
            console.log(error);
            res.render('error', { error });
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
     * Register and logins a new user.
     * @param {Object} req 
     * @param {Object} res 
     */
    async function registerUser(req, res) {
        const userName = req.body.userName;
        const userId = req.body.userId;
        const password = req.body.password;

        try {
            await services.createUser(userId, userName, password);
            doLogin(req, res);
        } catch (error) {
            if (error.name == 'ALREADY_EXISTS')
                res.render('register_login', { already_exists: error })
            else {
                console.log(error);
                res.render('error', { error });
            }
        }
    }


    /**
     * Logins user
     * @param {Object} req 
     * @param {Object} res 
     */
    async function doLogin(req, res) {
        const userId = req.body.userId;
        const password = req.body.password;

        try {
            const user = await services.checkCredentials(userId, password);
            user.userId = userId;
            user.token = await services.getToken(userId);

            req.login(user, err => {
                if (err)
                    console.log('LOGIN ERROR', err);

                res.redirect(`/user/${userId}/dashboard`);
            });
        } catch (error) {

            if (error.name == 'UNAUTHENTICATED')
                res.render('register_login', { unauthenticated: error })
            else {
                console.log('LOGIN EXCEPTION', error);
                res.render('error', { error });
            }
        }
    }

    /**
     * Logouts user
     * @param {Object} req 
     * @param {Object} res 
     */
    async function doLogout(req, res) {
        req.logout();
        res.redirect('/');
    }


    // --------------------------- Search Users ---------------------------
    /**
     * Gets the search page.
     * @param {Object} req 
     * @param {Object} res 
     */
    async function getSearchPage(req, res) {
        try {
            const users = await services.getAllUsers();
            res.render('find_people', { user: req.user, users });
        } catch (error) {
            res.render('error', { error });
        }
    }

    /**
     * Search for a user
     * @param {Object} req 
     * @param {Object} res 
     */
    async function searchUser(req, res) {
        const searchedUserId = req.query.searchedUserId;

        try {
            const user = await services.getUser(searchedUserId);

            if (user)
                res.redirect(`/user/${user.userId}/profile`)
            else {
                const users = await services.getAllUsers();
                res.render('find_people', { user: req.user, users, notFound: searchedUserId });
            }
        } catch (error) {
            res.render('error', { error });
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

    // Follow
    router.post('/user/:userId/followers', followUser);

    // Unfollow
    router.post('/user/:userId/followers/unfollow', unfollowUser); // To be replaced


    // Register/Login page
    router.get('/register-login', getRegisterLoginPage);

    // Register new user
    router.post('/register', registerUser);

    // Login user
    router.post('/login', doLogin);

    // Logout user
    router.get('/logout', doLogout);


    // Search page
    router.get('/user/:userId/search', getSearchPage);

    // Search user
    router.get('/user/:userId/searchUser', searchUser);

    return router;
};
