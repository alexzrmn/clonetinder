import React, { Component } from "react";
import { View } from "react-native";
import Card from "../components/Card";
import SimpleScroller from '../components/SimpleScroller';
import Profile from './Profile';
import Matches from './Matches';
import * as firebase from 'firebase';
import * as Location from 'expo-location';
import {GeoFire} from "geofire";

import filter from '../modules/filter';


require('@firebase/database');

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      profileIndex: 0,
      profiles: [],
      user: this.props.route.params.user,
      isMounted: false
    };

    const {uid} = this.state.user;
    this.updateUserLocation(uid);
    firebase.database().ref('users').child(uid).on('value', snap => {
      const user = snap.val()
      this.setState({
        user,
        profiles: [],
        profileIndex: 0
      })
      console.log(`user updated`);
      this.getProfiles(user.uid, user.distance);
    })
  }

  componentDidMount() {
    this.setState({isMounted: true});
    this.state.profiles;
  }

  getUser = (uid) => {
    return firebase.database().ref('users').child(uid).once('value');
  }

  getSwiped = (uid) => {
    return firebase.database().ref('relationships').child(uid).child('liked')
      .once('value')
      .then(snap => snap.val() || {})
  }

  getProfiles = async (uid, distance) => {
    const geofireRef = new GeoFire(firebase.database().ref('geoData'));
    const userLocation = await geofireRef.get(uid);
    const swipedProfiles = await this.getSwiped(uid);
    console.log('userLocation', userLocation);
    const geoQuerry = geofireRef.query({
      center: userLocation,
      radius: distance
    });
    geoQuerry.on('key_entered', async (uid, location, distance) => {
      // console.log(`${uid} at ${location} is ${distance} km from the center`);
      const user = await this.getUser(uid);
      // console.log(user.val().name);
      const profiles = [...this.state.profiles, user.val()];
      const filtered = filter(profiles, this.state.user, swipedProfiles)
      this.setState({profiles: filtered});
    })
  }

  updateUserLocation = async (uid) => {
    const { status } = await Location.requestPermissionsAsync();
    console.log(`status : ${status}`)
    if(status === 'granted') {
      // const location = await Location.getCurrentPositionAsync({ enableHighAccuracy: false});
      // const {latitude, longitude} = location.coords;
      const latitude = 37.39239;
      const longitude = -122.09072;

      const geoFireRef = new GeoFire(firebase.database().ref('geoData'));
      geoFireRef.set(uid, [latitude, longitude]);

      console.log('granted !!');
    } else {
      console.log('Permission denied');
    }
  }

  relate = (userUid, profileUid, status) => {
    let relationUpdate = {};
    relationUpdate[`${userUid}/liked/${profileUid}`] = status
    relationUpdate[`${profileUid}/likedBack/${userUid}`] = status

    firebase.database().ref('relationships').update(relationUpdate)
  }

  nextCard = (swipedRight, profileUid) => {
    const userUid = this.state.user.uid;
    this.setState({ profileIndex: this.state.profileIndex + 1 });
    if (swipedRight) {
      this.relate(userUid, profileUid, true)
      this.relate(profileUid, userUid, true)
    } else {
      this.relate(userUid, profileUid, false)
    }
  };

  cardStack = () => {
    const {profileIndex} = this.state
    return (
      <View style={{flex:1}}>
        {this.state.profiles.slice(profileIndex, profileIndex + 5).reverse().map((profile) => {
          return (
            <Card
              key={profile.id}
              profile={profile}
              onSwipeOff={this.nextCard}
            />
          )
        })}
      </View>
    )
  }

  render() {      
    return (
      <SimpleScroller
        screens={[
          <Profile user={this.state.user} />,
          this.cardStack(),
          <Matches navigation={this.props.navigation} user={this.state.user} />
        ]}
      />
    );
  }
}