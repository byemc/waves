const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld("metadata", {
  updateMetadata: ( title="", artist="", album="", artUrl="https://radio.byemc.xyz/assets/icon-300.png", startTime=Date.now(), duration=0, playingStatus="Stopped", id = Math.floor(Math.random() * 1000) ) => ipcRenderer.send('update-metadata', {
    title, artist, album, artUrl, startTime, duration, playingStatus, id
  })
})
