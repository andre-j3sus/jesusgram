'use strict';

// Access to app data.

const crypto = require('crypto');

module.exports = function (db) {

    // ------------------------- Tokens -------------------------

    /**
     * Return the userId associated with the given token.
     * @param {String} token 
     * @returns the userId associated with the given token
     */
    async function tokenToUserId(token) {
        try {
            await db.client.connect();

            const database = db.client.db(db.name);
            const tokens = database.collection('tokens');

            const doc = await tokens.findOne({ token });
            console.log(doc);

            return doc.userId;
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
     * Creates a token, associating it to a userId.
     * @param {String} token 
     * @returns token
     */
    async function createToken(userId) {
        const token = crypto.randomUUID();

        try {
            await db.client.connect();

            const database = db.client.db(db.name);
            const tokens = database.collection('tokens');

            const insertResult = await tokens.insertOne({ token, userId });
            console.log('Created token:', insertResult);

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
     * @returns an object with the new user information
     */
    async function createUser(userId, userName, password) {
        const user = {
            userId,
            userName,
            password: await hash(password),
            posts: [],
            following: []
        };

        try {
            await createToken(userId);

            await db.client.connect();

            const database = db.client.db(db.name);
            const users = database.collection('users');

            const insertResult = await users.insertOne(user);
            console.log('Created user:', insertResult);

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
     * @returns the user object
     * @throws NOT_FOUND if the user doesn't exist
     */
    async function getUser(userId) {
        try {
            await db.client.connect();

            const database = db.client.db(db.name);
            const users = database.collection('users');

            const user = await users.findOne({ userId });
            console.log(user);

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
     * Creates a post.
     * @param {String} userId 
     * @param {String} post 
     * @returns the post object
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
                console.log(updateResult);

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

        return null;
    }

    /**
     * Gets the user dashboard.
     * @param {String} userId 
     * @returns the dashboard
     */
    async function getUserDashboard(userId) {
        const user = await getUser(userId);
        if (user) {
            const dashboard = user.posts;
            user.following.forEach(async followingId => {
                const following = await getUser(followingId);
                dashboard.concat(following.posts);
            }); // TODO try with flatmap

            return dashboard;
        }

        return null;
    }

    /**
     * Gets the user password.
     * @param {String} userId 
     * @returns the password
     */
    async function getUserPassword(userId) {
        const user = await getUser(userId);
        if (user)
            return user.password;;

        return null;
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
