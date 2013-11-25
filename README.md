Leveldb-backbone-adapter
=====

This is a library to run BackboneJs Models and Collection on Nodejs with persistance to LevelDb(Using sublevel for each collection).

* * *
## Installation

	npm install leveldb-backbone-adapter

### Set up

	var Backbone = require('Backbone'),
		levelDbBackboneAdapter = require('leveldb-backbone-adapter');

	levelDbBackboneAdapter(Backbone, {
		db : 'testDb'
	});

This will modify Backbone.sync method to work with sublevel persistance for regular Backbone fetch and save functions. Also levelDbBackboneAdapter will add more functions to have query capabilities against our collection.

This will make all Backbone Models and Collections to have a _db that is the sublevel for the collection, its also available for each instance of you models and collections.

### Extending the model and collection to have a db.

	var ExampleModel = Backbone.Model.extend({
		dbName : 'example'
	});

	var ExampleCollection = Backbone.Collection.extend({
		dbName : 'example',
		model : ExampleModel
	});

This way the collection and the model will have persistance to the sublevel **example**. You can have as many collections and models, each pointing to a diferent sublevel.

* * *
## Api

### Collection

All this api is for Collections instances, so the first step is

	var exampleCollection = new ExampleCollection();

**Note**: Collection Api is heavy focus on promises.

#### Collection.fetch

Will get all items in the sublevel.

	var q = exampleCollection.fetch();

	q.then(function () {
		// Do something once the collection is loaded.
	});

#### Collection.fetchFilter

Will get all items that match an object or a function.

	var q = exampleCollection.fetchFilter(function(item){
		return !item.active;
	});

	q.then(function () {
		// Do something once the collection is loaded.
	});

Or

	var q = exampleCollection.fetchFilter({active:false});

#### Collection.fetchOne

This will fetch one element from the sublevel.

	var q = exampleCollection.fetchOne(function(item){
		return !item.active;
	});

	q.then(function (model) {
		// Do something with the model
	});

**Note**: Model is not added to the collection.

### Model

**Note**: Model Api works with promises and callbacks.

#### Model.get()

Will get a model by key from the data base and return it as a model.

	ExampleModel.get(key, function(err, model){
		// Do something with the model.
	});

or 

	var q = ExampleModel.get(data.get('id'));

	q.then(function(model){
		// Do something with the model.
	});	

#### Model.find()

Will get a model that matches the object or function suplied as query. It will throw a error if you have more than one element matching the query.

With callback:

	ExampleModel.find({name:'some name'}, function(err, model){
		// Do something with the model.
	});

or

	ExampleModel.find(function(data){
		return data.name === 'somename';
	},function(err,model){
		// Do something with the model.
	});

With promise

	var q = ExampleModel.find({name:'Aaron Rodgers'});

	q.then(function (model) {
		// Do something with the model.
	});

or

	var q = ExampleModel.find(function(data){
		return data.name === 'somename';
	});

	q.then(function(model){
		// Do something with the model.
	});	

### model instance

#### create a new model

With promise:

	var model = new ExampleModel({/* Some data */});

	var q = model.save();

	q.then(function(model){
		// Do something with the model.
	});

With callback[Not that clean]:

	var model = new ExampleModel({/* Some data */});

	var fn = function(){
		// Do something with the model.
	}

	model.save(null, {success:fn});

#### model.save()

	model.save('attr', value, {success: function (/* model */) {
		// Do something with the model.
	} } );

or

	model.set('active', true);

	var q = model.save();

	q.then(function(model){
		// Do something with the model.
	});	

**Note**: to handle errors with a promise use:

	q.then(function(model){
		// Do something with the model.
	}).fail(function(err){
		// Handle error.
	});

or just handle errors with 

	q.fail(function(err){
		// Handle error.
	});

You could make a generic error handler and pass it to all you promises.

* * *
## To Dos

- Allow to have levelDb persistance just in some collections.
- Make collection take database form the model.
- Implement callback api for Collection functions.