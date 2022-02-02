'use strict';

// Entry point to the server application.

const express = require('express');
const session = require('express-session');
const passport = require('passport');

passport.serializeUser((userInfo, done) => { done(null, userInfo); });
passport.deserializeUser((userInfo, done) => {
    done(null, {
        userId: userInfo.userId,
        userName: userInfo.userName,
        posts: userInfo.posts,
        following: userInfo.following,
        followers: userInfo.followers,
        token: userInfo.token
    });
});

module.exports = function (guest, db) {

    const data = require('./app-data')(db);
    const services = require('./app-services.js')(data);
    const web_site = require('./app-web-site.js')(services, guest);

    const app = express();
    app.use(session({
        secret: 'jesusgram-app',
        resave: false,
        saveUninitialized: false
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    app.set('view engine', 'hbs');

    app.use('/favicon.ico', express.static('static-files/images/icon.png'));
    app.use('/public', express.static('static-files'));

    app.use('/', web_site);

    return app;
};
