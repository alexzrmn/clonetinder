
import * as Facebook from 'expo-facebook';
import React, {Component} from 'react';
import {View, StyleSheet} from 'react-native';
import FacebookButton from '../components/FacebookButton';


export default class Login extends Component {

    login = async () => {
      try {
          await Facebook.initializeAsync({
            appId: '425339328812598',
            appName: ''
          });
          const {type, token} = await Facebook.logInWithReadPermissionsAsync({
            permissions: ['public_profile'],
          });
          if (type === 'success') {
            const response = await fetch(`https://graph.facebook.com/me?access_token=${token}`)
            console.log(await response.json())
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