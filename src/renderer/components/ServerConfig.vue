<template>
<div id='server_config'>

  <el-divider content-position="left">{{ $t('config.server.title') }}</el-divider>

  <div class="q-pl-md">
  <el-form :inline="true" label-width="150px" size="mini" label-position="left" @submit.native.prevent>
      <el-row :gutter="10">
          <el-col :span="10">
              <el-form-item :label="$t('config.server.ip')">
                  <el-select v-model="server.ip" :placeholder="$t('config.server.networkInterface')" default-first-option>
                      <el-option :label="i.title" :value="i.ip" v-for="i in ifaces" :key="i.ip"></el-option>
                  </el-select>
              </el-form-item>
          </el-col>
          <el-col :span="10">
              <el-form-item :label="$t('config.server.port')">
                <el-input v-model="server.port"></el-input>
              </el-form-item>
          </el-col>
          <el-col :span="4">
              <el-button size="mini" icon="fa fa-server" style="width: calc(100% - 40px)" @click="$root.openServer()"> {{ $t('config.server.serverButton') }} </el-button>
          </el-col>
      </el-row>

      <el-row :gutter="10">
          <el-col :span="10">
              <el-form-item :label="$t('config.server.app')">
                  <el-select v-model="server.app" :placeholder="$t('config.server.application')" default-first-option>
                      <el-option :label="$t('config.server.apps.express')" :value="'express'" :disabled="false" />
                      <el-option :label="$t('config.server.apps.apache')" :value="'apache'" :disabled="true" />
                      <el-option :label="$t('config.server.apps.nginx')" :value="'nginx'" :disabled="true" />
                      <el-option :label="$t('config.server.apps.proxy')" :value="'proxy'" :disabled="true" />
                      <el-option :label="$t('config.server.apps.remote')" :value="'remote'" :disabled="true" />
                      <el-option :label="$t('config.server.apps.custom')" :value="'custom'" :disabled="true" />
                  </el-select>
              </el-form-item>
          </el-col>
          <el-col :span="10">
              <el-form-item :label="$t('config.server.status')">
                  <el-tag size="small" style="width:100%;" :type="$helper.getServerStatusType(status)">{{ $t('config.server.statusValues.' + status) || status }}</el-tag>
              </el-form-item>
          </el-col>
          <el-col :span="4">
              <el-button size="mini" icon="el-icon-refresh" @click="$root.sendServer('refresh')"></el-button>
              <el-button size="mini" icon="el-icon-switch-button" @click="$root.sendServer('toggle')"></el-button>
          </el-col>
      </el-row>


      <el-divider content-position="left">{{ $t('config.server.location') }}</el-divider>
      <el-row>
          <el-col :span="24">
              <el-form-item :label="$t('config.server.pkgBasePath')" class="base_path">
                <el-input :placeholder="$t('config.server.pkgBasePathPlaceholder')" v-model="server.base_path" disabled>
                    <el-button slot="append" icon="el-icon-edit" @click.native="enterManuallyBasePath"> {{ $t('config.server.pkgBasePathEnter') }}</el-button>
                    <el-button slot="append" icon="el-icon-folder" @click.native="selectBasePath"> {{ $t('config.server.pkgBasePathChoose') }}</el-button>
                </el-input>
              </el-form-item>
          </el-col>
      </el-row>

      <div>
          <el-form-item :label="$t('config.server.autoScan')">
              <el-checkbox v-model="server.auto_scan_on_startup" disabled>{{ $t('config.server.autoScanOnStartup') }}</el-checkbox>
          </el-form-item>
      </div>
      <div>
          <el-form-item :label="$t('config.server.deepscan')">
              <el-checkbox v-model="server.scan_subdir">{{ $t('config.server.scanSubdir') }}</el-checkbox>
          </el-form-item>
      </div>

      <el-divider content-position="left">{{ $t('config.server.features') }}</el-divider>
      <div>
          <el-form-item :label="$t('config.server.urlPrefix')">
              <el-checkbox v-model="server.prependFullPath"> {{ $t('config.server.urlPrefixTip') }}</el-checkbox>
          </el-form-item>
      </div>
      <div>
          <el-form-item :label="$t('config.server.queueScanner')">
              <el-checkbox v-model="server.enableQueueScanner"> {{ $t('config.server.queueScannerTip') }}</el-checkbox>
          </el-form-item>
      </div>
      <div>
          <el-form-item :label="$t('config.server.readSfoHeader')">
              <el-checkbox v-model="server.readSFOHeader" :disabled="ps4.app == 'goldhen'"> {{ $t('config.server.readSfoHeaderTip') }} </el-checkbox>
          </el-form-item>
      </div>

  </el-form>
  </div>

  <template v-if="debug">
    <pre>Server {{ server }}</pre>
    <pre>Interfaces {{ ifaces }}</pre>
  </template>

</div>
</template>

<script>
import { get, sync } from 'vuex-pathify'
import { throttle } from 'lodash'
const { ipcRenderer } = require('electron')
const remote = require('@electron/remote')

export default {
    name: 'ServerConfig',

    data(){ return {
        debug: false,

        ifaces: [],
    }},

    mounted(){
        this.loadNetworkInterfaces()
    },

    computed: {
        ps4: sync('app/ps4'),
        server: get('app/server'),
        status: get('server/status'),
    },

    watch: {
        // server: {
        //     deep: true,
        //     handler: throttle(this.save(), 2000)
        // },
        'server.ip'(){ this.save() },
        'server.port'(){ this.save() },
        'server.app'(){ this.save() },
        'server.auto_scan_on_startup'(){ this.save() },
        'server.base_path'(){
            this.save()
            this.loadFiles()
        },
        async 'server.scan_subdir'(){
            this.save()
            this.loadFiles()
        },
        async 'server.prependFullPath'(){
            this.save()
            this.loadFiles()
        },
        'server.enableQueueScanner'(){
            this.save()
        },
        'server.readSFOHeader'(){
            this.save()
            this.loadFiles()
        }
    },

    methods: {
        loadNetworkInterfaces(){
            this.ifaces = this.$helper.getNetWorkInterfaces()

            if(this.ifaces.length){
                // this.server.iface = this.ifaces[0]
            }
        },

        async selectBasePath(){
            let path = await remote.dialog.showOpenDialog({ properties: ['openDirectory'] })

            if( path && !path.canceled )
                this.server.base_path = path.filePaths[0]
        },

        loadFiles(){
            this.$store.dispatch('server/loadFiles', this.server.base_path)
            this.$message({
                type: 'success',
                message: this.$t('server.messages.filesReloaded')
            });
        },

        async save(){
            console.log("Saving Local Server Configuration")
            await this.$store.dispatch('app/setServer', this.server)
        },

        enterManuallyBasePath(){
            this.$prompt(this.$t('server.messages.pleaseInputBasePath'), this.$t('server.messages.basePathTitle'), {
                confirmButtonText: this.$t('common.buttons.ok'),
                cancelButtonText: this.$t('common.buttons.cancel'),
            }).then(({ value }) => {
                if(value){
                    this.server.base_path = value
                    this.$message({
                        type: 'success',
                        message: this.$t('server.messages.basePathSet', { path: value })
                    });
                }
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: this.$t('server.messages.inputCanceled')
                });
            });
        }

    }
}
</script>

<style lang="scss">
.input_base_path .el-form-item__content {
  width: calc(100% - 175px);
}
</style>
