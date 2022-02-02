'use strict';

// Application launch.

const { MongoClient } = require('mongodb');

const DEFAULT_PORT = 8888;
const PORT = process.argv[2] || DEFAULT_PORT;

const config = require('./app-config');

const db_client = new MongoClient(
    config.db.uri,
    { useNewUrlParser: true, useUnifiedTopology: true }
);
config.db.client = db_client;

const server = require('./app-server');
const app = server(config.guest, config.db);

app.listen(PORT);
