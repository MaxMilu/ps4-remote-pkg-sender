import Vue from 'vue'
import Vuex from 'vuex'
import pathify from './pathify'

import { createPersistedState, createSharedMutations } from "vuex-electron"

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
            createPersistedState({
                throttle: 1000,
                blacklist: [
                    'server/addLog', 
                    'server/routes', 
                    'server/setStatus', 
                    'server/setRoutes',
                    'server/setServingFiles',
                    'server/setDraggedServingFiles'
                ],

                // whitelist: (mutation) => {
                //     // console.log(mutation.type, mutation.payload )
                //     let block = ['server/addLog', 'server/routes']

                //     if( block.includes(mutation.type) ){
                //         console.info("Store::Blocking | " + mutation.type)
                //         return false 
                //     }

                //     console.log("Store::Pass | " + mutation.type)
                //     return true
                // },
            }),
            createSharedMutations()
        ],
        modules
    })
}

let store

while(store === undefined){
    try {
        store = createStore()
        break;
    }
    catch(e){
        // alert("Error in Store, guess race condition. Recreating Storage." + e)
        continue;
    }
}

export default store
