import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from './plugins/i18n'

import './plugins'
import './components'

Vue.config.devtools = process.env.NODE_ENV !== 'production',
Vue.config.productionTip = false,
Vue.config.errorHandler = (error, vm, info) => {
  alert("Application global errorHandler:\n" + error)
}

// Load saved locale on startup
const savedLocale = store?.getters?.['lang/locale'] || 'en'
i18n.loadMessages(savedLocale).catch(e => console.warn('Failed to load locale:', e))

// Spread App's options (data/computed/methods/template) into the root instance
// itself, rather than rendering App as a child (`render: h => h(App)`). Many
// components call `this.$root.sendPS4(...)`, `this.$root.notify(...)`,
// `this.$root.versions`, etc. - those only exist on $root if $root IS App.
new Vue({
  router,
  store,
  i18n,
  ...App,
}).$mount('#app')

// global window error catcher
window.onerror = function(message=null, source=null, lineno=null, colno=null, error=null) {
  console.log(message, source, lineno, colno, error)

  if(error != null)
      alert('Message ' + message +
          '\nSource ' + source +
          '\nLine ' + lineno +
          '\nColNo'  + colno +
          '\nError ' + error)
};

window.addEventListener('unhandledrejection', function(event) {
    //handle error here
    //event.promise contains the promise object
    //event.reason contains the reason for the rejection
    console.log(event)
    alert(event.reason)
});

console.log('Step 4: App.vue mounted with router + store + i18n + plugins + components');
