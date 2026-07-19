import { app, session, BrowserWindow, Notification, ipcMain, globalShortcut, protocol, Menu } from 'electron'
import path from 'path'
import { format as formatUrl } from 'url'

import helper from './helper'
import menu from './menu'
import tray from './tray'
import store from './../renderer/store/index.js'

// prepatch 
console.log("Plattform Check " + process.platform)
// Force Wayland GPU patches to prevent white screens
if (process.platform === "linux") {
  console.log("Apply --no-sandbox to commandline to fix Linux (debian) graphical issues")
  
  app.commandLine.appendSwitch("no-sandbox");
  app.commandLine.appendSwitch("disable-gpu");
  app.commandLine.appendSwitch("disable-software-rasterizer");
  app.disableHardwareAcceleration();
}

// set vars
const isDevelopment = process.env.NODE_ENV !== 'production'

const showServerWindowOnStartUp = false
const showServerDevtools = false
const showPS4DevTools = false
const showMainDevTools = isDevelopment

let windows = {
  info: null,
  main: null,
  server: null,
  ps4: null,
}

function createMainWindow() {
  Menu.setApplicationMenu(null)
  
  const window = helper.createWindowInstance('/', {
    width: 1300, height: 800, frame: false,
  }, showMainDevTools)

  window.on('close', (event) => {
    event.preventDefault()
    window.hide()
  })
  window.on('closed', () => { windows.main = null })

  helper.autocloseAfterDownload(window)

  windows.main = window
  
  // ensure main DevTools run properly in dev mode
  window.once('ready-to-show', () => {
    window.show()
  })
}

function createServerWindow(){
  const window = helper.createWindowInstance('/app/Server', {
    width: 800, height: 500, title: 'Server', show: showServerWindowOnStartUp,
  }, showServerDevtools)
  window.on('close', (event) => {
    event.preventDefault()
    window.hide()
  })
  window.on('closed', (event) => { windows.server = null })
  windows.server = window
}

function createInfoWindow(){
  const window = helper.createWindowInstance('/info', {
    width: 500, height: 600, title: 'Info', show: false,
  }, false)
  window.on('close', (event) => {
    event.preventDefault()
    window.hide()
  })
  window.on('closed', (event) => { windows.info = null })
  windows.info = window
}

function createPS4Window(){
  const window = helper.createWindowInstance('/ps4', {
    width: 800, height: 800, title: 'PS4', show: false,
  }, showPS4DevTools)
  window.on('close', (event) => {
    event.preventDefault()
    window.hide()
  })
  window.on('closed', (event) => { windows.ps4 = null })
  windows.ps4 = window
}

function hearthbeat(){
  setInterval( () => {
    store.dispatch('app/addTime')
  }, 1000)
}

function registerChannel(){
    ipcMain.on('server', (event, data) => windows.server.webContents.send('server', data) )
    ipcMain.on('server-show', () => windows.server.show() )
    ipcMain.on('show', (event, data) => showWindow(data) )

    ipcMain.on('main', (event, data) => windows.main.webContents.send('main', data) )
    ipcMain.on('main-error', (event, data) => windows.main.webContents.send('main-error', data) )
    ipcMain.on('main-route', (event, data) => windows.main.webContents.send('main-route', data) )

    ipcMain.on('ps4', (event, data) => windows.ps4.webContents.send('ps4', data) )

    ipcMain.on('error', (event, data) => windows.main.webContents.send('error', data) )
    ipcMain.on('notify', (event, data) => notify(data) )
    ipcMain.on('quit', () => app.quit() )
}

function addShortcuts(){
    globalShortcut.register('CommandOrControl+C', () => {
      contents.copy()
    })

    globalShortcut.register('CommandOrControl+V', () => {
      contents.paste()
    })
}

function createProtocols(){
    return;
}

function notify(data){
    new Notification(data).show()
}

function showWindow(data){
    if(data == 'ps4')
      windows.ps4.show()

    if(data == 'server')
      windows.server.show()

    if(data == 'info')
      windows.info.show()
}

app.on('window-all-closed', () => {
  console.log("All windows are closed. Kill all processes.")
  app.quit()
})

app.on('before-quit', (event) => {
  console.log("Closing applications")

  console.log("Closing Server")
  if (windows.server && windows.server.webContents) {
      windows.server.webContents.send('server', 'stop')
  }

  setTimeout(() => {
    Object.values(windows).map( (win) => {
      if(!win){
          return console.log("No win object")
      }
      win.removeAllListeners('close')
      win.close()
    })
  }, 500)

  console.log("Application closed.")
})

app.on('activate', () => {
  windows.main.show()
})

app.on('ready', () => {
  createMainWindow()
  createServerWindow()
  createInfoWindow()
  createPS4Window()
  createProtocols()

  menu.createMenu()
  tray.createTray()

  new Notification({ title: 'PS4 Remote PKG Sender', body: 'Welcome to PS4 Remote PKG Installer.' }).show()
  registerChannel()
})

export default windows
