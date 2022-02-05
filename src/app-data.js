'use strict';

// Access to app data using MongoDB.

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
            const tokens = database.collection(db.tokensBucket);

            const tokenDoc = await tokens.findOne({ token });
            return tokenDoc.userId;
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
            const tokens = database.collection(db.tokensBucket);

            await tokens.insertOne({ token, userId });
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

    /**
     * Gets an user token.
     * @param {String} userId 
     * @param {String} userId 
     * @param {String} userId 
     * @returns the user token
     * @throws NOT_FOUND if the token doesn't exist
     */
    async function getToken(userId) {
        try {
            await db.client.connect();

            const database = db.client.db(db.name);
            const users = database.collection(db.tokensBucket);

            const tokenDoc = await users.findOne({ userId });
            return tokenDoc.token;
        }
        catch (err) {
            console.log(err);
            // To be improved
        }
        finally {
            await db.client.close();
        }

        throw errors.NOT_FOUND({ 'token for user': userId });
    }

    // ------------------------- Users -------------------------

    /**
     * Creates a new user object given its id, name and password.
     * @param {String} userId 
     * @param {String} userName 
     * @param {String} hashedPassword 
     * @returns an object with the user information
     */
    const createUserObj = (userId, userName, hashedPassword) => {
        return {
            userId,
            userName,
            hashedPassword,
            posts: [],
            following: [],
            followers: []
        };
    }


    /**
     * Creates a new user given its id, name and password.
     * @param {String} userId 
     * @param {String} userName 
     * @param {String} hashedPassword 
     * @returns an object with the new user or null
     * @throws ALREADY_EXISTS if the user already exists
     */
    async function createUser(userId, userName, hashedPassword) {
        const user = createUserObj(userId, userName, hashedPassword);

        if (await getUser(userId))
            throw errors.ALREADY_EXISTS('User with specified userID already exists.');

        try {
            await createToken(userId);

            await db.client.connect();

            const database = db.client.db(db.name);
            const users = database.collection(db.usersBucket);

            await users.insertOne(user);
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
            const users = database.collection(db.usersBucket);

            const user = await users.findOne({ userId });
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
     * Gets an object with all users.
     * @returns an object with all users
     */
    async function getAllUsers() {
        try {
            await db.client.connect();

            const database = db.client.db(db.name);

            const users = await database.collection(db.usersBucket).find({}).toArray();
            return users;
        }
        catch (err) {
            console.log(err);
            // To be improved
        }
        finally {
            await db.client.close();
        }
    }

    /**
     * Creates a post.
     * @param {String} userId 
     * @param {Object} post 
     * @returns the user
     * @throws NOT_FOUND if the user does not exist
     */
    async function createPost(userId, post) {
        const user = await getUser(userId);
        if (user) {
            try {
                await db.client.connect();

                const database = db.client.db(db.name);
                const users = database.collection(db.usersBucket);

                user.posts.push(post);

                await users.updateOne({ userId }, { $set: user });
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
            let dashboard = user.posts;

            for (const followingId of user.following) {
                const following = await getUser(followingId);
                dashboard = dashboard.concat(following.posts);
            }

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


    /**
     * Follows a user.
     * @param {Object} user
     * @param {Object} userToFollow
     * @returns user that follows
     */
    async function followUser(user, userToFollow) {
        try {
            await db.client.connect();

            const database = db.client.db(db.name);
            const users = database.collection(db.usersBucket);

            userToFollow.followers.push(user.userId);
            await users.updateOne({ userId: userToFollow.userId }, { $set: userToFollow });

            user.following.push(userToFollow.userId);
            await users.updateOne({ userId: user.userId }, { $set: user });

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


    /**
     * Follows a user.
     * @param {Object} user
     * @param {Object} userToUnfollow
     * @returns user that follows
     */
    async function unfollowUser(user, userToUnfollow) {
        try {
            await db.client.connect();

            const database = db.client.db(db.name);
            const users = database.collection(db.usersBucket);

            userToUnfollow.followers = userToUnfollow.followers.filter((follower) => follower != user.userId);
            await users.updateOne({ userId: userToUnfollow.userId }, { $set: userToUnfollow });

            user.following = user.following.filter((following) => following != userToUnfollow.userId);
            await users.updateOne({ userId: user.userId }, { $set: user });

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


    return {
        //-- User --
        createUser,
        getUser,
        getAllUsers,
        createPost,
        getUserDashboard,
        getUserPassword,
        followUser,
        unfollowUser,

        //-- Tokens --
        tokenToUserId,
        getToken
    };
}
