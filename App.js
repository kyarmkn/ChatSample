import React, { Component } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import firebase from 'react-native-firebase';

export default class App extends Component {
  state = {
    messages: [],
  };

  componentDidMount() {
    // Firestoreの「messages」コレクションを参照
    this.ref = firebase.firestore().collection('messages');

    // refの更新時イベントにonCollectionUpdate登録
    this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
  }

  componentWillunmount() {
    // onCollectionUpdateの登録解除
    this.unsubscribe();
  }

  /**
   * Sendボタンがタップされたときのイベント
   */
  onSend = (messages = []) => {
    // Firestoreのコレクションに追加
    messages.forEach((message) => {
      this.ref.add(message);
    });
  }

  /**
   * Firestoreのコレクションが更新されたときのイベント
   */
  onCollectionUpdate = (querySnapshot) => {
    // docsのdataをmessagesとして取得
    const messages = querySnapshot.docs.map((doc) => {
      return doc.data();
    });

    // messagesをstateに渡す
    this.setState({ messages });
  }

  render() {
    return (
      <GiftedChat
        messages={this.state.messages}
        onSend={this.onSend}
        user={{
          _id: 1,
          name: 'John Doe'
        }}
      />
    );
  }
}