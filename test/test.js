var assert = require('assert'),
	chai = require('chai'),
	expect = chai.expect,
	uuid = require('node-uuid'),
	Backbone = require('Backbone'),
	_ = require('underscore');

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

	describe('exampleCollection', function () {
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
				var collectionAsArray = exampleCollection.toArray();

				expect(collectionAsArray.length).equals(5);

				expect(collectionAsArray[0].get('name')).equals('Tom Brady');
				expect(collectionAsArray[1].get('name')).equals('Peyton Manning');
				expect(collectionAsArray[2].get('name')).equals('Drew Brees');
				expect(collectionAsArray[3].get('name')).equals('Matthew Stafford');
				expect(collectionAsArray[4].get('name')).equals('Aaron Rodgers');

				done();
			});
		});

		it('#fetchFilter() should query the data base[function]', function (done) {
			var exampleCollection = new ExampleCollection();
			var q = exampleCollection.fetchFilter(function(item){
				return !item.active;
			});

			q.then(function () {
				expect(exampleCollection.length).equals(1);

				expect(exampleCollection.first().get('id')).to.be.a('string');
				expect(exampleCollection.first().get('name')).equals('Aaron Rodgers');
				expect(exampleCollection.first().get('team')).equals('GB');

				done();
			});
		});
		it('#fetchFilter() should query the data base[object]', function (done) {
			var exampleCollection = new ExampleCollection();
			var q = exampleCollection.fetchFilter({active:false});

			q.then(function () {
				expect(exampleCollection.length).equals(1);

				expect(exampleCollection.first().get('id')).to.be.a('string');
				expect(exampleCollection.first().get('name')).equals('Aaron Rodgers');
				expect(exampleCollection.first().get('team')).equals('GB');

				done();
			});
		});

		it('#FetchOne() should query the data base for one model[function]', function (done) {
			var exampleCollection = new ExampleCollection();
			var q = exampleCollection.fetchOne(function(item){
				return !item.active;
			});

			q.then(function (model) {
				expect(model.isModel).equals(true);
				expect(model.get('id')).to.be.a('string');
				expect(model.get('name')).equals('Aaron Rodgers');
				expect(model.get('team')).equals('GB');

				done();
			});
		});
		it('#FetchOne() should query the data base for one model[object]', function (done) {
			var exampleCollection = new ExampleCollection();
			var q = exampleCollection.fetchOne({active:false});

			q.then(function (model) {
				expect(model.isModel).equals(true);
				expect(model.get('id')).to.be.a('string');
				expect(model.get('name')).equals('Aaron Rodgers');
				expect(model.get('team')).equals('GB');

				done();
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

	describe('exampleModel', function () {
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

		it('#Model.find() should get a model[Callback]', function (done) {
			ExampleModel.find({name:'Aaron Rodgers'}, function(err, model){
				expect(err).equals(null);
				expect(model.isModel).equals(true);
				expect(model.get('id')).to.be.a('string');
				expect(model.get('name')).equals('Aaron Rodgers');
				expect(model.get('team')).equals('GB');

				done();
			});
		});
		it('#Model.find() should get a model[Promise]', function (done) {
			var q = ExampleModel.find({name:'Aaron Rodgers'});

			q.then(function (model) {
				expect(model.isModel).equals(true);
				expect(model.get('id')).to.be.a('string');
				expect(model.get('name')).equals('Aaron Rodgers');
				expect(model.get('team')).equals('GB');

				done();
			});
		});

		it('#Model.find() should get a model if asking with multiple values on query[Callback]', function (done) {
			ExampleModel.find({
				name:'Aaron Rodgers',
				active:false
			}, function(err, model){
				expect(err).equals(null);
				expect(model.isModel).equals(true);
				expect(model.get('id')).to.be.a('string');
				expect(model.get('name')).equals('Aaron Rodgers');
				expect(model.get('team')).equals('GB');

				done();
			});
		});
		it('#Model.find() should get a model if asking with multiple values on query[Promise]', function (done) {
			var q = ExampleModel.find({
				name:'Aaron Rodgers',
				active:false
			});

			q.then(function (model) {
				expect(model.isModel).equals(true);
				expect(model.get('id')).to.be.a('string');
				expect(model.get('name')).equals('Aaron Rodgers');
				expect(model.get('team')).equals('GB');

				done();
			});
		});

		it('#Model.find({name:"Michael Jordan"}) should get no models[Callback]', function (done) {
			ExampleModel.find({name:'Michael Jordan'}, function(err, model){
				expect( _.isObject(err) ).equals(true);
				expect( _.isEmpty(err)  ).equals(true);
				expect(model).equals(null);

				done();
			});
		});
		it('#Model.find({name:"Michael Jordan"}) should get no models[Promise]', function (done) {
			var q = ExampleModel.find({name:'Michael Jordan'});

			q.then(function(model){
				expect(model).to.be.a('undefined');

				done();
			});
		});

		it('#Model.find({active:true}) should get to many models as error[Callback]', function (done) {
			ExampleModel.find({active:true}, function(err, model){
				expect( _.isObject(err) ).equals(true);
				expect(err.error).equals('to many models in find');
				expect(model).equals(null);

				done();
			});
		});
		it('#Model.find({active:true}) should get to many models as error[Promise]', function (done) {
			var q = ExampleModel.find({active:true});

			q.fail(function(err){
				expect( _.isObject(err) ).equals(true);
				expect(err.error).equals('to many models in find');

				done();
			});
		});

		it('#Model.find(fn), should get one model[Callback]', function (done) {
			ExampleModel.find(function(data){
				return data.name === 'Aaron Rodgers';
			},function(err,model){
				expect(err).equals(null);
				expect(model.isModel).equals(true);
				expect(model.get('id')).to.be.a('string');
				expect(model.get('name')).equals('Aaron Rodgers');
				expect(model.get('team')).equals('GB');

				done();
			});
		});
		it('#Model.find(fn), should get one model[Promise]', function (done) {
			var q = ExampleModel.find(function(data){
				return data.name === 'Aaron Rodgers';
			});

			q.then(function(model){
				expect(model.isModel).equals(true);
				expect(model.get('id')).to.be.a('string');
				expect(model.get('name')).equals('Aaron Rodgers');
				expect(model.get('team')).equals('GB');

				done();
			});
		});

		it('#Model.get() should get a model[Callback]', function (done) {
			var q = ExampleModel.find({name:'Aaron Rodgers'});

			q.then(function (data) {
				ExampleModel.get(data.get('id'), function(err, model){
					expect(model.isModel).equals(true);
					expect(model.get('id')).to.be.a('string');
					expect(model.get('name')).equals('Aaron Rodgers');
					expect(model.get('team')).equals('GB');

					done();
				});
			});
		});
		it('#Model.get() should get a model[Promise]', function (done) {
			var q = ExampleModel.find({name:'Aaron Rodgers'});

			q.then(function (data) {
				var q = ExampleModel.get(data.get('id'));

				q.then(function(model){
					expect(model.isModel).equals(true);
					expect(model.get('id')).to.be.a('string');
					expect(model.get('name')).equals('Aaron Rodgers');
					expect(model.get('team')).equals('GB');

					done();
				});
			});
		});

		it('#new Model() create[Callback]', function (done) {
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
		it('#new Model() create[Promise]', function (done) {
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
			var q = ExampleModel.find({name:'Drew Brees'});

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
			var q = ExampleModel.find({name:'Aaron Rodgers'});

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
			var q = ExampleModel.find({name:'Tom Brady'});

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
			var q = ExampleModel.find({name:'Peyton Manning'});

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

describe('Backbone Collection with values from db', function(){
	describe('Backbone.Collection basics', function(){
		it('should have the adapter extend,not the regular extend', function () {
			assert.equal(typeof ExampleCollection.fetch,'function');
			assert.equal(typeof ExampleCollection.find,'function');
			assert.equal(typeof ExampleCollection.findOne,'function');
		});
	});

	describe('Backbone.Collection Fetch', function(){
		it('should return a collection', function () {
			var exampleCollection = ExampleCollection.fetch();
			expect(exampleCollection.isCollection).equals(true);
		});

		it('should have a event called ready trigger in the collection, once is filled', function (done) {
			var exampleCollection = ExampleCollection.fetch();

			exampleCollection.on('ready', function(){
				expect(exampleCollection.isCollection).equals(true);

				var collectionAsArray = exampleCollection.toArray();

				expect(collectionAsArray.length).equals(5);
				expect(collectionAsArray[0].get('name')).equals('Drew Brees');
				expect(collectionAsArray[1].get('name')).equals('Matthew Stafford');
				expect(collectionAsArray[2].get('name')).equals('Aaron Rodgers');
				expect(collectionAsArray[3].get('name')).equals('Philip Rivers');
				expect(collectionAsArray[4].get('name')).equals('Andy Dalton');

				done();
			});
		});

		it('should have a fetch callback, with and err and a exampleCollection with 5 items', function (done) {
			ExampleCollection.fetch(function(err, exampleCollection){
				expect(err).equals(null);
				expect(exampleCollection.isCollection).equals(true);

				var collectionAsArray = exampleCollection.toArray();

				expect(collectionAsArray.length).equals(5);
				expect(collectionAsArray[0].get('name')).equals('Drew Brees');
				expect(collectionAsArray[1].get('name')).equals('Matthew Stafford');
				expect(collectionAsArray[2].get('name')).equals('Aaron Rodgers');
				expect(collectionAsArray[3].get('name')).equals('Philip Rivers');
				expect(collectionAsArray[4].get('name')).equals('Andy Dalton');

				done();
			});
		});

		it('should have a find function[evented]', function (done) {
			var exampleCollection = ExampleCollection.find(function(item){
				return item.name.indexOf('R') >= 0;
			});

			exampleCollection.on('ready', function(){
				expect(exampleCollection.isCollection).equals(true);

				var collectionAsArray = exampleCollection.toArray();

				expect(collectionAsArray.length).equals(2);
				expect(collectionAsArray[0].get('name')).equals('Aaron Rodgers');
				expect(collectionAsArray[1].get('name')).equals('Philip Rivers');

				done();
			});
		});

		it('should have a find function[callback]', function (done) {
			ExampleCollection.find(function(item){
				return item.name.indexOf('R') >= 0;
			},function(err, exampleCollection){
				expect(err).equals(null);
				expect(exampleCollection.isCollection).equals(true);

				var collectionAsArray = exampleCollection.toArray();

				expect(collectionAsArray.length).equals(2);
				expect(collectionAsArray[0].get('name')).equals('Aaron Rodgers');
				expect(collectionAsArray[1].get('name')).equals('Philip Rivers');

				done();
			});
		});

		it('should have a findOne function[callback]', function (done) {
			ExampleCollection.findOne(function(item){
				return item.name.indexOf('Rodgers') >= 0;
			},function(err, exampleModel){
				expect(err).equals(null);
				expect(exampleModel.isModel).equals(true);
				expect(exampleModel.get('name')).equals('Aaron Rodgers');

				done();
			});
		});
	});
});