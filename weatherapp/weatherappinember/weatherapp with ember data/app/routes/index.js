import Ember from 'ember';
import CurrentLocationMixin from 'weatherapp/mixins/currentlocation';

var IndexRoute = Ember.Route.extend(CurrentLocationMixin, {
  
  model: function() {
    return this.store.find('city');
  }
});


export default IndexRoute;