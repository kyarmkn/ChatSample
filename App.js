import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import CustomActions from './CustomActions';
import { GiftedChat } from 'react-native-gifted-chat';
import firebase from 'react-native-firebase';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.renderCustomActions = this.renderCustomActions.bind(this);
  }
  state = { messages: [] };

  // ログイン済だったらユーザー、未ログインだとnullが返される
  observeAuth = () =>
    firebase.auth().onAuthStateChanged(this.onAuthStateChanged);
  onAuthStateChanged = user => {
    if (!user) {
      try {
        firebase.auth().signInAnonymously();
      } catch ({ message }) {
        alert(message);
      }
    }
  };

  componentDidMount() {
    this.observeAuth()
    this.query = firebase.firestore()
      .collection("messages")
      // 時系列に沿って表示（これがないと順番がバラバラになる）
      .orderBy('createdAt', 'desc');
    // 最新12個のメッセージのみを監視する制限
    // .limit(12);

    // queryの更新時イベントにonCollectionUpdate登録
    this.unsubscribe = this.query.onSnapshot(this.onCollectionUpdate);
  }

  setCurrentMessageId = (id = "") => {
    this.setState({ currentMessageId: id });
  }

  onSend(messages = []) {
    messages.forEach(message => {
      try {
        if (message.image != null) {
          // 画像データ送信
          // 先にローディング画像を仮置きして、Firestoreに追加
          loadingImage = "https://firebasestorage.googleapis.com/v0/b/chatappsample-76769.appspot.com/o/loading.png?alt=media&token=45d52053-8b74-41cd-94a3-cfddabc18778"
          tmpMessage = Object.assign({}, message);
          tmpMessage.image = loadingImage
          return firebase.firestore().collection("messages").add(tmpMessage)
            .then(messageRef => {
              // Cloud Storageに画像を保存
              filePath = 'chat/' + message._id + '.jpg'
              return firebase.storage().ref(filePath).putFile(message.image)
                .then(uploadedImage => {
                  console.log("ダウンロードURL: ", uploadedImage.downloadURL)
                  // Cloud Storageに保存した画像のURLを、仮置き画像のURLと置き換える
                  return messageRef.update({
                    image: uploadedImage.downloadURL
                  });
                })
            });
        } else {
          console.log("メッセージ", message)
          return firebase.firestore().collection('messages').add(message);
        }
      } catch (error) {
        console.error('Firestoreに登録失敗.', error);
      }
    })
  }

  onCollectionUpdate = (querySnapshot) => {
    const messages = querySnapshot.docs.map((doc) => {
      return doc.data();
    });
    this.setState({ messages: messages });
  }

  renderCustomActions(props) {
    return (
      <CustomActions
        {...props}
      />
    );
  }

  render() {
    return (
      <SafeAreaView style={styles.safeArea}>
        <GiftedChat
          messages={this.state.messages}
          onSend={this.onSend}
          user={{
            _id: "user00001",
            name: "user00001"
          }}

          renderAvatarOnTop={true}
          renderActions={this.renderCustomActions}
        />
      </SafeAreaView>
    );
  }

  componentWillUnmount() {
    this.unsubscribe();
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  }
});