import * as Facebook from 'expo-facebook';
import React, {Component} from 'react';
import {View, StyleSheet} from 'react-native';
import FacebookButton from '../components/FacebookButton';
import firebase from 'firebase';

export default class Login extends Component {

    authenticate = (token) => {
      const provider = firebase.auth.FacebookAuthProvider;
      const credential = provider.credential(token);
      return firebase.auth().signInWithCredential(credential);
    }

    createUser = (uid, userData) => {
      console.log(uid);
      firebase.database().ref("users").child(uid).update(userData);
    }

    login = async () => {
      try {
          await Facebook.initializeAsync({
            appId: '425339328812598'
          });
          const {type, token} = await Facebook.logInWithReadPermissionsAsync({
            permissions: ['public_profile', 'email', 'user_birthday'],
          });
          if (type === 'success') {
            const fields = ['id', 'first_name', 'last_name', 'gender', 'birthday']
            const response = await fetch(`https://graph.facebook.com/me?fields=${fields.toString()}&access_token=${token}`);
            const userData = await response.json();
            console.log(userData);
            const {user} = await this.authenticate(token);
            console.log(user.uid);
            this.createUser(user.uid, userData);
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
            onPress={this.login}
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