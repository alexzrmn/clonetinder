import React, { Component } from 'react';
import {View, Text, FlatList, TouchableHighlight} from 'react-native';

import * as firebase from 'firebase';
import _ from 'lodash';

import CircleImage from '../components/CircleImage'

export default class Matches extends Component {
  constructor(props) {
    super(props)
    this.state = {
      matches: [],

    }
    this.getMatches(this.props.user.uid)
  }

  


  getOverlap = (liked, likedBack) => {
    const likedTrue = _.pickBy(liked, value => value)
    const likedBackTrue = _.pickBy(likedBack, value => value)
    return _.intersection(_.keys(likedTrue), _.keys(likedBackTrue))
  }

  getUser = (uid) => {
    return firebase.database().ref('users').child(uid).once('value')
      .then(snap => snap.val());
  }

  getMatches = (uid) => {
    firebase.database().ref('relationships').child(uid).on('value', snap => {
      
      const relations = snap.val() || [];
      const allMatches = this.getOverlap(relations.liked, relations.likedBack)
      console.log('allMatches', allMatches)
      
      const promises = allMatches.map(profileUid => {
        const foundProfile = _.find(this.state.matches, profile => profile.uid === profileUid)
        return foundProfile ? foundProfile : this.getUser(profileUid)
      })
      Promise.all(promises).then(data => this.setState({
        matches: data,
      }))
    })
  }
  
  _keyExtractor = (item) => item.id

  renderItem({ item }) {
    const {id, first_name, work} = item
    const bio = (work && work[0] && work[0].position) ? work[0].position.name : null
    return (
      <TouchableHighlight
        onPress={() => this.props.navigation.navigate('Chat', {user: this.props.user, profile: item})}
      >
        <View style={{flexDirection:'row', backgroundColor:'white', padding:10}} >
          <CircleImage size={80} facebookID={id} />
          <View style={{justifyContent:'center', marginLeft:10}} >
            <Text style={{fontSize:18}} >{first_name}</Text>
            <Text style={{fontSize:15, color:'darkgrey'}} >{bio}</Text>
          </View>
        </View>
      </TouchableHighlight>
    )
  }


  render() {
    return(
      <FlatList
        data={this.state.matches}
        style={{flex:1, backgroundColor:'white'}}
        renderItem={this.renderItem.bind(this)}
        keyExtractor={this._keyExtractor}
      />
    )
  }
}
