/*
    Autoload all current vue files as component and register them by their name.
    ---
    Author: Gkiokan Sali
    Date: 2019-05-09
*/

import Vue from 'vue'

const modulesList = import.meta.glob('./*.vue', { eager: true })
const layouts = Object.keys(modulesList)
  .map(file => [file.replace(/^\.\//, '').replace(/\.vue$/, ''), modulesList[file]])
  .reduce((components, [name, component]) => {
    let Component = component.default || component
    if(Component.name) {
      Vue.component(Component.name, Component)
    }
  }, {})
