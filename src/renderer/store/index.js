import Vue from 'vue'
import Vuex from 'vuex'
import pathify from './pathify'

const { createSharedMutations } = require("vuex-electron")
// NOTE: createPersistedState is intentionally NOT used here. vuex-electron's
// persisted-state plugin relies on the "electron-store" package, whose constructor
// unconditionally calls (electron.app || electron.remote.app).getPath('userData').
// In the renderer process `app` is undefined and `remote` no longer exists (removed
// in modern Electron), so this always threw a TypeError and prevented the store
// (and thus the whole Vue app) from ever mounting - this was the root cause of the
// original black/white screen. TODO: reintroduce persistence via a renderer-safe
// mechanism (e.g. IPC to a main-process store, or localStorage).

Vue.use(Vuex)

// Load store modules dynamically.
const modulesList = import.meta.glob('./modules/*.js', { eager: true })

const modules = Object.keys(modulesList)
    .map(file => [file.replace(/^\.\/modules\//, '').replace(/\.js$/, ''), modulesList[file]])
    .reduce((modules, [name, module]) => {
        let mod = module.default || module;
        mod = { ...mod }; // Make it extensible
        if (mod.namespaced === undefined) {
            mod.namespaced = true
        }

        return { ...modules, [name]: mod }
    }, {})

function createStore(){
    return new Vuex.Store({
        plugins: [
            pathify.plugin,
            createSharedMutations()
        ], // createPersistedState omitted, see note above
        modules
    })
}

let store
let lastError

for (let attempt = 0; attempt < 5 && store === undefined; attempt++) {
    try {
        store = createStore()
    }
    catch (e) {
        lastError = e
        console.error('[Store] createStore() failed on attempt ' + (attempt + 1), e)
    }
}

if (store === undefined) {
    throw lastError || new Error('[Store] createStore() failed and produced no store')
}

export default store
