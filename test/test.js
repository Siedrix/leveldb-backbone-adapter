var assert = require('assert'),
	chai = require('chai'),
	expect = chai.expect,
	uuid = require('node-uuid'),
	Backbone = require('Backbone');

var levelDbBackboneAdapter = require('../lib/adapter');

levelDbBackboneAdapter(Backbone, {
	db : 'testDb'
});

var ExampleModel = Backbone.Model.extend({
	dbName : 'example'
});

var ExampleCollection = Backbone.Collection.extend({
	dbName : 'example',
	model : ExampleModel
});

var data = [
	{ type : 'put', key: uuid.v1(),	value : { name : 'Tom Brady'		,completed : 223,attempts : 380,tds : 14,team : 'NE'  ,active : true  } },
	{ type : 'put', key: uuid.v1(), value : { name : 'Peyton Manning'   ,completed : 286,attempts : 409,tds : 34,team : 'DEN' ,active : true  } },
	{ type : 'put', key: uuid.v1(),	value : { name : 'Drew Brees'       ,completed : 277,attempts : 406,tds : 26,team : 'NO'  ,active : true  } },
	{ type : 'put', key: uuid.v1(),	value : { name : 'Matthew Stafford' ,completed : 248,attempts : 419,tds : 21,team : 'DET' ,active : true  } },
	{ type : 'put', key: uuid.v1(),	value : { name : 'Aaron Rodgers'    ,completed : 168,attempts : 251,tds : 15,team : 'GB'  ,active : false } },
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

		it('#fetch() should get all the elements in the db(5)', function (done) {
			var exampleCollection = new ExampleCollection();
			var q = exampleCollection.fetch();

			q.then(function () {
				if(exampleCollection.length === 5){
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

		it('#Model.findOne() should get a model[Callback]', function (done) {
			ExampleModel.findOne({name:'Aaron Rodgers'}, function(err, model){
				expect(err).equals(null);
				expect(model.isModel).equals(true);
				expect(model.get('id')).to.be.a('string');
				expect(model.get('name')).equals('Aaron Rodgers');
				expect(model.get('team')).equals('GB');

				done();
			});
		});

		it('#Model.findOne() should get a model[Promise]', function (done) {
			var q = ExampleModel.findOne({name:'Aaron Rodgers'});

			q.then(function (model) {
				expect(model.isModel).equals(true);
				expect(model.get('id')).to.be.a('string');
				expect(model.get('name')).equals('Aaron Rodgers');
				expect(model.get('team')).equals('GB');

				done();
			});
		});

		it('#Model.findOne({name:"Michael Jordan"}) should get no models[Callback]');
		it('#Model.findOne({name:"Michael Jordan"}) should get no models[Promise]');
		it('#Model.findOne({active:true}) should get to many models[Callback]');
		it('#Model.findOne({active:true}) should get to many models[Promise]');

		it('#new Model() of record not in database[Callback]', function (done) {
			var model = new ExampleModel({
				name : 'Philip Rivers',
				completed : 254,
				attempts : 358,
				tds : 19,
				team : 'SD',
				active : true
			});

			var fn = function (model) {
				ExampleModel._db.get(model.get('id'), function (err, data) {
					if(err){
						done(err);
						return;
					}

					expect(data.id).equals(undefined);
					expect(data.name).equals('Philip Rivers');
					expect(data.team).equals('SD');

					done(err);
				});
			};

			model.save(null, {success:fn});
		});

		it('#new Model() of record not in database[Promise]', function (done) {
			var model = new ExampleModel({
				name : 'Andy Dalton',
				completed : 252,
				attempts : 410,
				tds : 21,
				team : 'CIN',
				active : true
			});

			var q = model.save();

			q.then(function (err) {
				if(err){
					done(err);
					return;
				}

				ExampleModel._db.get(model.get('id'), function (err, data) {
					if(err){
						done(err);
						return;
					}

					expect(data.id).equals(undefined);
					expect(data.name).equals('Andy Dalton');
					expect(data.team).equals('CIN');

					done(err);
				});
			});
		});

		it('#model.save()[Callback]', function (done) {
			var q = ExampleModel.findOne({name:'Drew Brees'});

			q.then(function (model) {
				// Check save definition
				// key, val, options are the arguments
				//
				// Can also be written as 
				// model.set('tds', 28)
				// model.save(null, {success:fn});
				//
				model.save('tds', 28, {success: function (/* model */) {
					// Get data from data base to verify that was saved properly.
					ExampleModel._db.get(model.get('id'), function (err, data) {
						if(err){
							done(err);
							return;
						}

						expect(data.id).equals(undefined);
						expect(data.name).equals('Drew Brees');
						expect(data.tds).equals(28);

						done(err);
					});
				} });
			});
		});

		it('#model.save()[Promise]', function (done) {
			var q = ExampleModel.findOne({name:'Aaron Rodgers'});

			q.then(function (model) {
				model.set('active', true);

				var q = model.save();

				q.then(function(){
					// Get data from data base to verify that was saved properly.
					ExampleModel._db.get(model.id, function (err, data) {
						if(err){
							done(err);
							return;
						}

						expect(data.id).equals(undefined);
						expect(data.name).equals('Aaron Rodgers');
						expect(data.active).equals(true);

						done(err);
					});
				});
			});
		});

		// The best retire
		it('#model.destroy[Collection]', function (done) {
			var q = ExampleModel.findOne({name:'Tom Brady'});

			q.then(function (tomBrady) {
				tomBrady.destroy({success: function () {
					// Gets all QBs and validates that Tom Brady is retired
					var exampleCollection = new ExampleCollection();
					var q = exampleCollection.fetch();

					q.then(function () {
						var peytons = exampleCollection.where({name: 'Tom Brady'});

						expect(peytons.length).equals(0);

						done();
					});
				} });
			});
		});

		it('#model.destroy[Promise]', function (done) {
			var q = ExampleModel.findOne({name:'Peyton Manning'});

			q.then(function (peytonManning) {
				var q = peytonManning.destroy();

				q.then(function () {
					// Gets all QBs and validates that Peyton Manning is retired 
					var exampleCollection = new ExampleCollection();
					var q = exampleCollection.fetch();

					q.then(function () {
						var peytons = exampleCollection.where({name: 'Peyton Manning'});

						expect(peytons.length).equals(0);

						done();
					});
				});
			});
		});
	});
});