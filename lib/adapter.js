var level = require('level');
var sublevel = require('level-sublevel');

var q = require('q');

var _ = require('underscore');
var sub;

var Adapter = function (Backbone, config) {
	// Sets sublevel database at backbone level
	var db  = level('./'+config.db, { valueEncoding: 'json' });
	Backbone.db = sub = sublevel(db);

	Backbone.sync = function (method, entity, options) {
		var deferred = q.defer();

		if(entity.isCollection){
			var collection = entity;

			if(method === 'read'){
				var readStream = collection._db.createReadStream();

				readStream.on('data', function(data){
					data.value.id = data.key;

					if(options.filter && options.filter(data.value)){
						collection.add(data.value.id);
					}else if(!options.filter){
						collection.add(data.value.id);
					}
				})
				.on('end', function(){
					deferred.resolve();
				})
				.on('error', function(err){
					deferred.resolve(err);
				});
			}
		}

		return deferred.promise;
	};

	Adapter.CollectionOverwrite(Backbone.Collection);
};

Adapter.CollectionOverwrite = function (Collection) {
	Collection.oldExtend = Collection.extend;

	Collection.extend = function (object) {
		var result = Collection.oldExtend.apply(this, arguments);

		if(object.dbName){
			result.prototype._db = sub.sublevel(object.dbName);

			result.prototype.isCollection = true;

			result.prototype.nuke = function (callback) {
				var collection = this;

				var opts = [];

				collection._db.createKeyStream().on('data', function(key){
					opts.push({type:'del', key:key});
				})
				.on('end', function(err){
					if(err){
						callback(err);
						return;
					}

					collection._db.batch(opts, function (err) {
						callback(err);
					});
				})
				.on('error', function(err){
					console.log('There as an error', err);
					callback(err);
				});
			};

			result.prototype.filterFetch = function (fn) {
				return this.fetch({filter : fn});
			};
		}

		return result;
	};
};

module.exports = Adapter;