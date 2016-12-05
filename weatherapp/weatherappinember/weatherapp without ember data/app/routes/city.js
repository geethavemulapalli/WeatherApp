import Ember from 'ember';
import DataManager from 'weatherapp/datamanager';

var CityRoute = Ember.Route.extend({

  revisionCount: Ember.computed.alias('dataManager.revisionCount'),

  citiesDidChange: function() {
    this.refresh();
  }.observes('revisionCount'),

  model: function(params) {
    return this.get('dataManager').findCity(params.city_id);
  },
  
  init: function() {
    this.set('dataManager', DataManager);
  }

});


export default CityRoute;