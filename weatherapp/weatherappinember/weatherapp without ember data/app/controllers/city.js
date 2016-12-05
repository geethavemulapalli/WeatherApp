import Ember from 'ember';
import DataManager from 'weatherapp/datamanager';

var CityController = Ember.ObjectController.extend({
  
  actions: {
    goToPreviousCity: function() {
      if (this.get('canGoToPreviousCity')) {
        var cities             = this.get('dataManager.cities'),
            indexOfCurrentCity = cities.indexOf(this.get('model'));
        this.transitionToRoute('/city/%@'.fmt(cities.objectAt(indexOfCurrentCity-1).get('id')));
      }
    },
    goToNextCity: function() {
      if (this.get('canGoToNextCity')) {
        var cities             = this.get('dataManager.cities'),
            indexOfCurrentCity = cities.indexOf(this.get('model'));
        this.transitionToRoute('/city/%@'.fmt(cities.objectAt(indexOfCurrentCity+1).get('id')));
      }
    },
    toggleUnits: function() {
      DataManager.toggleProperty('useUSUnits');
    }
  },

  canGoToPreviousCity: function() {
    return (this.get('dataManager.cities').indexOf(this.get('model')) > 0);
  }.property('dataManager.cities', 'model'),

  canGoToNextCity: function() {
    var cities = this.get('dataManager.cities');
    return (cities.indexOf(this.get('model')) < cities.length-1);
  }.property('dataManager.cities', 'model'),

  cityDots: function() {
    var dots = [],
        cityId = this.get('model.id'),
        cities = this.get('dataManager.cities');
        
    for (var i=0, iLen=cities.length; i<iLen; i++) {
      var dot = {};
      if(cityId === cities.objectAt(i).get('id')) {
        dot.isCurrent = true;
      }
      dots.push(dot);
    }
    return dots;
  }.property('model'),
  
  isFahrenheit: function() {
    return this.get('dataManager.useUSUnits') === true;
  }.property('dataManager.useUSUnits'),
  
  isCelsius: function() {
    return this.get('dataManager.useUSUnits') === false;
  }.property('dataManager.useUSUnits'),
  
  shouldShowNextPreviousNav: function() {
    return this.get('dataManager.cities.length') > 1;
  }.property('dataManager.cities.length'),
  
  widthOfHourlyForecasts: function() {
    if (this.get('hourlyConditions')) {
      return 'width: %@px;'.fmt(this.get('hourlyConditions').length * 64);
    } 
    return '';
    
  }.property('hourlyConditions'),

  init: function() {
    this._super();
    this.set('dataManager', DataManager);
  }
  
  
});


export default CityController;