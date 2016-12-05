import Ember from 'ember';

var NewRoute = Ember.Route.extend({
  setupController: function(controller) {

    // Clear out the search term
    controller.set('searchTerm', '');
  }
});


export default NewRoute;