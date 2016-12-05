import Ember from 'ember';
import DataManager from 'weatherapp/datamanager';

var IndexController = Ember.ArrayController.extend({
  actions: {
    startEditing: function() {
      this.set('isEditing', true);
    },
    endEditing: function() {
      this.set('isEditing', false);
    },
    toggleUnits: function() {
      this.get('dataManager').toggleProperty('useUSUnits');
    },
    delete: function(city) {
      this.get('dataManager').deleteCity(city);
    }
  },

  isEditing: false,
  
  isFahrenheit: function() {
    return this.get('dataManager.useUSUnits') === true;
  }.property('dataManager.useUSUnits'),
  
  isCelsius: function() {
    return this.get('dataManager.useUSUnits') === false;
  }.property('dataManager.useUSUnits'),
  
  init: function() {
    this._super();
    this.set('dataManager', DataManager);
  }
});


export default IndexController;