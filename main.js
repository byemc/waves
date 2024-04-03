// import {app, BrowserWindow, ipcMain} from "electron";
const {app, BrowserWindow, ipcMain, Notification} = require("electron");
const path = require("path");
const Player =  require("@jellybrick/mpris-service");

let currentSong = {
  "title":  "",
  "artist": ""
}

let win;
let player;

if (process.platform === "linux"){
  player = new Player(
    {
      name: "waves",
      identity: "waves",
      supportedUriSchemes: [],
      supportedMimeTypes: [],
      supportedInterfaces: ['player']
    }
  );

  player.canSeek = false;
  player.canGoNext = false;
  player.canGoPrevious = false;
}

function updatePlayer (event, args) {
  console.log(args)
  if (process.platform === "linux") {
    player.metadata = {
      'mpris:trackid': player.objectPath('track/') + args.id,
      'mpris:length': args.duration * 1000 * 1000,
      'mpris:artUrl': args.artUrl,
      'xesam:title': args.title,
      'xesam:album': args.album,
      'xesam:artist': [args.artist]
    };

    player.getPosition = function () {
      return (Date.now() - args.startTime) * 1000
    }

    win.setProgressBar((Date.now() - args.startTime) / args.duration)
    console.log((Date.now() - args.startTime) / args.duration)

    player.playbackStatus = args.playingStatus;
  }

  console.error(args.title !== currentSong.title || args.artist !== currentSong.artist)
  if (args.title !== currentSong.title || args.artist !== currentSong.artist) {
    currentSong = {title: args.title, artist: args.artist}
    new Notification(
      {
        title: args.title,
        body:  args.artist
      }
    ).show()
  }

}


function createWindow () {
  win = new BrowserWindow({
    width: 800,
    height: 600,

    titleBarStyle: false,

    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // win.setProgressBar(0.69)

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  ipcMain.on('update-metadata', updatePlayer);
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

if (process.platform === "linux") {
  player.on('quit', function () {
    app.exit();
  });
}
