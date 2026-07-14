import Vue from 'vue'
import fs from 'fs'
import { promises as fs_ } from 'fs'
import path from 'path'
import crypto from 'crypto'
import store from './../store'
import { getPs4PkgInfo } from "@njzy/ps4-pkg-info"

const getFiles = (folder, deep = false) => {
    const files = [];

    try {
        const fileObjects = fs.readdirSync(folder, { withFileTypes: true });

        for (const fileObject of fileObjects) {
            const file = fileObject.name;

            const forbidden = ['$RECYCLE.BIN', 'desktop.ini', '.Spotlight', '.Spotlight-V100', '.Trashes', '.Trash', 'Thumbs.db', '.DS_Store'].includes(file);

            if (forbidden) {
                continue;
            }

            const fullPath = path.join(folder, file);

            if (fileObject.isDirectory() && deep) {
                const nestedFiles = getFiles(fullPath, deep);
                files.push(...nestedFiles);
            } else {
                files.push(fullPath);
            }
        }
    } catch (e) {
        console.log("Error reading folder", folder);
        console.log(e);
    }

    console.log("Found " + files.length + " Files");

    return files;
};

let o = {
    createSafeRouteName(filePath='', fileName='', isFile=true){
        const ext = isFile ? path.extname(fileName) || '.pkg' : ''
        const baseName = (isFile ? path.basename(fileName, ext) : fileName).replace(/[^a-zA-Z0-9-_.]/g, '')
        const safeBaseName = baseName || (isFile ? 'pkg' : 'dir')
        const hash = crypto.createHash('sha1').update(filePath).digest('hex').slice(0, 8)

        return `${safeBaseName}-${hash}${ext}`
    },

    async getFilesFromBasePath(folder='', scan_subdir=false){
        if(!folder){
            console.log("::fs | No base_path given for the server.")
            return
        }

        console.log("Loading Files from Subdirectory", scan_subdir)
        console.log("Loading Directory files in ", folder)

        let files = (await getFiles(folder, scan_subdir))
            .filter( file => this.isPKG(file) )
            .map( item => this.createItem(item, folder) )

        files = await Promise.all(files)

        console.log("Found files " + files.length)

        return files
    },

    getFiles,

    getFileName(p=null){
        if( !p ) return 'n/a'

        return path.basename(p)
    },

    getFileSize(p=null, d=2, returnBytes=false){
        if( !p ) return 'n/a'

        let stats = fs.statSync(p)
        if( stats && stats.size )
            return returnBytes ? stats.size : this.formatBytes(stats.size, d)

        return 'n/a'
    },

    walk(folder){
        console.log("Walking Directory", folder)
        const files = fs.readdirSync(folder);
        files
              // .filter( item => item.includes('.pkg') )
              // .filter( item => this.isFile(item) )
              .forEach((file) => {
                  let filePath = path.join(folder, file);
                  let fullPath = path.resolve(folder, file)
                  let isDir    = fs_.lstatSync(filepath).isDirectory()

                  console.log(fullPath, filePath)

                  if(isDir){
                    console.log("Found directory", fullPath)
                    this.walk(fullPath);
                  }
                  else {
                    if(this.isPKG(file))
                      this.createItem(file, fullPath);
                  }
              });

        return files
    },

    isFile(item) {
        return !!path.extname(item)
    },

    isPKG(item){
        return path.extname(item).includes('pkg')
    },

    async createItem(item, folder=''){
        // console.log("Create Item", item)
        const shouldPrefix  = store.getters['app/getPrefixFullPath']
        const readSFOHeader = store.getters['app/getReadSFOHeader']

        // console.log(":: fs | Create File Item", item)
        let isFile = this.isFile(item)

        if(!isFile) return false

        let fileName = path.basename(item)
        let fullPath = path.resolve(folder, item)
        let patchedFilename;

        if(shouldPrefix){
            const parts = path.relative(folder, fullPath).split(path.sep)
            patchedFilename = parts
                .map((part, index) => this.createSafeRouteName(path.join(folder, ...parts.slice(0, index + 1)), part, index == parts.length - 1))
                .join('/')
        }
        else {
            patchedFilename = this.createSafeRouteName(fullPath, fileName)
        }

        let stats = fs.lstatSync(fullPath)
        let size  = this.formatBytes(stats.size, 2)
        let regex = /(CUSA\d{5})/i

        // let cusa  = regex.test(fileName) ? fileName.match(regex)[0] : 'not found' // overhead?
        let searchCUSA = fileName.match(/(CUSA\d{5})/i)
        let cusa = searchCUSA ? searchCUSA[0].toUpperCase() : ''

        // #todo get pkg deep info with https://github.com/dexter85/ps4-pkg-info        
        let sfo = { readSFOHeader }

        if( readSFOHeader ){
            sfo = await this.getItemSFO(item)
            cusa  = sfo.TITLE_ID            
        }

        // title location 0x40 to 0x63
        // cusa location 0x47 to 0x4F

        let finalItem = {
            name: fileName,
            status: 'n/a',
            percentage: 0,
            rest: 0,
            task: '',
            ext: path.extname(item),
            path: fullPath,
            url: null,
            type: 'local',
            cusa,
            isFile,
            patchedFilename,
            sizeInBytes: stats.size,
            size,
            logs: [],
            sfo,
            image: null
            // stats,
        }

        // console.log(finalItem)
        return finalItem
    },

    createItemFromHBLegacy(item, root=''){
        let fullPath = root + 'dl.php?tid=' + item.id
        let patchedFilename = item.name.replace(/[^a-zA-Z0-9-_.]/g, '')
        let fileName = item.name + ' (version '+item.version+')'
        let size = item.Size ? item.Size.replace('s', '') : 'n/a'

        return {
            name: item.name,
            status: 'remote',
            percentage: 0,
            rest: 0,
            task: '',
            ext: 'remote', // path.extname(item),
            path: fullPath,
            url: fullPath,
            type: 'remote',
            cusa: item.id,
            isFile: true,
            patchedFilename,
            sizeInBytes: size, // stats.size,
            size: size,
            logs: [],
            // stats,
            data: item
        }
    },

    createItemFromHBRefactored(item, root=''){
        let patchedFilename = item.name.replace(/[^a-zA-Z0-9-_.]/g, '')
        let size = item.size ? this.formatBytes(item.size) : 'n/a'
        // patch file url to stream
        // let filePath = item.file.replace('attachments/', 'attachments/stream/')
        let filePath = item.file ? item.file.replace('https', 'http') : item.file

        // file url if we have missing ps4 default pacakage but file_ps5 given instead
        // so fallback to file_ps5 if file is empty
        if( !item.file && item.file_ps5){
            filePath = item.file_ps5 ? item.file_ps5.replace('https', 'http') : item.file_ps5
        }

        // if we have ps5 selected enforce ps5 file
        if( store.getters['app/isPS5'] && item.file_ps5 ){
            filePath = item.file_ps5 ? item.file_ps5.replace('https', 'http') : item.file_ps5
        }

        return {
            name: item.name,
            status: 'remote',
            percentage: 0,
            rest: 0,
            task: '',
            ext: 'pkg', // path.extname(item),
            path: filePath,
            url: filePath,
            type: item.type,
            cusa: item.cusa,
            isFile: true,
            patchedFilename,
            sizeInBytes: size, // stats.size,
            size: size,
            logs: [],
            // stats,
            data: item
        }
    },

    createItemFromURL(item){
        let patchedFilename = item.name.replace(/[^a-zA-Z0-9-_.]/g, '')
        let fullPath = item.url
        let size = 'n/a'

        return {
            name: item.name,
            status: 'url',
            percentage: 0,
            rest: 0,
            task: '',
            ext: 'remote', // path.extname(item),
            path: fullPath,
            url: fullPath,
            type: 'remote',
            cusa: item.cusa,
            isFile: true,
            patchedFilename,
            sizeInBytes: size, // stats.size,
            size: size,
            logs: [],
            // stats,
        }
    },

    async createItemFromDraggedFile(draggedFilePath){
        const readSFOHeader = store.getters['app/getReadSFOHeader']        
        
        let name            = path.basename(draggedFilePath)
        let patchedFilename = this.createSafeRouteName(draggedFilePath, name)
        let size            = this.getFileSize(draggedFilePath, 2, true)
        let searchCUSA      = name.match(/(CUSA\d{5})/i)
        let cusa            = searchCUSA ? searchCUSA[0].toUpperCase() : ''      
        
        let sfo = { readSFOHeader }

        if( readSFOHeader ){
            sfo = await this.getItemSFO(draggedFilePath)
            cusa  = sfo.TITLE_ID
        }        
        
        return {
            name,
            status: 'Dragged',
            percentage: 0,
            rest: 0,
            task: '',
            ext: path.extname(draggedFilePath),
            path: draggedFilePath,
            url: null,
            type: 'dragged',
            cusa,
            isFile: true,
            patchedFilename,
            sizeInBytes: size,
            size: this.formatBytes(size, 2),
            logs: [],
            sfo,
            image: null,
            // stats,
        }
    },

    async getItemSFO(item, keys=[]){
        let sfoKeys = ['APP_TYPE', 'APP_VER', 'ATTRIBUTE', 'ATTRIBUTE2', 'CATEGORY', 'CONTENT_ID', 'PUBTOOLINFO', 'PUBTOOLMINVER', 'PUBTOOLVER', 'SYSTEM_VER', 'TITLE', 'TITLE_ID', 'VERSION']
        let sfo = { readSFOHeader: true }

        try {
            let s = await getPs4PkgInfo(item, { generateBase64Icon: false })
                .catch( e => {
                    console.error("Error in PKG Extraction: "+ e)
                })            

            if( s ){
                // console.log("Found sfo header for " + fileName)
                // image = s.icon0Raw                
                sfoKeys.forEach( x => sfo[x] = s.paramSfo[x] )                 
            }
            else {
                console.log("Hops, no s object for sfo information")
            }
        }
        catch (e){
            console.error(e)
            return sfo
        }
        
        return sfo
    },

    formatBytes(bytes=null, decimals=2, k=1000) {
        if (!bytes) return 'n/a';
        if (bytes === 0) return '0 Bytes';

        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },

}

Vue.prototype.$fs = o

export default o
