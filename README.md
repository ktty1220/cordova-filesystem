# CordovaFileSystem

PhoneGap(Cordova)公式のファイルAPIインターフェイスの使い方がえらい面倒だったので簡単に操作できるラッパーを作りました。

使用には[RSVP.js](https://github.com/tildeio/rsvp.js)が必要です。

## 使用方法

1. `rsvp.js`と`cordovafs.js`をPhoneGapプロジェクトのjsディレクトリに置いてhtmlから読み込みます。

        <script type="text/javascript" src="/path/to/rsvp.jp"></script>
        <script type="text/javascript" src="/path/to/cordovafs.js"></script>

2. JavaScriptでCordovaFileSystemをロードします。

        var fs = new CordovaFileSystem('アプリケーション名');

3. ロードしたCordovaFileSystemオブジェクトを使用して各種ファイル操作を行います。

## API

### コンストラクタ - new CordovaFileSystem(appname)

CordovaFileSystemオブジェクトを作成します。

#### 引数

* appname

    アプリケーション名を指定します。SDカードのrootにファイルを作成するのは行儀が悪いので、CordovaFileSystemではアプリケーション名のディレクトリを作成して、その中のファイルやディレクトリを操作する形になります。

#### 戻り値

* CordovaFileSystemオブジェクト

    このオブジェクトを使用して各種ファイル操作を行います。

#### 例

    // SDカード上のmyAppディレクトリ以下のファイルやディレクトリを操作する
    var fs = new CordovaFileSystem('myApp');

### read(filename, callback)

SDカード上のファイルを読み込みます。

#### 引数

* filename

    ファイルパスを指定します。ファイルが存在しない場合はエラーが返ります。

    普通にファイルパスを指定するとコンストラクタで指定したアプリケーション名のディレクトリ以下を探しに行きますが、ファイルパスの先頭に`/`を付ければSDカードのrootディレクトリからのパスを指定してファイルを参照することができます。

        // myApp/hoge/fuga.txtを読みに行く
        fs.read('hoge/fuga.txt', function(err, data) ...

        // SDカードroot上のotherApp/piyoを読みに行く
        fs.read('/otherApp/piyo', function(err, data) ...

* callback

    ファイルを読み込んだデータを処理したりエラー判定をするコールバック関数を指定します。

    コールバック関数に渡される引数は`(Errorオブジェクト, 読み込んだデータ)`です。

#### 例

    // SDカードの'アプリケーション名'ディレクトリに保存してある'hoge.txt'を読み込む
    fs.read('hoge.txt', function (err, data) {
      if (err) {
        throw err; // ファイルが存在しないなどのエラー
      }
      // dataにhoge.txtの内容が入っている
    });

### write(filename, data, callback)

SDカードにファイルを書き込みます。

#### 引数

* filename

    ファイルパスを指定します。ファイルが存在しない場合は新規に作成します。ファイルが存在する場合は上書きします。存在しないディレクトリの階層上のパスを指定しても自動的にそこまでのディレクトリが作成されます。

    なお、`read()`のようにrootディレクトリからの指定はできません。

* data

    ファイルに書き込む内容を指定します。

* callback

    ファイルを書き込んだ後に実行される関数を指定します。

    コールバック関数に渡される引数は`(Errorオブジェクト)`です。

#### 例

    // myApp/hoge/fuga/piyo.txtに'Lorem ipsum dolor sit ...'というテキストを書き込む
    var data = 'Lorem ipsum dolor sit ...';
    fs.write('hoge/fuga/piyo.txt', data, function (err) {
      if (err) {
        throw err; // 書き込みエラー
      }
    });

### remove(filename, callback)

ファイルを削除します。

#### 引数

* filename

    ファイルパスを指定します。ファイルが存在しない場合はエラーが返ります。

    `read()`のようにrootディレクトリからの指定はできません。

* callback

    ファイルを削除した後に実行される関数を指定します。

    コールバック関数に渡される引数は`(Errorオブジェクト)`です。

#### 例

    // myApp/hoge/fuga/piyo.txtを削除する
    fs.remove('hoge/fuga/piyo.txt', function (err) {
      if (err) {
        throw err; // 削除エラー
      }
    });

### fileExists(filename, callback)

ファイルが存在するか確認します。`true`,`false`のような戻り値ではなく、エラーが発生したかどうかでの判定なので`read()`を使った方がいいかもという。

#### 引数

* filename

    ファイルパスを指定します。ファイルが存在しない場合はエラーが返ります。

    `read()`と同様にrootディレクトリからの指定が可能です。

* callback

    ファイルを削除した後に実行される関数を指定します。

    コールバック関数に渡される引数は`(Errorオブジェクト)`です。

#### 例

    // SDカードのroot上にhoge.txtが存在するか確認する
    fs.fileExists('/hoge.txt', function (err) {
      if (err) {
        throw err; // ファイルが存在しない、もしくはエラー
      }
      // ファイルが存在する
    });

### dirExists(dirname, callback)

ディレクトリが存在するか確認します。`fileExists()`と同様に、`true`,`false`のような戻り値ではなく、エラーが発生したかどうかでの判定します。

#### 引数

* dirname

    ディレクトリ名を指定します。ディレクトリが存在しない場合はエラーが返ります。

    なお、`read()`のようにrootディレクトリからの指定はできません。

* callback

    ファイルを削除した後に実行される関数を指定します。

    コールバック関数に渡される引数は`(Errorオブジェクト)`です。

#### 例

    // myApp/hoge/fugaディレクトリが存在するか確認する
    fs.dirExists('hoge/fuga', function (err) {
      if (err) {
        throw err; // ディレクトリが存在しない、もしくはエラー
      }
      // ディレクトリが存在する
    });

### mkdir(dirname, isfile, callback)

ディレクトリを作成します。

#### 引数

* dirname

    __SDカードrootからの__ ディレクトリパスを指定します。存在しないディレクトリの階層上のパスを指定しても自動的にそこまでのディレクトリが作成されます。

* isfile(default: `false`) 省略可能

    `true`にするとパスの最後をファイル名とみなし、その親ディレクトリまでを作成します。ファイル名混じりのパスを分割してディレクトリ部分のパスを作成するのが面倒という場合に使用します。

* callback

    ディレクトリを作成した後に実行される関数を指定します。

    コールバック関数に渡される引数は`(Errorオブジェクト)`です。

#### 例

    // SDカードroot上に'hoge/fuga'ディレクトリを作成する
    fs.write('hoge/fuga', function (err) {
      if (err) {
        throw err; // ディレクトリ作成エラー
      }
    });

    // SDカードroot上に'hoge/fuga'ディレクトリを作成する(引数にファイル名を指定)
    fs.write('hoge/fuga/piyo.txt', true, function (err) {
      if (err) {
        throw err; // ディレクトリ作成エラー
      }
    });

    // SDカードroot上に'hoge/fuga/piyo.txt'ディレクトリを作成する(isfileを指定していないのでpiyo.txtもディレクトリとみなす)
    fs.write('hoge/fuga/piyo.txt', function (err) {
      if (err) {
        throw err; // ディレクトリ作成エラー
      }
    });

### rmdir(dirname, callback)

ディレクトリを削除します。

#### 引数

* dirname

    ディレクトリパスを指定します。ディレクトリが存在しない場合はエラーが返ります。

    `read()`のようにrootディレクトリからの指定はできません。

* callback

    ディレクトリを削除した後に実行される関数を指定します。

    コールバック関数に渡される引数は`(Errorオブジェクト)`です。

#### 例

    // myApp/hoge/fugaディレクトリを削除する
    fs.rmdir('hoge/fuga', function (err) {
      if (err) {
        throw err; // ディレクトリが存在しないなどのエラー
      }
    });

### list(dirname, callback)

指定したディレクトリ内のファイル/ディレクトリ一覧を取得します。

#### 引数

* dirname

    ディレクトリパスを指定します。ディレクトリが存在しない場合はエラーが返ります。

    `read()`と同様にrootディレクトリからの指定が可能です。

* callback

    ファイル/ディレクトリ一覧に対して処理したりエラー判定をするコールバック関数を指定します。

    コールバック関数に渡される引数は`(Errorオブジェクト, FileEntryオブジェクトの配列)`です。

    FileEntryオブジェクトについては[公式ドキュメント](http://docs.phonegap.com/ja/3.4.0/cordova_file_file.md.html#FileEntry)を参照してください。

#### 例

    // myApp/hogeディレクトリ内のファイル/ディレクトリ一覧を取得する
    fs.list('hoge', function (err, fileEntries) {
      if (err) {
        throw err; // ディレクトリが存在しないなどのエラー
      }

      // ファイル名一覧をconsole.logで出力
      for (var i = 0; i < fileEntries.length; i++) {
        // ディレクトリは除外
        if (! fileEntries[i].isDirectory) {
          console.log(fileEntries[i].name);
        }
      }
    });

## 対応バージョン

PhoneGap3.4.0での動作を確認しています。それ以下のバージョン(特にバージョン3より前)では正常に動作しない可能性があります。

## Changelog

### 0.1.1 (2014-05-24)

* `list()`メソッド追加

### 0.1.0 (2014-04-23)

* 初版リリース

## ライセンス

[MIT license](http://www.opensource.org/licenses/mit-license)で配布します。

&copy; 2014 [ktty1220](mailto:ktty1220@gmail.com)
