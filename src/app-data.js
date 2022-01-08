'use strict';

// Access to app data.

const crypto = require('crypto');

module.exports = () => {

    // ------------------------- Tokens -------------------------

    /**
     * Return the userId associated with the given token.
     * @param {String} token 
     * @returns the userId associated with the given token
     */
    async function tokenToUserId(token) {
        return "guestId";
    }


    /**
     * Creates a token, associating it to a userId.
     * @param {String} token 
     * @returns token
     */
    async function createToken(userId) {
        const token = crypto.randomUUID();

        try {
            // To be implemented
        }
        catch (err) {
            console.log(err);
            // To be improved
        }

        return token;
    }


    // ------------------------- Users -------------------------

    /**
     * Creates a new user given its id, name and password.
     * @param {String} userId 
     * @param {String} userName 
     * @param {String} password 
     * @returns an object with the new user information
     */
    async function createNewUser(userId, userName, password) {
        // To be implemented
        return {};
    }


    /**
     * Gets an user.
     * @param {String} userId 
     * @returns the user object
     * @throws NOT_FOUND if the user doesn't exist
     */
    async function getUser(userId) {
        // To be implemented
        return {};
    }

    /**
     * Creates a post.
     * @param {String} userId 
     * @param {String} post 
     * @returns the post object
     */
    async function createPost(userId, post) {
        // To be implemented
        return {};
    }

    /**
     * Gets the user dashboard.
     * @param {String} userId 
     * @returns the dashboard object
     */
    async function getUserDashboard(userId) {
        // To be implemented
        return {};
    }

    return {
        //-- User --
        createNewUser,
        getUser,
        createPost,
        getUserDashboard,

        //-- Tokens --
        tokenToUserId
    };
}
