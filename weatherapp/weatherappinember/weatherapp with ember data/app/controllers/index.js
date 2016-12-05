import Ember from 'ember';

var IndexController = Ember.ArrayController.extend({
  actions: {
    startEditing: function() {
      this.set('isEditing', true);
    },
    endEditing: function() {
      this.set('isEditing', false);
    },
    toggleUnits: function() {
      this.store.find('city').then(function(cities) {
        for(var i=0, iLen=cities.get('length'); i<iLen; i++) {
          var city = cities.objectAt(i);
          city.toggleProperty('useUSUnits');
          city.save();
        }
      });
      this.notifyPropertyChange('isFahrenheit');
    },
    delete: function(id) {
      this.store.find('city', id).then(function(city) {
        city.destroyRecord();
      });
    }
  }, 

  isEditing: false,
  
  isFahrenheit: function() {
    if (this.get('model.length') > 0) {
      return this.get('model').objectAt(0).get('useUSUnits');
    }
  }.property('model.length'),
  
  isCelsius: function() {
    return !this.get('isFahrenheit');
  }.property('isFahrenheit')
   
});


export default IndexController;