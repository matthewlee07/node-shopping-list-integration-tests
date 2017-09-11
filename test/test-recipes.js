const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();
chai.use(chaiHttp);

describe ('Recipes', function(){
  /*Before our tests run, we activea the server. Our 'runServer' funcation returns a promise,
  and we reutrn that promise by doing 'return runServer' If we didn't return a promise here,
  there's  possibility of a race condition where our tests start running before our
  server has started.   
  */
  before(function(){
    return runServer();
  });

  after(function(){
  /*although we only have on test module at the moment, we'll close our server
  at the end of these tests. Otherwise, if we add another test module that also has a
  'before' block that starts our server, it will cause an error because the server 
  would still be running form the previous tests */
    return closeServer();
  });

  it('should list items on GET', function(){
    return chai.request(app)
      .get('/recipes')
      .then(function(res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body.length.should.be.at.least(1);
        const expectedKeys = ['id', 'name', 'ingredients'];
        res.body.forEach(function(item){
          item.should.be.a('object');
          item.should.include.keys(expectedKeys);
        });
      });
  });

  it('should add an item on POST', function() {
    const newRecipe = {name: 'apple pie', ingredients:['apples', 'crust']};
    return chai.request(app)
      .post('/recipes')
      .send(newRecipe)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys('id', 'name', 'ingredients');
        res.body.name.should.equal(newRecipe.name);
        res.body.ingredients.should.be.a('array');
        res.body.ingredients.should.include.members(newRecipe.ingredients);
        //is this required?
        // res.body.id.should.not.be.null;
        // res.body.should.deep.equal(Object.assign(newRecipe, {id: res.body.id}));
      });
  });
  it('should update items on PUT', function(){
    const updateRecipe = {
      name: 'blueberry pie',
      ingredients: ['blueberries', 'crust']
    };
    return chai.request(app)
      .get('/recipes')
      .then(function(res){
        updateRecipe.id = res.body[0].id;
        return chai.request(app)
          .put(`/recipes/${updateRecipe.id}`)
          .send(updateRecipe);
      })
      .then(function(res){
        res.should.have.status(204);
      });
  });

  it('should delete items on DELETE', function() {
    return chai.request(app)
      // first have to get so we have an `id` of item
      // to delete
      .get('/shopping-list')
      .then(function(res) {
        return chai.request(app)
          .delete(`/recipes/${res.body[0].id}`);
      })
      .then(function(res) {
        res.should.have.status(204);
      });
  });  

});
