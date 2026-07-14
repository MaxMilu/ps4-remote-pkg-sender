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
const http = require('http')

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

    getSingleDPIV1Target(){
        const target = this.getURL('ps')
        return { host: target.host, port: store.state.app.ps4.port_singleDPI || 9090 }
    },

    getTimeout(min=2000){
        let timeout = store.getters['app/getPS4Timeout']
        return timeout < min ? min : timeout
    },

    send(requestObject={}, targetOverride=null){
        return new Promise((resolve, reject) => {
            const client = new net.Socket()
            const target = targetOverride || this.getURL('ps')
            let response = ''
            let settled = false

            const timeoutId = setTimeout(() => {
                client.destroy()
                fail(new Error('PS5 Connection timed out at ' + target.host + ':' + target.port))
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

            client.connect(target, () => {
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
                    return fail(`PS5 Connection failed at ${target.host}:${target.port}`)

                fail(error)
            })

            client.on('close', () => {
                console.log('Close Connection to PS5')
                clearTimeout(timeoutId)
            })
        })
    },

    postSingleDPIv2Url(formFields={}){
        return new Promise((resolve, reject) => {
            const target = this.getURL('ps')
            const { dpi_v2_url_port, ...fields } = formFields
            const postData = new URLSearchParams(fields).toString()
            const options = {
                host: target.host,
                port: dpi_v2_url_port || 12800,
                path: '/',
                method: 'POST',
                timeout: this.getTimeout(),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(postData)
                }
            }

            const req = http.request(options, res => {
                let body = ''
                res.setEncoding('utf8')
                res.on('data', chunk => body += chunk)
                res.on('end', () => {
                    if(!body.startsWith('SUCCESS:'))
                        return reject(new Error(body || 'singleDPI DPI v2 URL install failed'))

                    const jsonStart = body.indexOf('{')
                    if(jsonStart >= 0){
                        try {
                            const parsed = JSON.parse(body.slice(jsonStart))
                            parsed.raw = body
                            return resolve(parsed)
                        } catch(e) {
                            console.warn('singleDPI DPI v2 response JSON parse failed', e)
                        }
                    }

                    resolve({ res: 0, dpi_mode: 'v2_url', raw: body })
                })
            })

            req.on('timeout', () => {
                req.destroy()
                reject(new Error('singleDPI DPI v2 URL request timed out at ' + target.host + ':12800'))
            })
            req.on('error', reject)
            req.write(postData)
            req.end()
        })
    },

    parseFirmwareMajor(version=''){
        const match = String(version || '').match(/^(\d+)/)
        return match ? parseInt(match[1]) : 0
    },

    shouldUseSingleDPIv2Url(info=null){
        if(!info || !info.dpi_v2_url_available)
            return false

        const major = this.parseFirmwareMajor(info.firmware_version)
        return major >= 10
    },

    getSingleDPIInfo(){
        return this.checkPS5()
    },

    getSingleDPIInstallMode(){
        const mode = store.getters['app/getSingleDPIInstallMode']
        return ['auto', 'v1', 'v2'].includes(mode) ? mode : 'auto'
    },

    isSingleDPIInstallSuccess(response=null){
        return response && Object.prototype.hasOwnProperty.call(response, 'res') &&
            parseInt(response.res) === 0
    },

    describeSingleDPIInstallFailure(mode='', error=null){
        if(!error)
            return mode + ' failed without response'

        if(error instanceof Error)
            return mode + ' failed: ' + error.message

        if(Object.prototype.hasOwnProperty.call(error, 'res'))
            return mode + ' failed: res=' + error.res +
                (error.error ? ' ' + error.error : '')

        return mode + ' failed: ' + String(error)
    },

    installSingleDPIv1(formFields={}){
        return this.send({
            action: 'install',
            ...formFields
        }, this.getSingleDPIV1Target())
    },

    installSingleDPIv2(formFields={}, info={}){
        return this.postSingleDPIv2Url({
            ...formFields,
            dpi_v2_url_port: info.dpi_v2_url_port || 12800
        })
    },

    installSingleDPIWithFallback(formFields={}, info={}){
        const canUseV2 = info && info.dpi_v2_url_available
        const selectedMode = this.getSingleDPIInstallMode()
        let modes = ['v1']

        if(selectedMode == 'v2')
            modes = ['v2', 'v1']
        else if(selectedMode == 'v1')
            modes = canUseV2 ? ['v1', 'v2'] : ['v1']
        else {
            const preferV2 = this.shouldUseSingleDPIv2Url(info)
            modes = preferV2 && canUseV2
                ? ['v2', 'v1']
                : (canUseV2 ? ['v1', 'v2'] : ['v1'])
        }

        const failures = []

        const tryMode = (index=0) => {
            const mode = modes[index]
            const installer = mode == 'v2'
                ? this.installSingleDPIv2(formFields, info)
                : this.installSingleDPIv1(formFields)

            return installer.then(response => {
                if(this.isSingleDPIInstallSuccess(response))
                    return response

                failures.push(this.describeSingleDPIInstallFailure(mode, response))
                if(index + 1 < modes.length)
                    return tryMode(index + 1)

                throw new Error('singleDPI install failed. ' + failures.join(' | '))
            }, error => {
                failures.push(this.describeSingleDPIInstallFailure(mode, error))
                if(index + 1 < modes.length)
                    return tryMode(index + 1)

                throw new Error('singleDPI install failed. ' + failures.join(' | '))
            })
        }

        return tryMode(0)
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
            return this.send({ action: 'ping' }, this.getSingleDPIV1Target()).then(data => {
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
            const formFields = {
                url: file.url,
                content_name: sfo.TITLE || data.name || file.name,
                content_id: sfo.CONTENT_ID || data.content_id || '',
                icon_url: file.image || data.image || data.icon || ''
            }

            return this.getSingleDPIInfo()
                .then(info => this.installSingleDPIWithFallback(formFields, info))
        }

        return this.send({ url: file.url })
    },

    status(contentId=''){
        if(!contentId)
            return new Promise((resolve, reject) => reject('Missing singleDPI content ID'))

        return this.send({ action: 'status', content_id: contentId }, this.getSingleDPIV1Target())
    },

    isInstalled(file){
        const sfo = file.sfo || {}
        const data = file.data || {}
        const titleId = sfo.TITLE_ID || data.TITLE_ID || data.title_id || file.cusa || ''
        const contentId = sfo.CONTENT_ID || data.CONTENT_ID || data.content_id || ''
        const category = sfo.CATEGORY || data.CATEGORY || data.category || ''

        if(!titleId || !category)
            return Promise.reject(new Error('TITLE_ID and CATEGORY are required for installation detection'))

        return this.send({
            action: 'is_installed',
            title_id: titleId,
            content_id: contentId,
            category
        }, this.getSingleDPIV1Target())
    },
}

Vue.prototype.$ps5 = ps5
