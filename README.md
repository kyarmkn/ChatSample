# ChatSample

アプリを実行するにはFirebaseの設定ファイルが必要です。

- Android：google-service.json
- iOS：GoogleService-Info.plist

### 設定ファイルの追加手順

1. Firebaseプロジェクト`ChatAppSample`を開く
2. 左上の設定マーク（歯車マーク）から、「プロジェクトの設定」を選択
3. 設定ページの全般タブの、「アプリ」の中から該当アプリを探す
   1. Android：com.chatsample
   2. iOS： org.reactjs.native.example.ChatSample
4. 該当アプリを選択し、右上に出るgoogle-service.jsonまたはGoogleService-Info.plistをダウンロード
5. ダウンロードしたファイルをAndroidとXcodeのプロジェクトの以下の場所に追加
   1. Android：ChatSample/android/app/ 内
   2. Xcode：ChatSample/iOS/ChatSample/ 内
      1. Xcodeプロジェクトを開き、ドラッグ＆ドロップで追加する
