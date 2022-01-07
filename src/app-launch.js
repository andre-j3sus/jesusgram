'use strict';

// Application launch.

const default_port = 8888;
const port = process.argv[2] || default_port;

const config = require('./app-config');

const server = require('./app-server');
const app = server(config.guest);

app.listen(port);
