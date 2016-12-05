import Ember from 'ember';
import City from 'weatherapp/models/city';

export default Ember.Object.extend({

  // Keep a revision counter.
  revisionCount: 0,
  
  // The API URL
  weatherURLFormat:   'https://api.forecast.io/forecast/%@/%@,%@?units=si',
  
  // The API key. Replace with your own.
  weatherAPIKey: 'e157d0906b1d14f719ca4d1ad2a05325',

  // The key for the current location that will be kept in the data. It is special so it is defined here.
  currentLocationKey: 'currentlocation',

  // Properties that get loaded from local storage.
  cities: [],
  useUSUnits: true,
  
  // The data is set to refresh every 10 minutes or 600,000 milliseconds.
  dataRefreshInterval: 600000,

  // Whenever the data changes, sync to the local storage.
  dataDidChange: function() {
    this.syncLocalStorage();
    this.incrementProperty('revisionCount');
  },

  useUSUnitsDidChange: function() {
    this.dataDidChange();
  }.observes('useUSUnits'),
  
  
  // Local storage sync
  loadCitiesFromLocalStorage: function() {
    var localStorageCities = JSON.parse(localStorage.getItem("cities"));
    var cities = [];
    if(localStorageCities && localStorageCities.length) {
      for(var i=0, iLen=localStorageCities.length; i<iLen; i++) {
        cities.push(City.create(localStorageCities[i]));
      }
    }
    this.set('cities', cities);
    
    
    var useUSUnits = JSON.parse(localStorage.getItem("useUSUnits"));
    if(useUSUnits === null || useUSUnits === undefined) {
      useUSUnits = true;
    }
    this.set('useUSUnits', useUSUnits);

  },
  
  syncLocalStorage: function() {
    localStorage.setItem("cities", JSON.stringify(this.get('cities')));
    localStorage.setItem("useUSUnits", JSON.stringify(this.get('useUSUnits')));
  },
  
  // Location
  currentLocationWasUpdated: function(position) {
    var city = this.cityDataForId(this.get('currentLocationKey')),
        shouldPush = false;

    if(!city) {
      city = City.create({
        id: this.get('currentLocationKey'),
        weatherData: null
      });

      shouldPush = true;
    } 
    
    city.set('name', 'Current Location');
    city.set('lat',  position.coords.latitude);
    city.set('lng', position.coords.longitude);
    
    if (shouldPush) {
      this.get('cities').unshift(city);
    }
    this.dataDidChange();
  },

  currentLocationWasDenied: function() {
    var cities = this.get('cities'),
        city   = this.cityDataForId(this.get('currentLocationKey'));
    if (city) {
      cities.splice(cities.indexOf(city), 1);
    }
    this.dataDidChange();
  },
  
  // Adding and removing cities
  addCity: function(city) {
    if (city) {
      var cities       = this.get('cities'),
          existingCity = this.cityDataForId(city.id);
          
      if(!existingCity) {
        var newCity = City.create({
          id: city.id,
          name: city.displayName,
          lat: city.lat,
          lng: city.lng,
          weatherData: null,
          lastUpdated: -1
        });
        cities.push(newCity);
        this.dataDidChange();
      }
    }
  },
  
  deleteCity: function(city) {
    if (city) {
      var cities = this.get('cities');
      
      cities.splice(cities.indexOf(city), 1);
      this.dataDidChange();
    }
  },
  
  // Finding cities
  findCity: function(id) {
    var city = this.cityDataForId(id);
    if (this.shouldRefreshCity(city)) {
      return this.fetchDataForCity();
    } else {
      return city;
    }
  },
  
  findAllCities: function() {
    var self = this;
    var promises = self.get('cities').map(function(city) {
      if (self.shouldRefreshCity(city)) {
        self.fetchDataForCity(city);
      } else {
        return city;
      }
    });
    return new Ember.RSVP.all(promises);
  },
  
  fetchDataForCity: function(city) {
    var self = this;
    return Ember.$.ajax({
      url: self.get('weatherURLFormat').fmt(self.get('weatherAPIKey'), city.get('lat'), city.get('lng')),
      jsonp: 'callback',
      dataType: 'jsonp',
      success: function(weatherData) {
        city.set('weatherData', weatherData).set('lastUpdated', new Date().getTime());
        self.dataDidChange();
      }
    });
  },
  
  // HELPERS
  shouldRefreshCity: function(city) {
    return (city && (city.get('lastUpdated') === -1 || (new Date().getTime() > city.get('lastUpdated')+this.get('dataRefreshInterval'))));
  },

  cityDataForId: function(id) {
    var cities = this.get('cities');
    for(var i=0, iLen=cities.length; i<iLen; i++) {
      if(cities[i].id === id) {
        return cities[i];
      }
    }
    return null;
  },
  
  init: function() {
    this.loadCitiesFromLocalStorage();

    // Set up periodic data refresh.
    var self = this,
        refresh = function() {
          self.findAllCities();
          Ember.run.later(refresh, self.get('dataRefreshInterval'));
        };

    // Of course, kick off the refresh.
    refresh();
  
    // If you can get location, then try to get.
    if (navigator.geolocation) {
      
      var success = function(position) {
        self.currentLocationWasUpdated(position);
      };
      var failure = function(error) {
        self.currentLocationWasDenied(error);
      };
      
      navigator.geolocation.getCurrentPosition(success, failure);
    }
    
  }
  
}).create();
