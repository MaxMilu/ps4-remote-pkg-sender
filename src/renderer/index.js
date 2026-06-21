import Vue from 'vue'
import App from './App.vue'

import router from './router'
import store from './store'
import i18n from './plugins/i18n'

import './plugins'
import './components'

const styles=document.createElement('style');
styles.innerText=`@import url(https://unpkg.com/spectre.css/dist/spectre.min.css);
  .empty{display:flex;
    flex-direction:column;
    justify-content:center;
    height:100vh;
    position:relative}.footer{bottom:0;
      font-size:13px;
      left:50%;
      opacity:.9;
      position:absolute;
      transform:translateX(-50%);
      width:100%}`;

// document.head.appendChild(styles);

Vue.config.devtools = process.env.NODE_ENV !== 'production',
Vue.config.productionTip = false,
Vue.config.errorHandler = (error, vm, info) => {
  alert("Application global errorHandler:\n" + error)
}

// Load saved locale on startup
const savedLocale = store?.getters?.['lang/locale'] || 'en'
i18n.loadMessages(savedLocale).catch(e => console.warn('Failed to load locale:', e))

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
