import Ember from 'ember';

var CityController = Ember.ObjectController.extend({
  
  actions: {
    goToPreviousCity: function() {
      if (this.get('canGoToPreviousCity')) {
        var cities             = this.get('cities'),
            indexOfCurrentCity = cities.indexOf(this.get('model'));
        this.transitionToRoute('/city/%@'.fmt(cities.objectAt(indexOfCurrentCity-1).get('id')));
      }
    },
    goToNextCity: function() {
      if (this.get('canGoToNextCity')) {
        var cities             = this.get('cities'),
            indexOfCurrentCity = cities.indexOf(this.get('model'));
        this.transitionToRoute('/city/%@'.fmt(cities.objectAt(indexOfCurrentCity+1).get('id')));
      }
    },
    toggleUnits: function() {
      this.store.find('city').then(function(cities) {
        for(var i=0, iLen=cities.get('length'); i<iLen; i++) {
          var city = cities.objectAt(i);
          city.toggleProperty('useUSUnits');
          city.save();
        }
      });
    }
  },

  modelDidChange: function() {
    var self = this,
        city = this.get('model');
    
    if (!city) {
      return;
    }
    
    this.store.find('city').then(function(cities) {
        var length = cities.get('length'),
            cityId = city.get('id'),
            dots   = [];


        for (var i=0; i<length; i++) {
          var dot = {};
          if(cityId === cities.objectAt(i).get('id')) {
            dot.isCurrent = true;
          }
          dots.push(dot);
        }

        self.set('canGoToPreviousCity',       (cities.indexOf(city) > 0))
            .set('canGoToNextCity',           (cities.indexOf(city) < length-1))
            .set('shouldShowNextPreviousNav', length > 1)
            .set('cityDots',                  dots)
            .set('cities',                    cities);
    });

  }.observes('model').on('init'),
  
  canGoToPreviousCity:       false,
  canGoToNextCity:           false,
  shouldShowNextPreviousNav: false,
  cityDots:                  [],
  cities:                    [],
  
  isFahrenheit: function() {
    return this.get('useUSUnits') === true;
  }.property('useUSUnits'),
  
  isCelsius: function() {
    return !this.get('isFahrenheit');
  }.property('isFahrenheit'),
  
  widthOfHourlyForecasts: function() {
    if (this.get('hourlyConditions')) {
      return 'width: %@px;'.fmt(this.get('hourlyConditions').length * 64);
    } 
    return '';
  }.property('hourlyConditions')

  
  
});


export default CityController;