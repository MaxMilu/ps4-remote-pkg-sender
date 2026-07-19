import { BrowserWindow, Menu, ipcMain, app, nativeImage } from 'electron'
import path from 'path'
import { format as formatUrl } from 'url'
import remoteMain from '@electron/remote/main'

remoteMain.initialize()

const isDevelopment = process.env.NODE_ENV !== 'production'

export default {
    installDevtools(window){
        // try {
        //   require('vue-devtools').install()
        // } catch(e) {
        //   console.error("vue-devtools install failed", e);
        // }
        window.webContents.openDevTools()
    },

    setDevtools(window){
        if (isDevelopment) {
          this.installDevtools(window)
        }
    },

    setWindowLoadURL(window, to='/'){
        window.webContents.setUserAgent("StoreHAX")

        if (isDevelopment && process.env['ELECTRON_RENDERER_URL']) {
          // ensure 'to' paths that start with '/' are handled cleanly since the URL already resolves cleanly
          // electron-vite router usually does not need '/#'
          const loadPath = to.startsWith('/') ? to : '/' + to;
          window.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/#' + loadPath)
        }
        else {
          window.loadURL('file://' + path.join(__dirname, '../renderer/index.html') + '#' + to)
        }
    },

    setErrorHandler(window){
        window.onerror = (error, url, line) => {
            console.log(error, url, line)
            alert("Window Error" + error)
            // ipcMain.on('error', (event, data) => window.webContents.send('error', data) )
        }

        window.webContents.on('did-fail-load', (event, errorCode, errorDescription, validateURL, isMainFrame, frameProcessId, frameRoutingId) => {
            console.log(event, errorCode, errorDescription, validateURL, isMainFrame, frameProcessId, frameRoutingId)
            alert("loading failed" + errorDescription)
            // ipcMain.on('error', (event, data) => window.webContents.send('error', data) )
        })
    },

    createBaseWindow(args={}){
        let params = {
            minHeight: 900,
            minWidth: 600,
            height: 600,
            width: 900,
            // frame: false,
            title: 'PS4 Remote Package Sender v2',
            // .icns is macOS-only and can't be decoded by nativeImage on Linux/Windows;
            // createFromPath (not createFromDataURL, which expects a data: URL string,
            // not a file path) with the cross-platform .png works everywhere.
            icon: nativeImage.createFromPath(this.getIconPath()),
            // titleBarStyle: 'hiddenInset',
            webPreferences: {
                allowRunningInsecureContent: true,
                nodeIntegration: true,
                contextIsolation: false,
                devTools: true
            }
        }

        if(args.width)
          params.minWidth = args.width

        if(args.height)
          params.minHeight = args.height

        return new BrowserWindow({...params, ...args})
    },

    createWindowInstance(to='/', args={}, debug=false){
        const window = this.createBaseWindow(args)

        remoteMain.enable(window.webContents)

        window.webContents.on('console-message', (event, level, message, line, sourceId) => {
            console.log(`[Renderer Console] ${message} (at ${sourceId}:${line})`);
        });

        if (isDevelopment && debug) {
          window.webContents.openDevTools({ mode: 'detach' });
        }

        this.setWindowLoadURL(window, to)

        this.setErrorHandler(window)

        return window
    },

    autocloseAfterDownload(window){
        // window.webContents.on('new-window', (createEvent, contents) => {
        //     console.log("Web content created")
        //     console.log(createEvent.sender)
        //     console.log(contents)
        //
        //     let newWindow = BrowserWindow.fromWebContents(createEvent.sender)
        //     console.log(newWindow)
        //     newWindow.setContentSize(10,10)
        // })

        window.webContents.on('new-window', (event, url) => {
            console.log("Open New Window with autoclose after download")
            event.preventDefault()

            var win = new BrowserWindow({ 
                show: true, 
                frame: false,
                icon: nativeImage.createFromPath(this.getIconPath()),
                webPreferences: {
                    allowRunningInsecureContent: false,
                    nodeIntegration: true,
                    contextIsolation: false,
                    webviewTag: true,
                }
            })

            remoteMain.enable(win.webContents)

            win.webContents.setUserAgent("StoreHAX")
            win.once('ready-to-show', () => win.show())
            win.loadURL(url)
            // win.webContents.downloadURL(url)
            // win.openDevTools()

            console.log("Set New Window url to ", url)

            win.webContents.session.on('will-download', (event, item, webContents) => {
                // console.log("Download started for ", item)
                item.once('done', (event, state) => {
                    console.log("Item download state ", state)
                    win.destroy()
                })
            })
        })


        window.webContents.on('did-attach-webview', (event, webContents) => {
            console.log("attached new webview")
        })

        // deprecated
        // window.webContents.session.on('will-download', (event, item, webContents) => {
        //    item.once('done', (event, state) => {
        //       BrowserWindow.fromWebContents(webContents).close();
        //    });
        // });
    },

    getIconPath(){
        return path.join(isDevelopment ? process.cwd() : process.resourcesPath, 'static', 'assets/ps_icon_white.png')
    },

    getAppIconPath(){
        return path.join(isDevelopment ? process.cwd() : process.resourcesPath, 'static', 'assets/ps_icon_white.icns')
    },


}
