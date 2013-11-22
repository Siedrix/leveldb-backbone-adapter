var level = require('level');
var sublevel = require('level-sublevel');

var q = require('q');
var sub;

var Adapter = function (Backbone, config) {
	// Sets sublevel database at backbone level
	var db  = level('./'+config.db, { valueEncoding: 'json' });
	Backbone.db = sub = sublevel(db);

	Backbone.sync = function (method, entity, options) {
		var deferred;

		if(entity.isCollection){
			var collection = entity;

			if(method === 'read'){
				deferred = q.defer();
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

		if(entity.isModel){
			var model = entity;
			var modelAsJSON = model.toJSON();
			delete modelAsJSON.id;

			if(method === 'read'){
				//implement
			}else if(method === 'update'){
				deferred = q.defer();

				model._db.put( model.get('id'), modelAsJSON, function (err) {
					if(err){
						options.error(err);
						return;
					}

					deferred.resolve(err);
					options.success();
				});
			}else if(method === 'delete'){
				//implement
			}
		}

		return deferred.promise;
	};

	Adapter.CollectionOverwrite(Backbone.Collection);
	Adapter.ModelOverwrite(Backbone.Model);
};

Adapter.CollectionOverwrite = function (Collection) {
	Collection.oldExtend = Collection.extend;

	Collection.extend = function (object) {
		var result = Collection.oldExtend.apply(this, arguments);

		result.prototype.isCollection = true;

		if(object.dbName){
			result.prototype._db = sub.sublevel(object.dbName);


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

Adapter.ModelOverwrite = function (Model) {
	Model.oldExtend = Model.extend;

	Model.extend = function (object) {
		var result = Model.oldExtend.apply(this, arguments);

		result.prototype.isModel = true;

		if(object.dbName){
			var collection = sub.sublevel(object.dbName);

			result.dbName = object.dbName;
			result._db = collection;
			result.prototype._db = collection;
		}

		return result;
	};

	Model.fetch = function (key, callback) {
		var Self = this;

		var deferred = q.defer();

		this._db.get(key, function (err, data) {
			if(err){
				if(callback) callback(err);
				deferred.resolve(err);
				return;
			}

			data.id = key;

			var model = new Self(data);

			if(callback) callback(null, model);

			deferred.resolve(model);
		});

		return deferred.promise;
	};
};

module.exports = Adapter;