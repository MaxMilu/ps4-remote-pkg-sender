<template>
<div id='server_config'>


  <el-divider content-position="left">{{ $t('config.ps4.title') }}</el-divider>

  <div class="q-pl-md">
  <el-form :inline="true" label-width="150px" size="mini" label-position="left" @submit.native.prevent>
      <el-row :gutter="20">
          <el-col :span="10">
              <el-form-item :label="$t('config.ps4.ip')">
                <el-input v-model="ps4.ip"></el-input>
              </el-form-item>
          </el-col>

          <el-col :span="10">
              <el-button size="mini" icon="el-icon-search" :disabled="true">{{ $t('config.ps4.searchButton') }}</el-button>
          </el-col>
      </el-row>

      <el-row :gutter="20">
          <el-col :span="10">
              <el-form-item :label="$t('config.ps4.app')">
                  <el-select v-model="ps4.app" :placeholder="$t('config.ps4.app')" default-first-option>
                      <el-option :label="$t('config.ps4.apps.rpi')" :value="'rpi'" :disabled="false" />
                      <el-option :label="$t('config.ps4.apps.rpiOOP')" :value="'rpiOOP'" :disabled="false" />
                      <el-option :label="$t('config.ps4.apps.singleDPI')" :value="'singleDPI'" :disabled="false" />
                      <el-option :label="$t('config.ps4.apps.goldhen')" :value="'goldhen'" :disabled="false" />
                      <el-option :label="$t('config.ps4.apps.etaHEN')" :value="'etaHEN'" :disabled="false" />
                      <el-option :label="$t('config.ps4.apps.ipi')" :value="'ipi'" :disabled="true" />
                      <el-option :label="$t('config.ps4.apps.hbstore')" :value="'hbstore'" :disabled="true" />
                  </el-select>
              </el-form-item>
          </el-col>

          <el-col :span="9">
              <el-form-item :label="$t('config.ps4.port')">
                  <el-input v-model="ps4.port" :disabled="ps4.app != 'rpiOOP'" style="width: 150px"></el-input>
              </el-form-item>
          </el-col>

          <el-col :span="5">
              <el-button size="small" @click="checkPS4" style="width: 100%"> <i class="el-icon-loading" v-if="testingConnection" />  {{ $t('common.buttons.test') }}</el-button>
          </el-col>
      </el-row>


      <el-divider content-position="left">{{ $t('config.ps4.parameters') }}</el-divider>
      <el-row :gutter="20">
          <el-col :span="10">
              <el-form-item :label="$t('config.ps4.timeout')" style="margin-bottom: 0px;">
                  <el-slider v-model="ps4.timeout" :format-tooltip="(val) => val + 'ms'"
                            :step="100" :min="2000" :max="8000" style="width:160px; display: inline-block"></el-slider> <br>
              </el-form-item>
          </el-col>

          <el-col :span="10">
              <el-form-item :label="$t('config.ps4.updateInterval')" style="margin-bottom: 0px;">
                  <el-slider v-model="ps4.update" :format-tooltip="(val) => val + 'ms'"
                            :step="100" :min="1000" :max="5000" style="width:160px; display: inline-block"></el-slider>
              </el-form-item>
          </el-col>
      </el-row>

      <el-row :gutter="20" v-if="ps4.app == 'singleDPI'">
          <el-col :span="10">
              <el-form-item :label="$t('config.ps4.queueMode')">
                  <el-radio-group v-model="ps4.singleDPI_queue_mode" size="mini">
                      <el-radio-button label="immediate">{{ $t('config.ps4.queueModeImmediate') }}</el-radio-button>
                      <el-radio-button label="delay">{{ $t('config.ps4.queueModeDelay') }}</el-radio-button>
                  </el-radio-group>
              </el-form-item>
          </el-col>

          <el-col :span="10" v-if="ps4.singleDPI_queue_mode == 'delay'">
              <el-form-item :label="$t('config.ps4.queueDelay')">
                  <el-input-number v-model="ps4.singleDPI_queue_delay_seconds"
                                   :min="1" :max="3600" :step="1" />
                  <span style="margin-left: 8px">{{ $t('config.ps4.queueDelaySeconds') }}</span>
              </el-form-item>
          </el-col>
      </el-row>

      <el-row :gutter="20">
          <el-col :span="10">
              <p style="font-style: italic; font-size: 13px; color: #888">
                {{ $t('config.ps4.timeoutTip') }}
              </p>
          </el-col>

          <el-col :span="12">
              <p style="font-style: italic; font-size: 13px; color: #888">
                {{ $t('config.ps4.updateIntervalTip') }}
              </p>
          </el-col>
      </el-row>

  </el-form>
  </div>

</div>
</template>

<script>
import { get, sync } from 'vuex-pathify'

export default {
    name: 'PS4Config',

    data(){ return {
        testingConnection: false,
    }},

    mounted(){
        if(this.ps4.app == 'singleDPI'){
            if(!['immediate', 'delay'].includes(this.ps4.singleDPI_queue_mode))
                this.ps4.singleDPI_queue_mode = 'delay'

            if(!Number(this.ps4.singleDPI_queue_delay_seconds))
                this.ps4.singleDPI_queue_delay_seconds = 2
        }
    },

    computed: {
        ps4: sync('app/ps4'),
        server: sync('app/server'),
    },

    watch: {
        'ps4.ip'(){ this.save() },
        'ps4.app'(val){ 
            if(val == 'rpi')
                this.ps4.port = this.ps4.port_rpi

            if(val == 'rpiOOP')
                this.ps4.port = this.ps4.port_rpiOOP

            if(val == 'etaHEN'){
                this.ps4.port = this.ps4.port_etaHEN ?? 9090
                this.server.enableQueueScanner = false
            }

            if(val == 'singleDPI'){
                this.ps4.port = this.ps4.port_singleDPI ?? 9090
                this.server.readSFOHeader = true

                this.ps4.singleDPI_queue_mode = 'delay'
                this.ps4.singleDPI_queue_delay_seconds = 2
            }

            if(val == 'goldhen'){
                this.ps4.port = this.ps4.port_goldhen ?? 9090
                this.server.enableQueueScanner = false     
                this.server.readSFOHeader = true           
            }

            this.save()
        },
        'ps4.port'(){ 
            if(this.ps4.app == 'rpiOOP')
              this.ps4.port_rpiOOP = this.ps4.port

            if(this.ps4.app == 'singleDPI')
              this.ps4.port_singleDPI = this.ps4.port

            this.save()
        },
        'ps4.timeout'(){ this.save() },
        'ps4.updateInterval'(){ this.save() },
        'ps4.singleDPI_queue_mode'(){ this.save() },
        'ps4.singleDPI_queue_delay_seconds'(){ this.save() },
    },

    methods: {
        save(){
            console.log("Save PS4 Configuration")
            this.$store.dispatch('app/setPs4', this.ps4)
        },

        async checkPS4(){
            this.testingConnection = true

            if( this.$store.getters['app/isPS5'] )
                return await this.$ps5.checkPS5()
                    .then( () => {
                        this.testingConnection = false
                        this.$root.log(this.$t('messages.connection.ps5Accessible'), null)
                        this.$message({ message: this.$t('messages.connection.ps5Accessible'), type: 'success' })
                    })
                    .catch( e => {
                        this.testingConnection = false
                        console.log(e)
                        this.$root.log(this.$t('messages.connection.ps5CheckNotAccessible'), e)
                        this.$message({ message: this.$t('messages.connection.ps5NotAccessible'), type: 'error' })
                    })

            this.$ps4.checkPS4()
                .then( (res) => {
                    this.testingConnection = false
                    this.$root.log(this.$t('messages.connection.ps4Accessible'), { status: res.status, statusText: res.statusText })
                    this.$message({ message: this.$t('messages.connection.playstationAccessible'), type: 'success' })
                })
                .catch( e => {
                    this.testingConnection = false
                    this.$root.log(this.$t('messages.connection.ps4CheckNotAccessible'), e)
                    this.$message({ message: this.$t('messages.connection.ps4NotAccessible'), type: 'error' })
                })
        },

    }
}
</script>

<style lang="css" scoped>
</style>
