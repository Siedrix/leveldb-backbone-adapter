var levelDbBackboneAdapter = require('../../lib/adapter'),
	Backbone = require('Backbone');

levelDbBackboneAdapter(Backbone, {
	db : 'testDb'
});

module.exports = levelDbBackboneAdapter;