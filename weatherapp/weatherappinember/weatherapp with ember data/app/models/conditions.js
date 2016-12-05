import Ember from 'ember';

var ConditionsModel = Ember.Object.extend({

  dayName: function() {
    return this._weekDayForDate(this._computeLocalDate(this.get('time'), this.get('offset')));
  }.property('time', 'offset'),
  
  localDayName: function() {
    var localDate  = this._computeLocalDate(this.get('time'), this.get('offset')),
    diff           = Math.round((localDate.getTime() - new Date().getTime())/(24*3600*1000)),
    localDayName   = 'Today';
    if(diff < 0) {
      localDayName = 'Yesterday';
    } else if(diff > 0) {
      localDayName = 'Tomorrow';
    }
    return localDayName;
  }.property('time', 'offset'),

  iconPath: function() {
    return 'images/%@.png'.fmt(this.get('icon'));
  }.property('icon'),
  
  displayTemperature: function() {
    return this._formatTemperature(this.get('temperature'), this.get('useUSUnits'));
  }.property('temperature', 'useUSUnits'),

  displayTemperatureMax: function() {
    return this._formatTemperature(this.get('temperatureMax'), this.get('useUSUnits'));
  }.property('temperatureMax', 'useUSUnits'),

  displayTemperatureMin: function() {
    return this._formatTemperature(this.get('temperatureMin'), this.get('useUSUnits'));
  }.property('temperatureMin', 'useUSUnits'),

  displayTimeFull: function() {
    return this._formatTime(this._computeLocalDate(this.get('time'), this.get('offset'), new Date().getTime() - this.get('city.lastUpdated')), true);
  }.property('time', 'offset'),
  
  displayTimeShort: function() {
    return this._formatTime(this._computeLocalDate(this.get('time'), this.get('offset'), new Date().getTime() - this.get('city.lastUpdated')), false);
  }.property('time', 'offset'),
  
  displaySunriseTime: function() {
    return this._formatTime(this._computeLocalDate(this.get('sunriseTime'), this.get('offset')), true);
  }.property('sunriseTime', 'offset'),
    
  displaySunsetTime: function() {
    return this._formatTime(this._computeLocalDate(this.get('sunsetTime'), this.get('offset')), true);
  }.property('sunsetTime', 'offset'),

  chanceOfPrecipitationTypeString: function() {
    return this.get('precipType') === 'snow' ? 'Chance of Snow:' : 'Chance of Rain:';
  }.property('precipType'),
  
  displayChanceOfPrecipitation: function() {
    return this._formatPercentage(this.get('precipProbability'));
  }.property('precipProbability'),

  displayHumidity: function() {
    return this._formatPercentage(this.get('humidity'));
  }.property('humidity'),

  displayWind: function() {
    return this._formatWind(this.get('windSpeed'), this.get('windBearing'), this.get('useUSUnits'));
  }.property('windSpeed', 'windBearing', 'useUSUnits'),
  
  displayFeelsLikeTemperature: function() {
    return this._formatTemperature(this.get('apparentTemperature'), this.get('useUSUnits'));
  }.property('apparentTemperature'),
  
  displayPrecipitation: function() {
    return this._formatPrecipitation(this.get('precipIntensity'));
  }.property('displayPrecipitation'),

  displayPressure: function() {
    return this._formatPressureFromHPA(this.get('pressure'));
  }.property('pressure'),

  displayVisibility: function() {
    return this._formatVisibilty(this.get('visibility'));
  }.property('visibility'),

  displayTimeFullRelativeToLastUpdatedDate: function(lastUpdatedTime) {
    return this._formatTime(this._computeLocalDate(this.get('time'), this.get('offset'), new Date().getTime() - lastUpdatedTime), true);
  },
  
  
  // HELPERS
  
  _computeLocalDate: function(time, timezoneOffset, timeOffsetSinceLastRefresh) {
    timeOffsetSinceLastRefresh = timeOffsetSinceLastRefresh ? timeOffsetSinceLastRefresh : 0;
    var date  = new Date(time * 1000 + timeOffsetSinceLastRefresh);
    var utc   = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes());
    utc.setHours(utc.getHours() + timezoneOffset);
    return utc;
  },
  
  _formatVisibilty: function(visibility, useUSUnits) {
    var distance    = (useUSUnits ? visibility * 0.621371 : visibility).toFixed(2);
    
    return distance + ((useUSUnits) ? ' mi' : ' km');
  },
  
  _formatPrecipitation: function(precipitation, useUSUnits) {
    if(precipitation === 0) {
      return '--';
    }
    var amount = ((useUSUnits) ? (precipitation * 0.0393701).toFixed(2) : precipitation);
    
    return amount + ((useUSUnits) ? ' in' : ' mm');
  },
  
  _formatPressureFromHPA: function(pressure, useUSUnits) {
    if(useUSUnits) {
      return ((pressure*0.000295299830714*100).toFixed(2)) + " in";
    }
    return (pressure).toFixed(2) + ' hPa';
  },
  
  _formatPercentage: function(value) {
    return Math.round(value * 100) + "%";
  },
  
  _formatTime: function(date, showMinutes) {
    var hours = date.getHours();
    var meridian = 'AM';
    
    if(hours >= 12) {
      if(hours > 12) {
        hours -= 12;
      }
      meridian = 'PM';
    }
    if (hours === 0) {
      hours = 12;
    }
    
    if(showMinutes) {
      var minutes = date.getMinutes();
      if(minutes < 10) {
        minutes = '0'+minutes;
      }
      
      return hours + ':' + minutes + ' ' + meridian;
    }
    return hours + ' ' + meridian;
  },
  
  _formatWind: function(windSpeed, windBearing, useUSUnits) {
    var speed = (useUSUnits ? windSpeed * 0.621371 : windSpeed).toFixed(1);
    
    return speed + (useUSUnits ? ' mph' : ' kph') + ' ' + this._formatBearing(new Date(windBearing), true);
  },
  
  _formatBearing: function(brng) {
    // From: http://stackoverflow.com/questions/3209899/determine-compass-direction-from-one-lat-lon-to-the-other
    var bearings = ["NE", "E", "SE", "S", "SW", "W", "NW", "N"],
        index    = brng - 22.5;
        
    if (index < 0) {
      index += 360;
    }
    index = parseInt(index / 45);

    return(bearings[index]);
  },
  
  _formatTemperature: function(temp, useUSUnits) {
    return Math.round(useUSUnits ? (temp * 9/5 + 32) : temp) +"˚";
  },

  _weekDayForDate: function(date) {
    return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"][date.getDay()];
  }
});


export default ConditionsModel;