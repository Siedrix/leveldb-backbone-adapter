var LevelUp = require('levelup');
var Sublevel = require('level-sublevel');

var _ = require('underscore');
var db;

var Adapter = function (Backbone, config) {
	console.log('Added Backbone Adapter');

	// Sets sublevel database at backbone level
	db = Sublevel(LevelUp('./'+config.db));
	Backbone.db = db;

	Adapter.CollectionOverwrite(Backbone.Collection);
};

Adapter.CollectionOverwrite = function (Collection) {
	Collection.old_extend = Collection.extend;

	Collection.extend = function (object) {
        var result = Collection.old_extend.apply(this, arguments);

        if(object.dbName){
			console.log('Extenting Collection with dbName', object.dbName);
			result.prototype._db = db.sublevel(object.dbName);
        }

        return result;
    };
};

module.exports = Adapter;