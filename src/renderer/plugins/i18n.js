import Vue from 'vue'
import VueI18n from 'vue-i18n'
import en from '@/lang/en.json'

Vue.use(VueI18n)

const i18n = new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: en
  }
})

/**
 * @param {String} locale
 */
export async function loadMessages (locale) {
  if (Object.keys(i18n.getLocaleMessage(locale)).length === 0) {
    try {
      const messages = await import(/* webpackChunkName: "lang-[request]" */ `@/lang/${locale}`)
      i18n.setLocaleMessage(locale, messages.default || messages)
    } catch (e) {
      console.warn(`Failed to load messages for locale: ${locale}`, e)
    }
  }

  if (i18n.locale !== locale) {
    i18n.locale = locale
  }
}

// Make loadMessages available on i18n instance for convenience
i18n.loadMessages = loadMessages

export default i18n
