import Ember from 'ember';
import DataManager from 'weatherapp/datamanager';

var IndexRoute = Ember.Route.extend({
  
  revisionCount: Ember.computed.alias('dataManager.revisionCount'),

  citiesDidChange: function() {
    this.refresh();
  }.observes('revisionCount'),
  
  model: function() {
    return this.get('dataManager').findAllCities();
  },

  init: function() {
    this.set('dataManager', DataManager);
  }
  
});


export default IndexRoute;