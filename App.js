import React from 'react';
import { Platform, Actions, Text, View, TouchableOpacity, Image } from 'react-native';
import CustomActions from './CustomActions';
import { GiftedChat } from 'react-native-gifted-chat';
import firebase from 'react-native-firebase';

export default class DetailsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.renderCustomActions = this.renderCustomActions.bind(this);
  }
  state = { messages: [], currentMessageId: "" };

  // ログイン済だったらユーザー、未ログインだとnullが返される
  observeAuth = () =>
    firebase.auth().onAuthStateChanged(this.onAuthStateChanged);
  // TODO: firebaseが認証を見つけたらすぐに呼び出されるって書いてあったけど意味がよく分からなかったので調べる
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
          loadingImage = "https://firebasestorage.googleapis.com/v0/b/chatappsample-76769.appspot.com/o/loading.png?alt=media&token=45d52053-8b74-41cd-94a3-cfddabc18778"
          tmpMessage = Object.assign({}, message);
          tmpMessage.image = loadingImage
          return firebase.firestore().collection("messages").add(tmpMessage)
            .then(messageRef => {
              console.log("ファイルパス？: ", message.image)
              filePath = 'chat/' + message._id + '.jpg'
              return firebase.storage().ref(filePath).putFile(message.image)
                .then(uploadedImage => {
                  console.log("ダウンロードURL: ", uploadedImage.downloadURL)
                  return messageRef.update({
                    image: uploadedImage.downloadURL
                  });
                })
            });
        } else {
          return firebase.firestore().collection("messages").add(message);
        }
      } catch (error) {
        console.error('Error writing new message to Firebase Database', error);
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
    if (Platform.OS === 'ios') {
      return (
        <CustomActions
          {...props}
        />
      );
    }
    const options = {
      'Action 1': (props) => {
        alert('option 1');
      },
      'Action 2': (props) => {
        alert('option 2');
      },
      'Cancel': () => { },
    };
    return (
      <Actions
        {...props}
        options={options}
      />
    );
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
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
      </View>
    );
  }

  componentWillUnmount() {
    this.unsubscribe();
  }
}

const styles = {
  container: {
    flex: 1
  },
  button: {
    width: 25,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
    tintColor: 'tomato'
  },
  buttonContainer: {
    padding: 10
  },
  customActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  loader: {
    paddingTop: 20
  },
  sendLoader: {
    marginRight: 10,
    marginBottom: 10
  }
};