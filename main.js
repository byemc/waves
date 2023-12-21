const { app, BrowserWindow, ipcMain, Notification } = require("electron");
const path = require('path');
const Player = require('mpris-service');

const player = Player({
  name: "pirateradio",
  identity: "Radio Player",
  supportedInterfaces: ['player']
});

player.canSeek = false;
player.canGoNext = false;
player.canGoPrevious = false;

function updatePlayer (event, args) {
  console.log(args)
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

  player.playbackStatus = args.playingStatus;
}


function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,

    titleBarStyle: false,

    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })


  win.loadFile('index.html')
}

app.whenReady().then(() => {
  ipcMain.on('update-metadata', updatePlayer);
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

player.on('quit', function () {
  app.exit();
});
