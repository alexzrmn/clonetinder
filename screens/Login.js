import * as Facebook from 'expo-facebook';
import React, {Component} from 'react';
import {View, StyleSheet} from 'react-native';
import FacebookButton from '../components/FacebookButton';
import * as firebase from 'firebase';

export default class Login extends Component {

    authenticate = (token) => {
      const provider = firebase.auth.FacebookAuthProvider;
      const credential = provider.credential(token);
      return firebase.auth().signInWithCredential(credential);
    }

    login = async () => {
      try {
          await Facebook.initializeAsync({
            appId: '425339328812598'
          });
          const {type, token} = await Facebook.logInWithReadPermissionsAsync({
            permissions: ['public_profile', 'email'],
          });
          if (type === 'success') {
            const response = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
            console.log(await response.json());
            this.authenticate(token);
          } else {
            // type === 'cancel'
          }
        } catch ({ message }) {
          console.log(`Face Login Error: ${message}`);
        }
    }

    render() {
      return (
        <View style={styles.container}>
          <FacebookButton
            onPress={this.login} //{() => this.props.navigation.navigate('Home')}
          />
        </View>
      )
    }
}
  
  const styles = StyleSheet.create({
    container: {
      flex:1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  })