'use strict';

// Access to app data.

const crypto = require('crypto');
const errors = require('./app-errors');

module.exports = function (db) {

    // ------------------------- Tokens -------------------------

    /**
     * Return the userId associated with the given token.
     * @param {String} token 
     * @returns the userId associated with the given token
     * @throws NOT_FOUND if the given token does not exist
     */
    async function tokenToUserId(token) {
        try {
            await db.client.connect();

            const database = db.client.db(db.name);
            const tokens = database.collection('tokens');

            const doc = await tokens.findOne({ token });
            // console.log(doc);

            return doc.userId;
        }
        catch (err) {
            console.log(err);
            // To be improved
        }
        finally {
            await db.client.close();
        }

        throw errors.NOT_FOUND('Given token does not exist.');
    }

    /**
     * Creates a token, associating it to a userId.
     * @param {String} userId 
     * @returns token or null
     */
    async function createToken(userId) {
        const token = crypto.randomUUID();

        try {
            await db.client.connect();

            const database = db.client.db(db.name);
            const tokens = database.collection('tokens');

            const insertResult = await tokens.insertOne({ token, userId });
            // console.log('Created token:', insertResult);

            return token;
        }
        catch (err) {
            console.log(err);
            // To be improved
        }
        finally {
            await db.client.close();
        }

        return null;
    }


    // ------------------------- Passwords -------------------------

    /**
     * Hashes the password.
     * @param {String} password 
     * @returns promise with hashed password
     */
    async function hash(password) {
        return new Promise((resolve, reject) => {
            // generate random 16 bytes long salt
            const salt = crypto.randomBytes(16).toString("hex")

            crypto.scrypt(password, salt, 64, (err, derivedKey) => {
                if (err) reject(err);
                resolve(salt + ":" + derivedKey.toString('hex'))
            });
        })
    }

    /**
     * Verifies if the hash matches the password.
     * @param {String} password 
     * @param {String} hash 
     * @returns promise with boolean (true if they match)
     */
    async function verify(password, hash) {
        return new Promise((resolve, reject) => {
            const [salt, key] = hash.split(":")
            crypto.scrypt(password, salt, 64, (err, derivedKey) => {
                if (err) reject(err);
                resolve(key == derivedKey.toString('hex'))
            });
        })
    }


    // ------------------------- Users -------------------------

    /**
     * Creates a new user given its id, name and password.
     * @param {String} userId 
     * @param {String} userName 
     * @param {String} password 
     * @returns an object with the new user or null
     * @throws ALREADY_EXISTS if the user already exists
     */
    async function createUser(userId, userName, password) {
        const user = {
            userId,
            userName,
            password: await hash(password),
            posts: [],
            following: []
        };

        if (await getUser(userId))
            throw errors.ALREADY_EXISTS('User with specified userID already exists.');

        try {
            await createToken(userId);

            await db.client.connect();

            const database = db.client.db(db.name);
            const users = database.collection('users');

            const insertResult = await users.insertOne(user);
            // console.log('Created user:', insertResult);

            return user;
        }
        catch (err) {
            console.log(err);
            // To be improved
        }
        finally {
            await db.client.close();
        }

        return null;
    }

    /**
     * Gets an user.
     * @param {String} userId 
     * @returns the user object or null
     * @throws NOT_FOUND if the user does not exist
     */
    async function getUser(userId) {
        try {
            await db.client.connect();

            const database = db.client.db(db.name);
            const users = database.collection('users');

            const user = await users.findOne({ userId });
            // console.log(user);

            return user;
        }
        catch (err) {
            console.log(err);
            // To be improved
        }
        finally {
            await db.client.close();
        }

        throw errors.NOT_FOUND('User does not exist.');
    }

    /**
     * Creates a post.
     * @param {String} userId 
     * @param {String} post 
     * @returns the user
     * @throws NOT_FOUND if the user does not exist
     */
    async function createPost(userId, post) {
        const user = await getUser(userId);
        if (user) {
            try {
                await db.client.connect();

                const database = db.client.db(db.name);
                const users = database.collection('users');

                user.posts.push(post);

                const updateResult = await users.updateOne({ userId }, { $set: user });
                // console.log(updateResult);

                return user;
            }
            catch (err) {
                console.log(err);
                // To be improved
            }
            finally {
                await db.client.close();
            }
        }
        else
            throw errors.NOT_FOUND('User does not exist.');
    }

    /**
     * Gets the user dashboard.
     * @param {String} userId 
     * @returns the dashboard
     * @throws NOT_FOUND if the user does not exist
     */
    async function getUserDashboard(userId) {
        const user = await getUser(userId);
        if (user) {
            const dashboard = user.posts;
            user.following.forEach(async followingId => {
                const following = await getUser(followingId);
                dashboard.concat(following.posts);
            });

            return dashboard;
        }
        else
            throw errors.NOT_FOUND('User does not exist.');
    }

    /**
     * Gets the user password.
     * @param {String} userId 
     * @returns the password
     * @throws NOT_FOUND if the user does not exist
     */
    async function getUserPassword(userId) {
        const user = await getUser(userId);
        if (user)
            return user.password;
        else
            throw errors.NOT_FOUND('User does not exist.');
    }


    return {
        //-- User --
        createUser,
        getUser,
        createPost,
        getUserDashboard,
        getUserPassword,

        //-- Tokens --
        tokenToUserId,

        //-- Passwords --
        hash,
        verify
    };
}
