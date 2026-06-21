<template>
<div id='server_config'>

  <el-divider content-position="left">{{ $t('config.app.title') }}</el-divider>
  <div class="q-pl-md">
  <el-form :inline="true" label-width="150px" size="mini" label-position="left" @submit.native.prevent>
      <el-row>
        <el-col :span="8">
            <el-form-item :label="$t('config.app.language')">
              <el-select v-model="config.lang" :placeholder="$t('config.app.language')" default-first-option>
                  <el-option :label="$t('config.app.languages.zhCN')" :value="'zh-CN'" />
                  <el-option :label="$t('config.app.languages.en')" :value="'en'" />
                  <el-option :label="$t('config.app.languages.de')" :value="'de'" />
                  <el-option :label="$t('config.app.languages.fr')" :value="'fr'" :disabled="true" />
                  <el-option :label="$t('config.app.languages.sp')" :value="'sp'" :disabled="true" />
                  <el-option :label="$t('config.app.languages.tr')" :value="'tr'" :disabled="true" />
                  <el-option :label="$t('config.app.languages.gr')" :value="'gr'" :disabled="true" />
              </el-select>
            </el-form-item>
        </el-col>
        <el-col :span="16">
            <p style="font-style: italic; font-size: 13px; color: #888; padding-top: 5px">
              {{ $t('config.app.languageTip') }}
            </p>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="8">
            <el-form-item :label="$t('config.app.style')">
              <el-select v-model="config.style" :placeholder="$t('config.app.style')" default-first-option>
                  <el-option :label="$t('config.app.styles.light')" :value="'light'" />
                  <el-option :label="$t('config.app.styles.dark')" :value="'dark'" />
                  <el-option :label="$t('config.app.styles.pureblack')" :value="'pureblack'" />
              </el-select>
            </el-form-item>
        </el-col>
        <el-col :span="16">
            <p style="font-style: italic; font-size: 13px; color: #888; padding-top: 5px">
              {{ $t('config.app.styleTip') }}
            </p>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="8">
            <el-form-item :label="$t('config.app.titleBar')">
              <el-select v-model="config.titleBar" :placeholder="$t('config.app.titleBar')" default-first-option>
                  <el-option :label="$t('config.app.titleBars.default')" :value="'default'" />
                  <el-option :label="$t('config.app.titleBars.mac')" :value="'mac'" />
                  <el-option :label="$t('config.app.titleBars.macChromatic')" :value="'mac-chromatic'" />
                  <el-option :label="$t('config.app.titleBars.win')" :value="'win'" />
                  <el-option :label="$t('config.app.titleBars.none')" :value="'none'" />
              </el-select>
            </el-form-item>
        </el-col>
        <el-col :span="16">
            <p style="font-style: italic; font-size: 13px; color: #888; padding-top: 5px">
              {{ $t('config.app.titleBarTip') }}
            </p>
        </el-col>
      </el-row>
  </el-form>
  </div>


  <!--
    ***************************
    Features
    ***************************
  -->
  <el-divider content-position="left">{{ $t('config.app.features') }}</el-divider>
  <div class="q-pl-md">
  <el-form :inline="true" label-width="150px" size="mini" label-position="left" @submit.native.prevent>
      <el-row>
        <el-col :span="8">
            <el-form-item :label="$t('config.app.notifications')">
                <el-checkbox v-model="config.enableSystemNotifications"> {{ $t('config.app.enableNotifications') }} </el-checkbox>
            </el-form-item>
        </el-col>
        <el-col :span="16">
            <p style="font-style: italic; font-size: 13px; color: #888; padding-top: 5px">
              {{ $t('config.app.notificationsTip') }}
            </p>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="8">
            <el-form-item :label="$t('config.app.externalLinks')">
                <el-checkbox v-model="config.enableExternalLinks"> {{ $t('config.app.enableExternalLinks') }} </el-checkbox>
            </el-form-item>
        </el-col>
        <el-col :span="16">
            <p style="font-style: italic; font-size: 13px; color: #888; padding-top: 5px">
              {{ $t('config.app.externalLinksTip') }}
            </p>
        </el-col>
      </el-row>

      <el-row>
          <el-col :span="8">
              <el-form-item :label="$t('config.app.hbStore')">
                  <el-checkbox v-model="config.useHB"> {{ $t('config.app.enableHB') }}</el-checkbox>
              </el-form-item>
          </el-col>
          <el-col :span="16">
              <p style="font-style: italic; font-size: 13px; color: #888; padding-top: 5px">
                {{ $t('config.app.hbStoreTip') }}
              </p>
          </el-col>
      </el-row>

      <el-row v-if="config.useHB">
          <el-col :span="8">
              <el-form-item :label="$t('config.app.hbStoreMode')">
                  <el-select v-model="config.useHBMode" :placeholder="$t('config.app.hbStoreMode')" default-first-option>
                      <el-option :label="$t('config.app.hbModes.refactored')" :value="'refactored'" />
                      <el-option :label="$t('config.app.hbModes.pkgZone')" :value="'pkg-zone'" />
                      <el-option :label="$t('config.app.hbModes.custom')" :value="'custom'" />
                  </el-select>
              </el-form-item>
          </el-col>

          <el-col :span="16">
              <p style="font-style: italic; font-size: 13px; color: #888; padding-top: 5px" v-if="config.useHBMode == 'refactored'">
                  <b>{{ $t('config.app.hbModes.refactored') }}</b> {{ $t('config.app.hbModes.refactoredTip') }} <br>
              </p>
              <p style="font-style: italic; font-size: 13px; color: #888; padding-top: 5px" v-if="config.useHBMode == 'pkg-zone'">
                  <b>{{ $t('config.app.hbModes.pkgZone') }}</b> {{ $t('config.app.hbModes.pkgZoneTip') }} <br>
              </p>
              <p style="font-style: italic; font-size: 13px; color: #888; padding-top: 5px" v-if="config.useHBMode == 'custom'">
                  <b>{{ $t('config.app.hbModes.custom') }}</b> {{ $t('config.app.hbModes.customTip') }} <br>
              </p>
          </el-col>
      </el-row>

      <el-row v-if="config.useHB && config.useHBMode">
          <el-col :span="8">
              <el-form-item :label="$t('config.app.hbStoreCdn')" class="full-width full-width-150">
                  <el-input v-model="config.useHBRoot" style="width: 100%;" v-if="config.useHBMode != 'custom'" :disabled="config.useHBMode == 'pkg-zone'"> </el-input>
                  <el-input v-model="config.useHBCustomRoot" style="width: 100%;" v-if="config.useHBMode == 'custom'"> </el-input>
              </el-form-item>
          </el-col>

          <el-col :span="16">
              <p style="font-style: italic; font-size: 13px; color: #888; padding-top: 5px; padding-left: 30px;">
                  {{ $t('config.app.hbStoreCdnTip') }}
              </p>
          </el-col>
      </el-row>

      <div style="height: 30px" />

      <div>
          <el-form-item :label="$t('config.app.showConfigObject')" label-width="300px">
              <el-checkbox v-model="config.showConfigObject"> {{ $t('config.app.showConfigObjectTip') }} </el-checkbox>
          </el-form-item>
      </div>

  </el-form>
  </div>

  <template v-if="debug">
      <pre>Config {{ config }}</pre>
  </template>

</div>
</template>

<script>
import { get, sync } from 'vuex-pathify'
import i18n from '@/plugins/i18n'

export default {
    name: 'AppConfig',

    data(){ return {
        debug: false,
    }},

    mounted(){

    },

    computed: {
        config: get('app/config'),
    },

    watch: {
        'config.lang'(){
            // Switch i18n locale
            const newLocale = this.config.lang || 'en'
            i18n.loadMessages(newLocale).catch(e => {
                console.warn('Failed to switch language:', e)
            })
            this.$store.dispatch('lang/setLocale', { locale: newLocale })
            this.save()
        },
        'config.style'(){ this.save() },
        'config.titleBar'(){ this.save() },
        'config.useHB'(){ this.save() },
        'config.useHBMode'(){
            if( this.config.useHBMode == 'pkg-zone' )
                this.config.useHBRoot = 'http://api.pkg-zone.com/'

            this.save()
        },
        'config.useHBRoot'(){ this.save() },
        'config.useHBCustomRoot'(){ this.save() },
        'config.showConfigObject'(){ this.save() },
        'config.enableExternalLinks'(){ this.save() },
        'config.enableSystemNotifications'(){ this.save() },
    },

    methods: {
        save(){
            console.log("Saving App Configuration")
            this.$store.dispatch('app/setConfig', this.config)
        },

    }
}
</script>

<style lang="scss">

</style>
