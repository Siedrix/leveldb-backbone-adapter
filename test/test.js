var assert = require('assert');

var Backbone = require('Backbone');
var levelDbBackboneAdapter = require('../lib/adapter');

levelDbBackboneAdapter(Backbone, {
	db : 'testDb'
});

var ExampleModel = Backbone.Model.extend({
	dbName : 'example',
});

var ExampleCollection = Backbone.Collection.extend({
	dbName : 'example',
	model : ExampleModel
});

var data = [
	{ type : 'put', key: 'Peyton Manning',		value : { name : 'Peyton Manning'   ,completed : 286,attempts : 409,tds : 34,team : 'DEN' ,active : true  } },
	{ type : 'put', key: 'Drew Brees',			value : { name : 'Drew Brees'       ,completed : 277,attempts : 406,tds : 26,team : 'NO'  ,active : true  } },
	{ type : 'put', key: 'Matthew Stafford',	value : { name : 'Matthew Stafford' ,completed : 248,attempts : 419,tds : 21,team : 'DET' ,active : true  } },
	{ type : 'put', key: 'Aaron Rodgers',		value : { name : 'Aaron Rodgers'   ,completed : 168,attempts : 251,tds : 15,team : 'GB'  ,active : false } },
];

before(function(done){
	var exampleCollection = new ExampleCollection();
	exampleCollection.nuke(function (err) {
		if(err){
			console.log('Couln\'t nuke Db', err);
			done(err);
			return;
		}

		exampleCollection._db.batch(data, function () {
			done(err);
		});
	});
});

describe('Backbone set up', function(){
	describe('Backbone.db', function(){
		it('Should be an intance of leveldb', function(){
			assert.equal(typeof Backbone.db, 'object');
			assert.equal(typeof Backbone.db.put, 'function');
			assert.equal(typeof Backbone.db.del, 'function');
			assert.equal(typeof Backbone.db.batch, 'function');
		});
	});
});

describe('Backbone Collection', function(){
	describe('Backbone.Collection basics', function(){
		it('should have the adapter extend,not the regular extend', function () {
			assert.equal(typeof Backbone.Collection.oldExtend,'function');
			assert.notEqual(Backbone.Collection.oldExtend, Backbone.Collection.extend);
		});
	});

	describe('ExampleCollection', function () {
		it('should be a Backbone.Collection', function () {
			// Use this method to test that Example Collection inherits from Backbone.Collection
			assert.equal(ExampleCollection.__super__, Backbone.Collection.prototype);
		});

		it('should have a dbName and db', function () {
			// Test that Example collections has a db
			assert.equal(ExampleCollection.prototype.dbName, 'example');

			assert.equal(typeof ExampleCollection.prototype._db, 'object');
			assert.equal(typeof ExampleCollection.prototype._db.put, 'function');
			assert.equal(typeof ExampleCollection.prototype._db.get, 'function');
			assert.equal(typeof ExampleCollection.prototype._db.del, 'function');
		});
	});

	describe('new ExampleCollection', function () {
		it('should be a Backbone Collection instance', function () {
			var exampleCollection = new ExampleCollection();

			assert.equal(exampleCollection.isCollection, true);
		});

		it('should have a _db property and a dbName', function () {
			var exampleCollection = new ExampleCollection();
			assert.equal(exampleCollection.dbName, 'example');

			assert.equal(typeof exampleCollection._db, 'object');
			assert.equal(typeof exampleCollection._db.put, 'function');
			assert.equal(typeof exampleCollection._db.get, 'function');
			assert.equal(typeof exampleCollection._db.del, 'function');
		});

		it('#fetch() should get all the elements in the db(4)', function (done) {
			var exampleCollection = new ExampleCollection();
			var q = exampleCollection.fetch();

			q.then(function () {
				if(exampleCollection.length === 4){
					done();
				}else{
					done('incorrect length of collection: ' + exampleCollection.length);
				}
			});
		});

		it('#filterFetch() should query the data base', function (done) {
			var exampleCollection = new ExampleCollection();
			var q = exampleCollection.filterFetch(function(item){
				return !item.active;
			});

			q.then(function () {
				if(exampleCollection.length === 1){
					done();
				}else{
					done('incorrect length of collection: ' + exampleCollection.length);
				}
			});
		});
	});
});

describe('Backbone Models', function(){
	describe('Backbone.Models basics', function(){
		it('should have the adapter extend,not the regular extend', function () {
			assert.equal(typeof Backbone.Model.oldExtend,'function');
			assert.notEqual(Backbone.Model.oldExtend, Backbone.Collection.extend);
		});
	});

	describe('ExampleModel', function () {
		it('should be a Backbone.Model', function () {
			// Use this method to test that Example Collection inherits from Backbone.Collection
			assert.equal(ExampleModel.__super__, Backbone.Model.prototype);
		});

		it('should have a dbName and db on constructor', function () {
			// Test that Example collections has a db
			assert.equal(ExampleModel.dbName, 'example');

			assert.equal(typeof ExampleModel._db, 'object');
			assert.equal(typeof ExampleModel._db.put, 'function');
			assert.equal(typeof ExampleModel._db.get, 'function');
			assert.equal(typeof ExampleModel._db.del, 'function');
		});

		it('should have a dbName and db on prototype', function () {
			// Test that Example collections has a db
			assert.equal(ExampleModel.prototype.dbName, 'example');

			assert.equal(typeof ExampleModel.prototype._db, 'object');
			assert.equal(typeof ExampleModel.prototype._db.put, 'function');
			assert.equal(typeof ExampleModel.prototype._db.get, 'function');
			assert.equal(typeof ExampleModel.prototype._db.del, 'function');
		});
	});

	describe('new ExampleModel', function () {
		it('should be a Backbone Model instance', function () {
			var exampleModel = new ExampleModel();

			assert.equal(exampleModel.isModel, true);
		});

		it('should have a _db property and a dbName', function () {
			var exampleModel = new ExampleModel();
			assert.equal(exampleModel.dbName, 'example');

			assert.equal(typeof exampleModel._db, 'object');
			assert.equal(typeof exampleModel._db.put, 'function');
			assert.equal(typeof exampleModel._db.get, 'function');
			assert.equal(typeof exampleModel._db.del, 'function');
		});

		it('#Model.fetch() should get a model by key[Callback]', function (done) {
			ExampleModel.fetch('Aaron Rodgers', function(err, model){
				if(err){
					done(err);
					return;
				}

				if(
					model.isModel &&
					model.get('id') === 'Aaron Rodgers' &&
					model.get('name') === 'Aaron Rodgers' &&
					model.get('team') === 'GB'
				){
					done();
				}else{
					done('Not the model you are looking for.'+ JSON.stringify( model.toJSON() ) );
				}
			});
		});
	});
});