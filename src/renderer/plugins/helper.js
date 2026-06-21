import Vue from 'vue'
import JSON5 from 'json5'

let helper = {
    getNetWorkInterfaces() {
        let os = require('os');
        let ifaces = [];
        Object.keys(os.networkInterfaces()).forEach(function (ifname) {
          var alias = 0;
          os.networkInterfaces()[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
              return;
            }

            if (alias >= 1) {
              ifaces.push({
                title: `${ifname}-${alias}:${iface.address}`,
                ip: iface.address
              });
            } else {
              ifaces.push({
                title: `${ifname}: ${iface.address}`,
                ip: iface.address
              });
            }
            ++alias;
          });
        });
        return ifaces;
    },

    getServerStatusType(i=''){
        if(i == 'error')
          return 'danger'

        if(i == 'running')
          return 'success'

        return ''
    },

    getAppStoreType(type=''){
        if(type == 'game' || type == 'hb game')
          return 'success'

        if(type == 'media')
          return 'primary'

        if(type == 'utility')
          return 'warning'

        if(type == 'emulator')
          return 'danger'

        return ''
    },

    // Map SFO CATEGORY code to human-readable label and tag color
    getSfoCategoryLabel(category=''){
        const map = {
            'gd':  { label: 'Game', color: 'success' },
            'gp':  { label: 'Patch', color: 'primary' },
            'ac':  { label: 'DLC', color: 'warning' },
            'gda': { label: 'Extra Data', color: 'info' },
            'la':  { label: 'App', color: 'danger' },
        }

        if(map[category])
            return map[category]

        return { label: category || '?', color: '' }
    },

    matchesFileSearch(file={}, query=''){
        const terms = String(query).trim().toLowerCase().split(/\s+/).filter(Boolean)
        if(!terms.length)
          return true

        const sfo = file.sfo || {}
        const data = file.data || {}
        const category = String(sfo.CATEGORY || data.CATEGORY || data.category || '').toLowerCase()
        const categoryAliases = {
            gd: ['game', 'base game'],
            gp: ['patch', 'update'],
            ac: ['dlc', 'add-on', 'addon'],
            gda: ['extra data'],
            la: ['app', 'application'],
        }
        const categoryLabel = this.getSfoCategoryLabel(category).label
        const fields = [
            file.name,
            file.patchedFilename,
            file.title,
            sfo.TITLE,
            data.TITLE,
            data.title,
            file.cusa,
            sfo.TITLE_ID,
            sfo.CONTENT_ID,
            data.TITLE_ID,
            data.title_id,
            data.CONTENT_ID,
            data.content_id,
            category,
            categoryLabel,
            ...(categoryAliases[category] || []),
            file.status,
            file.type,
        ]
        const searchableText = fields
            .filter(value => value !== undefined && value !== null)
            .map(value => String(value).toLowerCase())
            .join('\n')

        return terms.every(term => searchableText.includes(term))
    },

    getFileStatus(type=''){
        if(type == 'error')
          return 'danger'

        if(type.startsWith('installed'))
          return 'success'

        if(type == 'serving' || type == 'pause')
          return 'info'

        if(type == 'finish' || type == 'installed')
          return 'success'

        if(type == 'installing')
          return 'primary'

        if(type == 'in queue')
          return 'warning'

        return ''
    },

    getFileSizeType(size=''){
        if(size.includes('Bytes'))
          return 'info'

        if(size.includes('MB'))
          return 'success'

        if(size.includes('GB'))
          return 'primary'

        return ''
    },

    stringifyToHex(obj){
        return JSON.stringify(obj, (key, value) => {
            if( typeof value === 'number'){
              return '0x' + value.toString(16)
            }
            return value
        })
    },

    parse(o){
        return JSON5.parse(o)
    },

    secondsToString(seconds){
        if(!seconds) return ''

        seconds = Number(seconds);
        var d = Math.floor(seconds / (3600*24));
        var h = Math.floor(seconds % (3600*24) / 3600);
        var m = Math.floor(seconds % 3600 / 60);
        var s = Math.floor(seconds % 60);

        // var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
        // var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
        // var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
        // var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
        var dDisplay = d > 0 ? d + "d " : "";
        var hDisplay = h > 0 ? h + "h " : "";
        var mDisplay = m > 0 ? m + "m " : "";
        var sDisplay = s > 0 ? s + "s " : "";

        return dDisplay + hDisplay + mDisplay + sDisplay;
    },

    formatBytes(bytes, decimals=2, k=1000) {
        if (bytes === 0) return '0 Bytes';

        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },

    formatSpeed(sizeInBytes, percentage, restSeconds){
        if(!sizeInBytes || !restSeconds || percentage <= 0 || percentage >= 100)
            return ''

        const remainingBytes = sizeInBytes * (100 - percentage) / 100
        const bytesPerSecond = remainingBytes / restSeconds

        if(bytesPerSecond < 1024)
            return Math.round(bytesPerSecond) + ' B/s'

        if(bytesPerSecond < 1024 * 1024)
            return (bytesPerSecond / 1024).toFixed(1) + ' KB/s'

        return (bytesPerSecond / (1024 * 1024)).toFixed(1) + ' MB/s'
    },    

    is(val, a=true, b=false, fb=false){
        if( val )
          return a

        if (!val)
          return b 

        return fb
    },

    prettyPrint(input={}){
        var jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/mg;
        var replacer = function(match, pIndent, pKey, pVal, pEnd) {
            var key = '<span class="json-key" style="color: brown">',
                val = '<span class="json-value" style="color: gray">',
                str = '<span class="json-string" style="color: olive">',
                r = pIndent || '';
            if (pKey)
                r = r + key + pKey.replace(/[: ]/g, '') + '</span>: ';
            if (pVal)
                r = r + (pVal[0] == '"' ? str : val) + pVal + '</span>';
            return r + (pEnd || '');
        };

        return JSON.stringify(input, null, 3)
                  .replace(/&/g, '&amp;').replace(/\\"/g, '&quot;')
                  .replace(/</g, '&lt;').replace(/>/g, '&gt;')
                  .replace(jsonLine, replacer);        
      },  

}

Vue.prototype.$helper = helper
