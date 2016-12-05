import Ember from 'ember';
import CurrentLocationMixin from 'weatherapp/mixins/currentlocation';

var CityRoute = Ember.Route.extend(CurrentLocationMixin, {

  model: function(params) {
    return this.store.find('city', params.city_id);
  }

});


export default CityRoute;