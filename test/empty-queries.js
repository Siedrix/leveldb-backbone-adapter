var assert = require('assert'),
	chai = require('chai'),
	expect = chai.expect,
	uuid = require('node-uuid'),
	Backbone = require('Backbone'),
	Promise = require('bluebird'),
	_ = require('underscore');

var levelDbBackboneAdapter = require('./utils/db-connect');

var EmptyModel = Backbone.Model.extend({
	dbName : 'empty'
});

var EmptyCollection = Backbone.Collection.extend({
	dbName : 'empty',
	model : EmptyModel
});

var OtherModel = Backbone.Model.extend({
	dbName : 'other'
});

var OtherCollection = Backbone.Collection.extend({
	dbName : 'other',
	model : OtherModel
});

describe('Empty tests', function(){
	describe('Single collection', function(){
		it('Shouldnt return error on fetch', function(done){
			var emptyCollection = new EmptyCollection();

			var q = emptyCollection.fetch();

			q.then(function(){
				done();
			}).catch(function(err){
				done(err);
			});
		});
	});

	describe('Single collection', function(){
		it('Shouldnt return error on fetchFilter', function(done){
			var emptyCollection = new EmptyCollection();

			var q = emptyCollection.fetch(function(){
				return true;
			});

			q.then(function(){
				done();
			}).catch(function(err){
				done(err);
			});
		});
	});

	describe('Multi collection', function(){
		it('Shouldnt return error on fetch', function(done){
			var emptyCollection = new EmptyCollection();
			var otherCollection = new OtherCollection();

			var qEmpty = emptyCollection.fetch();
			var qOther = otherCollection.fetch();

			Promise.all([qEmpty, qOther])
			.then(function(){
				done();
			}).catch(function(err){
				done(err);
			});
		});
	});

	describe('Multi collection', function(){
		it('Shouldnt return error on fetchFilter', function(done){
			var emptyCollection = new EmptyCollection(function(){return true;});
			var otherCollection = new OtherCollection(function(){return true;});

			var qEmpty = emptyCollection.fetchFilter();
			var qOther = otherCollection.fetchFilter();

			Promise.all([qEmpty, qOther])
			.then(function(){
				done();
			}).catch(function(err){
				done(err);
			});
		});
	});
});