/* jshint maxlen:120, expr:true */
var chai = require('chai'),
	expect = chai.expect,
	Backbone = require('Backbone'),
	_ = require('underscore');

_.str = require('underscore.string');

require('./utils/db-connect');

var ExampleModel = Backbone.Model.extend({
	dbName : 'modeltest',
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
	dbName : 'modeltest',
	model : ExampleModel
});

before(function(done){
	var exampleCollection = new ExampleCollection();
	exampleCollection.nuke(function (err) {
		if(err){
			console.log('Couln\'t nuke Db', err);
			done(err);
			return;
		}
		done(null);
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
			expect(model).to.be.ok;
			expect(model.get('name')).equals('Troy Aikman');
			expect(model.id).equals('Troy Aikman');
			done();
		});
	});


});
