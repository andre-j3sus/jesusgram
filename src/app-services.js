'use strict';

// Implementation of the logic of each of the application's functionalities

const crypto = require('crypto');
const errors = require('./app-errors');

module.exports = function (data) {

    // ------------------------- Defensive Middleware -------------------------

    /**
     * Checks if both token and userId are associated.
     * @param {String} token
     * @param {String} userId
     * @throws UNAUTHENTICATED if the token is invalid
     */
    async function checkAuthentication(token, userId) {
        if (!token)
            throw errors.UNAUTHENTICATED('Please insert your user token');

        if (userId != await data.tokenToUserId(token))
            throw errors.UNAUTHENTICATED('Please insert a valid user token');
    }

    /**
     * Checks if both userId and password are associated.
     * @param {String} userId
     * @param {String} password
     * @returns user object
     * @throws MISSING_PARAM if userId or password are missing
     * @throws UNAUTHENTICATED if the userId and password are not associated
     */
    async function checkCredentials(userId, password) {
        if (!userId || !password)
            throw errors.MISSING_PARAM('missing credentials');

        const user = await data.getUser(userId);

        if (user.hashedPassword !== getHashedPassword(password))
            throw errors.UNAUTHENTICATED({ userId, password });

        return user;
    }

    /**
     * Validates a request, checking its query parameters and/or body properties, given a schema.
     * Bad request is thrown when:
     * - a required parameter or property is missing;
     * - the type of a property is different from the expected.
     *
     * All the information (multiple parameters or properties can fail simultaneously) is thrown in a single json.
     * @param {Object} schema
     * @throws BAD_REQUEST if required parameters/properties are missing and/or the types of properties are different from the expected.
     */
    function checkBadRequest(schema) {
        const info = {};

        if (schema.query) {
            for (const param in schema.query) {
                if (!schema.query[param])
                    info[param] = "required parameter missing";
            }
        }

        if (schema.body) {
            for (const property in schema.body) {
                const value = schema.body[property].value;
                const type = schema.body[property].type;
                const required = schema.body[property].required;

                if (required && !value)
                    info[property] = "required property missing";
                else if (value && typeof value !== type)
                    info[property] = "wrong type. expected " + type + ". instead got " + typeof value;
            }
        }

        if (Object.keys(info).length > 0)
            throw errors.BAD_REQUEST(info);
    }


    // ------------------------- Users -------------------------

    /**
     * Creates a new user.
     * @param {String} userId 
     * @param {String} userName 
     * @param {String} password 
     */
    async function createUser(userId, userName, password) {
        checkBadRequest({
            body: {
                userId: { value: userId, type: 'string', required: true },
                userName: { value: userName, type: 'string', required: true },
                password: { value: password, type: 'string', required: true }
            }
        });

        if (!userName.match(/[a-zA-Z0-9]{3,20}/))
            throw errors.BAD_REQUEST({ userName: "Only alphanumeric characters. Length: [3, 30] characters" });

        if (!userId.match(/[a-z0-9]{4,30}/))
            throw errors.BAD_REQUEST({ userId: "Only lowercase letters and digits. Length: [4, 30] characters" });

        if (!password.match(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,30}/))
            throw errors.BAD_REQUEST({
                password: "Must contain at least one number, one uppercase/lowercase letter, and at least 8 or more characters"
            });

        return await data.createUser(userId, userName, getHashedPassword(password));
    }

    /**
     * Gets a user.
     * @param {String} userId 
     * @param {String} token
     * @returns the user object or null if user was not found
     */
    async function getUser(userId, token) {
        return await data.getUser(userId);
    }

    /**
     * Gets all users.
     * @returns an object with all users
     */
    async function getAllUsers(userId, token) {
        return await data.getAllUsers();
    }

    /**
     * Creates a post.
     * @param {String} userId 
     * @param {String} token 
     * @param {String} post 
     */
    async function createPost(userId, token, post) {
        checkBadRequest({
            body: {
                post: { value: post, type: 'string', required: true }
            }
        });

        await checkAuthentication(token, userId);

        return await data.createPost(userId, post);
    }

    /**
     * Gets the user dashboard.
     * @param {String} userId 
     * @param {String} token 
     */
    async function getUserDashboard(userId, token) {
        await checkAuthentication(token, userId);

        return await data.getUserDashboard(userId);
    }

    /**
     * Gets one token associated with userId.
     * @param {String} userId 
     * @returns the token
     */
    async function getToken(userId) {
        return await data.getToken(userId);
    }

    /**
     * Receives a password and returns hashed password using sha256 algorithm.
     * @param {String} password 
     * @returns hashed password
     */
    function getHashedPassword(password) {
        return crypto.createHash('sha256').update(password).digest('hex');
    }


    return {
        createUser,
        getUser,
        getAllUsers,
        createPost,
        getUserDashboard,
        checkCredentials,
        getToken
    };
};
