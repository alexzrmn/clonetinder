import * as Facebook from 'expo-facebook';
import React, {Component} from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import FacebookButton from '../components/FacebookButton';
import firebase from 'firebase';

export default class Login extends Component {
    constructor(props) {
      super(props)
      // firebase.auth().signOut()
      this.state = {
        isMounted: true,
        showSpinner: true
      }
      firebase.auth().onAuthStateChanged(user => {
        if(user) {
          this.props.navigation.replace('Home', {uid: user.uid})
        } else {
          this.setState({showSpinner: false});
        }
      });
    }

    componentDidMount() {
      this.setState({isMounted: false});
    }

    authenticate = (token) => {
      const provider = firebase.auth.FacebookAuthProvider;
      const credential = provider.credential(token);
      return firebase.auth().signInWithCredential(credential);
    }

    createUser = (uid, userData) => {
      firebase.database().ref("users").child(uid).update(userData);
    }

    login = async () => {
      this.setState({showSpinner: true});
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
            const {user} = await this.authenticate(token);
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
          {this.state.showSpinner ?
            <ActivityIndicator animating={this.state.showSpinner} /> :
            <FacebookButton onPress={this.login} />
          }
          
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