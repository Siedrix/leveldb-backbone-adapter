var assert = require("assert");

var Backbone = require("Backbone");
var _ = require("underscore");
var LevelDbBackboneAdapter = require('../lib/adapter');

LevelDbBackboneAdapter(Backbone, {
	db : "testDb"
});

var ExampleModel = Backbone.Model.extend({
	dbName : 'example',
});

var ExampleCollection = Backbone.Collection.extend({
	dbName : 'example',
	model : ExampleModel
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
		it("should have the adapter extend,not the regular extend", function () {
			assert.equal(typeof Backbone.Collection.old_extend,"function");
			assert.notEqual(Backbone.Collection.old_extend, Backbone.Collection.extend);
		});
	});

	describe('ExampleCollection', function () {
		it("should be a Backbone.Collection", function () {
			// Use this method to test that Example Collection inherits from Backbone.Collection
			assert.equal(ExampleCollection.__super__, Backbone.Collection.prototype);
		});

		it("should have a dbName and db", function () {
			// Test that Example collections has a db
			assert.equal(ExampleCollection.prototype.dbName, "example");

			assert.equal(typeof ExampleCollection.prototype._db, "object");
			assert.equal(typeof ExampleCollection.prototype._db.put, "function");
			assert.equal(typeof ExampleCollection.prototype._db.get, "function");
			assert.equal(typeof ExampleCollection.prototype._db.del, "function");
		});
	});

	describe('new ExampleCollection', function () {
		var exampleCollection = new ExampleCollection();
		it("should be a Backbone Collection instance", function () {
			// find a way to test this;
		});

		it("should have a _db property and a dbName", function () {
			assert.equal(exampleCollection.dbName, "example");

			assert.equal(typeof exampleCollection._db, "object");
			assert.equal(typeof exampleCollection._db.put, "function");
			assert.equal(typeof exampleCollection._db.get, "function");
			assert.equal(typeof exampleCollection._db.del, "function");
		});
	});
});