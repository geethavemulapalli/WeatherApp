import Ember from 'ember';
import DS from 'ember-data';
import ConditionsModel from 'weatherapp/models/conditions';

var City = DS.Model.extend({
  name: DS.attr('string'),
  lat:  DS.attr('string'),
  lng:  DS.attr('string'),
  useUSUnits: DS.attr('boolean', {
    defaultValue: true
  }),
  lastUpdated: DS.attr('number', {
    defaultValue: -1
  }),
  
  weatherData: DS.attr(),
  
  timeRefreshInterval: 5000,
  
  // The data is set to refresh every 10 minutes or 600,000 milliseconds.
  dataRefreshInterval: 600000,

  hasValidWeatherData: function() {
    return !!this.get('weatherData');
  }.property('weatherData'),

  isCurrentLocation: function() {
    return this.get('id') === 'currentlocation';
  }.property('id'),
  
  isNight: function() {
    return !this.get('isDay');
  }.property('isDay'),
    
  isDay: function() {
    var ret                   = false,
        latestHourlyCondition = this.get('hourlyConditions.0'),
        todaysDailyCondition  = this.get('dailyConditions.0');
    
    if (latestHourlyCondition && todaysDailyCondition) {
      ret = (latestHourlyCondition.get('time') >= todaysDailyCondition.get('sunriseTime') && 
              latestHourlyCondition.get('time') <= todaysDailyCondition.get('sunsetTime'));
    }

   return ret;
  }.property('weatherData', 'latestConditions', 'useUSUnits'),
  
  isCloudy: function() {
    return this.get('currentCondition.cloudCover') > 0.2;
  }.property('latestConditions', 'useUSUnits'),
  
  summary: function() {
    return this.get('weatherData.daily.summary');
  }.property('weatherData'),
  
  currentCondition: function() {
    return this._generateConditions([this.get('weatherData.currently')])[0];
  }.property('weatherData', 'useUSUnits'),
  
  hourlyConditions: function() {
    return this._generateConditions(this.get('weatherData.hourly.data'));
  }.property('weatherData', 'useUSUnits'),
  
  dailyConditions: function() {
    return this._generateConditions(this.get('weatherData.daily.data'));
  }.property('weatherData', 'useUSUnits'),
  
  listDisplayTime: function() {
    return this.get('currentCondition').displayTimeFullRelativeToLastUpdatedDate(this.get('lastUpdated'));
  }.property('currentCondition'),
  
  // HELPERS
  _generateConditions: function(rawHourlyConditions) {
     var ret = []; 

      if (rawHourlyConditions) {
        for(var i=0, iLen=rawHourlyConditions.length; i<iLen; i++) {
          var condition = ConditionsModel.create(rawHourlyConditions[i]);
          condition.set('offset',     this.get('weatherData.offset'))
                   .set('useUSUnits', this.get('useUSUnits'));
          
          ret.push(condition);
        }
      }
      return ret;
  },
  
  updateListDisplayTime: function() {
    this.notifyPropertyChange('listDisplayTime');
    Ember.run.later(this, 'updateListDisplayTime', this.get('timeRefreshInterval'));
  },
  
  updateWeatherData: function() {
    var self = this;

    if(self.get('lastUpdated') === -1 || (new Date().getTime() > self.get('lastUpdated')+self.get('dataRefreshInterval'))) {
      Ember.$.ajax({
        url: 'https://api.forecast.io/forecast/%@/%@,%@?units=si'.fmt('e157d0906b1d14f719ca4d1ad2a05325', self.get('lat'), self.get('lng')),
        jsonp: 'callback',
        dataType: 'jsonp',
        success: function(weatherData) {
          self.set('weatherData', weatherData).set('lastUpdated', new Date().getTime()).save();
        }
      });
      Ember.run.later(this, 'updateWeatherData', this.get('dataRefreshInterval'));
    }
  },
  
  ready: function() {
    this.updateListDisplayTime();
    this.updateWeatherData();
  }

});


export default City;