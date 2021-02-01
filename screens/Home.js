import React, { Component } from "react";
import { View } from "react-native";
import Card from "../components/Card";
import * as firebase from 'firebase';
import * as Location from 'expo-location';
import {GeoFire} from "geofire";

require('@firebase/database');

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      profileIndex: 0,
      profiles: []
    };

    this.updateUserLocation(this.props.route.params.uid);
    this.getProfiles(this.props.route.params.uid);
    console.log(this.props.route.params.uid)
  }

  getUser = (uid) => {
    return firebase.database().ref('users').child(uid).once('value')
  }

  getProfiles = async (uid) => {
    const geofireRef = new GeoFire(firebase.database().ref('geoData'));
    const userLocation = await geofireRef.get(uid);
    console.log('userLocation', userLocation);
    const geoQuerry = geofireRef.query({
      center: userLocation,
      radius: 10
    });
    geoQuerry.on('key_entered', async (key, location, distance) => {
      console.log(`${key} at ${location} is ${distance} km from the center`);
      const user = await this.getUser(uid);
      console.log(user.val().first_name);
      const profiles = [...this.state.profiles, user.val()];
      this.setState({profiles});
    })
  }

  updateUserLocation = async (uid) => {
    const { status } = await Location.requestPermissionsAsync();
    if(status === 'granted') {
      const location = await Location.getCurrentPositionAsync({ enableHighAccuracy: false});
      // const {latitude, longitude} = location.coords;
      const latitude = 37.39239;
      const longitude = -122.09072;

      const geoFireRef = new GeoFire(firebase.database().ref('geoData'));
      geoFireRef.set(uid, [latitude, longitude]);

      console.log('granted !!', location);
    } else {
      console.log('Permission denied');
    }
  }

  nextCard = () => {
    this.setState({ profileIndex: this.state.profileIndex + 1 });
  };

  render() {

    const { profiles } = this.state;
    const { profileIndex } = this.state;
      
    return (
      <View style={{ flex: 1 }}>
        {profiles
          .slice(profileIndex, profileIndex + profiles.length)
          .reverse()
          .map((profile) => {
            return (
              <Card
                key={profile.id}
                profile={profile}
                onSwipeOff={this.nextCard}
              />
            );
          })}
      </View>
    );
  }
}