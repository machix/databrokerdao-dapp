import React, { Component } from 'react';
import { withScriptjs, withGoogleMap, GoogleMap } from "react-google-maps"

import LandingMapMarker from './LandingMapMarker';

export default withScriptjs(withGoogleMap(class LandingMap extends Component {
  render() {
    return (
      <GoogleMap
        defaultZoom={14}
        defaultCenter={{ lat: 50.889244, lng: 4.700518 }}
      >
        <LandingMapMarker position={{ lat: 50.878421, lng: 4.699932 }}/>
      </GoogleMap>
    );
  }
}))
