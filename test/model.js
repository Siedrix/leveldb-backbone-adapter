/* jshint maxlen:120, expr:true */
var chai = require('chai'),
	expect = chai.expect,
	Backbone = require('Backbone'),
	Promise = require('bluebird'),
	_ = require('underscore');

_.str = require('underscore.string');

var levelDbBackboneAdapter = require('../lib/adapter');

levelDbBackboneAdapter(Backbone, {
	db : 'testDb',
});

var ExampleModel = Backbone.Model.extend({
	dbName : 'example',
	uniqueKey: 'name',
});

var SlugModel = Backbone.Model.extend({
	dbName: 'slugs',
	uniqueKey: function() {
		return _.str.slugify(this.get('name'));
	}
});

var NoUniqueModel = Backbone.Model.extend({
	dbName: 'notunique'
});

var ExampleCollection = Backbone.Collection.extend({
	dbName : 'example',
	model : ExampleModel
});

var data = [
	{ type : 'put', key: 'example:tom-brady', value : { name : 'Tom Brady',completed : 223,
		attempts : 380,tds : 14,team : 'NE'  ,active : true  } },
	{ type : 'put', key: 'example:peyton-manning', value : { name : 'Peyton Manning', completed : 286,
		attempts : 409,tds : 34,team : 'DEN' ,active : true  } },
	{ type : 'put', key: 'example:drew-brees', value : { name : 'Drew Brees', completed : 277,
		attempts : 406,tds : 26,team : 'NO'  ,active : true  } },
	{ type : 'put', key: 'example:matthew-stafford', value : { name : 'Matthew Stafford', completed : 248,
		attempts : 419,tds : 21,team : 'DET' ,active : true  } },
	{ type : 'put', key: 'example:aaron-rodgers', value : { name : 'Aaron Rodgers', completed : 168,
		attempts : 251,tds : 15,team : 'GB'  ,active : false } },
];


before(function(done){
	var exampleCollection = new ExampleCollection();
	exampleCollection.nuke(function (err) {
		if(err){
			console.log('Couln\'t nuke Db', err);
			done(err);
			return;
		}
		done(null, data);
		/*
		 * exampleCollection._db.batch(data, function () {
		 *	done(err);
		 * });
		 */
	});
});

describe('Backbone Models', function(){
	it('uniqueKey works when it is an attribute', function (done) {
		var model = new ExampleModel({
			name : 'Andy Dalton',
			completed : 252,
			attempts : 410,
			tds : 21,
			team : 'CIN',
			active : true
		});
		expect(model.uniqueKey()).equals('Andy Dalton');
		expect(model.isNew()).to.equals(true);
		expect(model.id).not.to.be.ok;
		done();
	});

	it('uniqueKey works when it is a function', function(done){
		var model = new SlugModel({
			name: 'Joe Montana'
		});

		expect(model.uniqueKey()).equals('joe-montana');
		expect(model.id).to.not.be.ok;
		done();
	});

	it('uniqueKey does not break a model', function(done) {
		var model = new NoUniqueModel({
			name: 'Jerry Rice'
		});

		expect(model.uniqueKey).to.be.ok;
		expect(model.id).not.to.be.ok;
		model.save().then(function() {
			expect(model.id).to.be.ok;
			done();
		});
	});

	it('a model is saved with its uniqueKey as id', function(done){
		var model = new ExampleModel({
			name: 'Troy Aikman'
		});
		var key = model.uniqueKey();
		expect(key).equals('Troy Aikman');
		model.save().then(function(model) {
			expect(model.id).equals(key);
			done();
		});
	});

	it('a model is saved with its uniqueKey as id', function(done){
		var model = new SlugModel({
			name: 'Troy Aikman'
		});
		var key = model.uniqueKey();
		expect(key).equals('troy-aikman');
		model.save().then(function(model) {
			expect(model.id).equals(key);
			done();
		});
	});

	it('model.get works with the specified key', function(done){
		var models = new ExampleCollection();
		models.fetchOne('Troy Aikman').then(function(model){
			console.log(model);
		})
	})


});
