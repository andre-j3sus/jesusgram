'use strict';

// Application launch.

const { MongoClient } = require('mongodb');

const default_port = 8888;
const port = process.argv[2] || default_port;

const config = require('./app-config');

const db_client = new MongoClient(config.db.uri, { useNewUrlParser: true, useUnifiedTopology: true });
config.db.client = db_client;

const server = require('./app-server');
const app = server(config.guest, config.db);

app.listen(port);
