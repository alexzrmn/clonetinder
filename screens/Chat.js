
import React, { Component } from 'react';
import * as firebase from 'firebase';
import {GiftedChat} from 'react-native-gifted-chat'

export default class Chat extends Component {
    constructor(props) {
        super(props)

        this.state = {
          messages: [],
          user: this.props.route.params.user,
          profile: this.props.route.params.profile
        }

        const {user, profile} = this.state
        this.chatID = user.uid > profile.uid ? user.uid + '-' + profile.uid : profile.uid + '-' + user.uid

        this.watchChat();
    }

    watchChat = () => {
      firebase.database().ref('messages').child(this.chatID).on('value', snap => {
        let messages = []
        snap.forEach(message => {
          messages.push(message.val())
        })
        messages.reverse()
        this.setState({messages})
      })
    }

    onSend = (message) => {
      firebase.database().ref('messages').child(this.chatID)
        .push({
          ...message[0],
          createdAt: new Date().getTime(),
        })
    }

    render() {
      const avatar = `https://graph.facebook.com/${this.state.profile.id}/picture?height=80`
        return(
            <GiftedChat
                messages={this.state.messages}
                user={{_id: this.state.user.uid, avatar}}
                onSend={this.onSend}
            />
        )
    }
}
