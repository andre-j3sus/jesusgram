'use strict';

// Implementation of the logic of each of the application's functionalities

const errors = require('./app-errors');

module.exports = function (data) {

    /**
     * Checks if both token and userId are associated.
     * @param {String} token
     * @param {String} userId
     * @throws UNAUTHENTICATED if the token is invalid
     */
    async function checkAuthentication(token, userId) {
        if (!token)
            throw errors.UNAUTHENTICATED('Please insert your user token');

        // TODO
        /*if (userId != await data.tokenToUserId(token))
            throw errors.UNAUTHENTICATED('Please insert a valid user token');*/
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
     * Creates a new user.
     * @param {String} userId 
     * @param {String} token 
     * @param {String} post 
     */
    async function createUser(userId, userName, password) {
        checkBadRequest({
            body: {
                userId: { value: userId, type: 'string', required: true },
                userName: { value: userName, type: 'string', required: true },
                password: { value: password, type: 'string', required: true }
            }
        });

        return await data.createUser(userId, userName, password);
    }

    /**
     * Logins a user.
     * @param {String} userId 
     * @param {String} token 
     * @param {String} password 
     */
    async function loginUser(userId, token, password) {
        checkBadRequest({
            body: {
                userId: { value: userId, type: 'string', required: true },
                password: { value: password, type: 'string', required: true }
            }
        });

        await checkAuthentication(token, userId);

        await data.getUser(userId);
    }


    return {
        createPost,
        getUserDashboard,
        createUser,
        loginUser
    };
};
