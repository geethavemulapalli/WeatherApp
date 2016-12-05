import Ember from 'ember';
import ConditionsModel from 'weatherapp/models/conditions';

var City = Ember.Object.extend({
  id: null,
  name: null,
  lat: null,
  lng: null,
  lastUpdated: -1,
  weatherData: null,
  
  timeRefreshInterval: 5000,

  isCurrentLocation: function() {
    return this.get('id') === 'currentlocation';
  }.property('id'),
  
  isNight: function() {
    return !this.get('isDay');
  }.property('isDay'),
    
  isDay: function() {
    var ret = false;
    
    var latestHourlyCondition = this.get('hourlyConditions.0');
    var todaysDailyCondition = this.get('dailyConditions.0');
    
    if (latestHourlyCondition && todaysDailyCondition) {
      ret = (latestHourlyCondition.get('time') >= todaysDailyCondition.get('sunriseTime') && 
              latestHourlyCondition.get('time') <= todaysDailyCondition.get('sunsetTime'));
    }

   return ret;
  }.property('latestConditions'),
  
  isCloudy: function() {
    return this.get('currentCondition.cloudCover') > 0.2;
  }.property('latestConditions'),
  
  summary: function() {
    return this.get('weatherData.daily.summary');
  }.property('weatherData'),
  
  currentCondition: function() {
    var condition = ConditionsModel.create(this.get('weatherData.currently'));
    condition.set('offset', this.get('weatherData.offset'));
    return condition;
  }.property('weatherData'),
  
  hourlyConditions: function() {
    return this._generateConditions(this.get('weatherData.hourly.data'));
  }.property('weatherData'),
  
  dailyConditions: function() {
    return this._generateConditions(this.get('weatherData.daily.data'));
  }.property('weatherData'),
  
  listDisplayTime: function() {
    return this.get('currentCondition').displayTimeFullRelativeToLastUpdatedDate(this.get('lastUpdated'));
  }.property('currentCondition'),
  
  // HELPERS
  _generateConditions: function(rawHourlyConditions) {
     var ret = []; 

      if (rawHourlyConditions) {
        for(var i=0, iLen=rawHourlyConditions.length; i<iLen; i++) {
          var condition = ConditionsModel.create(rawHourlyConditions[i]);
          condition.set('offset', this.get('weatherData.offset'));
          ret.push(condition);
        }
      }
      return ret;
  },
  
  init: function() {
    this._super();
    
    var self = this;
    var refreshCurrentCondition = function() {
      self.notifyPropertyChange('listDisplayTime');
      Ember.run.later(refreshCurrentCondition, self.get('timeRefreshInterval'));
    };
    refreshCurrentCondition();
   
  }

});


export default City;