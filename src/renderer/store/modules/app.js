import { make } from 'vuex-pathify'

export const state = {
    time: 0,
    started: 0,

    serial: null,

    config: {
        lang: 'en',
        style: 'light',
        titleBar: 'default',
        useHB: false,
        useHBMode: 'refactored',
        useHBRoot: 'http://api.pkg-zone.com/',
        showConfigObject: false,
        enableExternalLinks: false,
        enableSystemNotifications: false,
    },

    server: {
        ip: '',
        port: '8337',
        app: 'express',
        base_path: '',
        auto_scan_on_startup: true,
        scan_subdir: false,
        prependFullPath: false,
        enableQueueScanner: false,
        readSFOHeader: false,
    },

    ps4: {
        ip: '',
        app: 'rpi',
        name: '',
        port: 12800,
        port_rpi: 12800,
        port_rpiOOP: 12800,
        port_ftp: 2121,
        port_etaHEN: 9090,
        port_singleDPI: 9090,
        port_goldhen: 9090,
        singleDPI_queue_mode: 'immediate',
        singleDPI_queue_delay_seconds: 5,
        timeout: 2500,
        update: 2200,
    },

}


// make all mutations
export const mutations = {
    ...make.mutations(state),

    addTime(state){
        state.time++
    },

    addStarted(state){
        state.started++
    },

    resetServer(state){
        state.server =  {
            ip: '',
            port: '8337',
            app: 'express',
            base_path: '',
            auto_scan_on_startup: true,
            scan_subdir: false,
            prependFullPath: false,
            enableQueueScanner: false,
            readSFOHeader: false,
        }

        state.ps4 = {
            ip: '',
            app: 'rpi',
            name: '',
            port: 12800,
            port_rpi: 12800,
            port_rpiOOP: 12800,
            port_ftp: 2121,
            port_etaHEN: 9090,
            port_singleDPI: 9090,
            port_goldhen: 9090,
            singleDPI_queue_mode: 'immediate',
            singleDPI_queue_delay_seconds: 5,
            timeout: 2500,
            update: 2200,
        }
    },

    resetConfig(state){
        state.config = {
            lang: 'en',
            style: 'light',
            useHB: false,
            useHBMode: 'refactored',
            useHBRoot: 'http://api.pkg-zone.com/',
            useHBCustomRoot: '',
            showConfigObject: false,
            enableExternalLinks: false,
            enableSystemNotifications: false,
        }
    },

    saveServer(state){
        state.server = state.server
    },

    toggleQueueScanner(state){
        state.server.enableQueueScanner = !state.server.enableQueueScanner
    }
}

// actions
export const actions = {
    ...make.actions(state),

    addTime( { state, commit }){
        commit('addTime')
    },

    started({commit}){
        commit('addStarted')
    },

    reset({ commit }){
        commit('resetServer')
    },

    save({ commit }){
        commit('saveServer')
    },

    resetConfig({ commit }){
        commit('resetConfig')
    },

    toggleQueueScanner({ commit }){
        commit('toggleQueueScanner')
    }

    // addFiles({ commit, dispatch, state}, payload){
    //     commit('addFiles', payload)
    // }
}

// getters
export const getters = {
    // make all getters (optional)
    ...make.getters(state),

    isPS5(state){
            return ['etaHEN', 'singleDPI'].includes(state.ps4.app)
    },

    isSingleDPI(state){
            return state.ps4.app == 'singleDPI'
    },

    getPS4TargetApp(state){
        return state.ps4.app
    },

    getPS4IP(state){
        return state.ps4.ip + ':' + state.ps4.port
    },

    getPS4Timeout(state){
        return state.ps4.timeout
    },

    getServerIP(state){
        return state.server.ip + ':' + state.server.port
    },

    getPrefixFullPath(state){
        return state.server.prependFullPath
    },

    getReadSFOHeader(state){
            return state.server.readSFOHeader
    },

    getStyle(state){
        return state.config.style
    }

    // overwrite default `items` getter
    // allFiles: state => {
    //     return state.images
    // },
}
