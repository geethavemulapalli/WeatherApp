import Ember from 'ember';

export default Ember.Mixin.create({
  
  afterModel: function() {
    var self = this,
        currentLocationCity;
    
    // Find all cities here because ember data will crash if you try
    // to find a city that doesn't exist, like 'currentlocation' when it
    // is a new app install.
    this.store.find('city').then(function(cities) {
      if (navigator.geolocation) {

        for(var i=0, iLen=cities.get('length'); i<iLen; i++) {
          var city = cities.objectAt(i);
          if(city.get('id') === 'currentlocation') {
            currentLocationCity = city;
            break;
          }
        }
        
        var success = function(position) {
          var lat = position.coords.latitude,
              lng = position.coords.longitude;

          if(!currentLocationCity) {
            
            // If you can get location, then try to get.
            currentLocationCity = self.store.createRecord('city', {
              id:   'currentlocation',
              name: 'Current Location',
              lat:  lat,
              lng:  lng
            });
            currentLocationCity.save().then(function(){
              self.refresh();
            });
          } else {
            currentLocationCity.set('lat', lat).set('lng', lng).save();
            currentLocationCity.updateWeatherData();
          }
        };
        var failure = function() {
          currentLocationCity.destroyRecord();
        };

        navigator.geolocation.getCurrentPosition(success, failure);
      } else {
        currentLocationCity.destroyRecord();
      }      
    });
  }
});