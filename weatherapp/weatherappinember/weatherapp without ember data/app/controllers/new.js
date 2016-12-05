import Ember from 'ember';
import DataManager from 'weatherapp/datamanager';

var NewController = Ember.ArrayController.extend({
  searchTerm: '',

  actions: {
    addCity: function(city) {
      DataManager.addCity(city);
      this.transitionToRoute('/');
    }
  },

  isNewSearch: function () {
    return this.get('searchTerm').length === 0;
  }.property('searchTerm'),

  isEmptySearch: function () {
    return this.get('content').length === 0 && this.get('searchTerm').length > 2;
  }.property('searchTerm'),

  searchTermDidChange: function() {
    var self = this;
    if(this.get('searchTerm').length > 2) {
      return Ember.$.ajax({
        url: 'http://coen268.peterbergstrom.com/locationautocomplete.php?query=%@'.fmt(this.get('searchTerm')),
        dataType: 'jsonp'
      }).then(function(response) {
        self.set('content', response);
      });
    } else if(this.get('isNewSearch')){
      this.set('content', []);
    }
  }.observes('searchTerm')
});

export default NewController;