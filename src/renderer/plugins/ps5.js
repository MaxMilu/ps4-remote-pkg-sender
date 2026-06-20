/*
  etaHEN and singleDPI TCP API

  Legacy etaHEN request:
    {"url":"http://host/file.pkg"}

  singleDPI requests:
    {"action":"ping"}
    {"action":"install","url":"http://host/file.pkg"}
    {"action":"status","content_id":"..."}
*/

import Vue from 'vue'
import store from '../store'

const net = require('net')

let ps5 = {
    debug(){
        let ps4ip = store.getters['app/getPS4IP']
        console.log('Check PS IP ' + ps4ip)
    },

    getURL(of='ps'){
        if(of == 'url')
            return store.getters['app/getPS4IP']

        if(of == 'ps'){
            let url = store.getters['app/getPS4IP']
            let parts = url.split(':')
            return { host: parts[0], port: parts[1] }
        }

        if(of == 'server')
            return store.getters['app/getServerIP']

        return ''
    },

    getTimeout(min=2000){
        let timeout = store.getters['app/getPS4Timeout']
        return timeout < min ? min : timeout
    },

    send(requestObject={}){
        return new Promise((resolve, reject) => {
            const client = new net.Socket()
            let response = ''
            let settled = false

            const timeoutId = setTimeout(() => {
                client.destroy()
                fail(new Error('PS5 Connection timed out at ' + this.getURL('url')))
            }, this.getTimeout())

            const succeed = (value) => {
                if(settled) return
                settled = true
                clearTimeout(timeoutId)
                resolve(value)
            }

            const fail = (error) => {
                if(settled) return
                settled = true
                clearTimeout(timeoutId)
                reject(error)
            }

            client.connect(this.getURL('ps'), () => {
                console.log('Connected to PS5')

                // Legacy etaHEN connectivity check only opens the TCP port.
                if(!requestObject){
                    client.destroy()
                    succeed(true)
                    return
                }

                client.write(JSON.stringify(requestObject))
            })

            // TCP may split one JSON response across multiple data events.
            // Both etaHEN and singleDPI close the connection after responding.
            client.on('data', data => {
                response += data.toString()
            })

            client.on('end', () => {
                console.log('Received data from server:', response)
                try {
                    succeed(JSON.parse(response))
                }
                catch(error){
                    fail(error)
                }
            })

            client.on('error', error => {
                console.error('Socket error:', error)

                if(error.code == 'ECONNREFUSED')
                    return fail(`PS5 Connection failed at ${this.getURL('url')}`)

                fail(error)
            })

            client.on('close', () => {
                console.log('Close Connection to PS5')
                clearTimeout(timeoutId)
            })
        })
    },

    getErrorCodeMessage(code=''){
        let message = code

        if(code==2157510681)
            message = code + " | task doesn't exist (?)"

        if(code==2157510663)
            message = code + ' | already installed (?)'

        if(code==2157510677)
            message = code + ' | It seems to be installed already'

        if(code==2157510789)
            message = code + ' | Not enough storage'

        return message
    },

    checkPS5(){
        if(store.getters['app/isSingleDPI'])
            return this.send({ action: 'ping' }).then(data => {
                if(!data || data.res !== 0)
                    throw new Error(data && data.error ? data.error : 'Invalid singleDPI response')

                if(!data.kstuff_available)
                    throw new Error('singleDPI is running, but kstuff support was not detected')

                if(!data.appinst_available)
                    throw new Error('singleDPI is running, but AppInst is not available')

                return data
            })

        return this.send(null)
    },

    install(file){
        if(!file.url)
            return new Promise((resolve, reject) => reject("Can't find file URL for " + file.name))

        if(store.getters['app/isSingleDPI']){
            const sfo = file.sfo || {}
            const data = file.data || {}

            return this.send({
                action: 'install',
                url: file.url,
                content_name: sfo.TITLE || data.name || file.name,
                content_id: sfo.CONTENT_ID || data.content_id || '',
                icon_url: file.image || data.image || data.icon || ''
            })
        }

        return this.send({ url: file.url })
    },

    status(contentId=''){
        if(!contentId)
            return new Promise((resolve, reject) => reject('Missing singleDPI content ID'))

        return this.send({ action: 'status', content_id: contentId })
    },
}

Vue.prototype.$ps5 = ps5
