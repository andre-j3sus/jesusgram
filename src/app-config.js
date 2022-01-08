'use strict';

// Application config.

module.exports = {
	guest: {
		id: 'guestId',
		token: '37f315d4-e790-4e5d-943a-b0700fc3d53c',
		password: '12345678'
	},
	db: {
		name: 'jesusgram-db',
		uri: `mongodb+srv://andrejesus:${process.env['JESUSGRAM_DB_PASSWORD']}@jesusgram-db.hhp5z.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
	}
};
