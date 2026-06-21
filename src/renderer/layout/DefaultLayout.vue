<template>
<el-container>
      <el-header>
          <TitleBar />

          <el-menu :default-active="'home'" :router="true" mode="horizontal" ref="menu" @select="handleSelect">
              <el-menu-item index="home" ref="home">{{ $t('menu.processingCenter') }}</el-menu-item>

              <el-menu-item index="server" ref="server">{{ $t('menu.server') }}</el-menu-item>

              <el-menu-item index="hb-store" ref="server" v-if="config.useHB">{{ $t('menu.hbStore') }}</el-menu-item>

              <el-menu-item index="config">{{ $t('menu.config') }}</el-menu-item>

              <el-submenu index="miscs">
                  <template slot="title">{{ $t('menu.miscs') }}</template>

                  <el-menu-item index="downloads">{{ $t('menu.downloads') }}</el-menu-item>
                  <el-menu-item index="changelog">{{ $t('menu.changelog') }}</el-menu-item>

                  <div style="background: #ddd; height: 1px; margin: 5px 0px" />

                  <el-menu-item @click="$root.open(links.troubleshoot)">{{ $t('menu.troubleshootingGuide') }}</el-menu-item>

                  <div style="background: #ddd; height: 1px; margin: 5px 0px" />

                  <el-menu-item @click="$root.open(links.github_repo)">{{ $t('menu.githubRepo') }}</el-menu-item>
                  <el-menu-item @click="$root.open(links.github_repo_singleDPI)">{{ $t('menu.githubRepoSingleDPI') }}</el-menu-item>
                  <el-menu-item @click="$root.open(links.report_issue)">{{ $t('menu.reportIssue') }}</el-menu-item>
              </el-submenu>

              <el-menu-item index="settings">{{ $t('menu.settings') }}</el-menu-item>
              <el-menu-item index="">
                <div class="connection_indicators">
                  <el-tooltip :content="'Local Server: ' + (serverOnline ? $t('common.status.enabled') : $t('common.status.disabled'))" placement="bottom">
                      <span class="connection_indicator connection_indicator_server" :class="{ online: serverOnline }">
                          <i class="fa fa-server" />
                          <span class="connection_dot" :class="{ online: serverOnline }" />
                      </span>
                  </el-tooltip>
                  <el-tooltip :content="'PlayStation: ' + (playstationOnline ? $t('common.status.enabled') : $t('common.status.disabled'))" placement="bottom">
                      <span class="connection_indicator connection_indicator_playstation" :class="{ online: playstationOnline }">
                          <i class="fab fa-playstation" />
                          <span class="connection_dot" :class="{ online: playstationOnline }" />
                      </span>
                  </el-tooltip>
                </div>
              </el-menu-item>


              <div class='top_right_header'>
                  <el-button size="mini" icon="el-icon-user" round @click="move({ name: 'user' })"> {{ $t('menu.supportFeatures') }} </el-button>

                  <el-badge :is-dot="true" value="new" :hidden="!newVersionAvailable" class="sync_icon">
                      <div class="" @click="checkUpdate">
                          <i class="el-icon-refresh" />
                      </div>
                  </el-badge>

                  <el-dropdown class="window_dropdown" @command="handleViewCallback">
                    <i class="el-icon-files" />
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="server"> {{ $t('menu.openLocalServer') }} </el-dropdown-item>
                      <el-dropdown-item command="ps4"> {{ $t('menu.openPsApiLogs') }} </el-dropdown-item>
                      <el-dropdown-item command="info"> {{ $t('menu.info') }} </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>

                  <div class='close_application' @click="closeApplicationRequest">
                      <i class="el-icon-switch-button" />
                  </div>
              </div>

          </el-menu>
      </el-header>

      <el-main class="main_view" :class="{ fixed_table_view: $route.name == 'home' || $route.name == 'server' }" ref="main">
          <div class="main_content_offset" />

          <DragAndDrop :files="draggedFiles" @close="showDragAndDropOverlay = false" v-if="showDragAndDropOverlay" />

          <router-view />

          <div style="margin-top: 100px; display:block;" v-if="$route.name != 'home' && $route.name != 'server'">
              <transition name="el-zoom-in-bottom">
                <el-button round icon="el-icon-arrow-up" class="scrollToTop" @click="scrollToTop" v-show="scrollOffset < scrollPosition"> Back to Top </el-button>
              </transition>
          </div>

          <LatestVersionInfo ref="LatestVersionInfo" />
      </el-main>

</el-container>
</template>

<script>
import { get } from 'vuex-pathify'
import { shell } from 'electron'
import links from '@/../config/links'
import { ipcRenderer, remote } from 'electron'

export default {
  name: 'DefaultLayout',

  data(){ return {
      links,
      scrollOffset: 500,
      scrollPosition: 0,
      newVersionAvailable: true,
      showDragAndDropOverlay: false,
      draggedFiles: [],
      connectionHeartbeatTimer: null,
      connectionHeartbeatRunning: false,
      serverOnline: false,
      playstationOnline: false,
  }},

  computed: {
      config: get('app/config'),
      serverConfig: get('app/server'),
      ps4Config: get('app/ps4'),
      isPS5: get('app/isPS5'),
      getPS4TargetApp: get('app/getPS4TargetApp'),
  },

  mounted(){
      this.registerChannel()
      this.autoCheckUpdate()
      this.startConnectionHeartbeat()

      window.addEventListener('scroll', this.scroll)
      window.addEventListener('dragover', this.dragover)
      window.addEventListener('drop', this.drop)
  },

  destroyed(){
      window.removeEventListener('scroll', this.scroll)
      window.removeEventListener('dragover', this.dragover)
      window.removeEventListener('drop', this.drop)
      if (this.connectionHeartbeatTimer)
          clearInterval(this.connectionHeartbeatTimer)
  },

  methods: {
      startConnectionHeartbeat(){
          this.checkConnectionHeartbeat()
          this.connectionHeartbeatTimer = setInterval(() => {
              this.checkConnectionHeartbeat()
          }, 5000)
      },

      async checkConnectionHeartbeat(){
          if (this.connectionHeartbeatRunning)
              return

          this.connectionHeartbeatRunning = true
          try {
              await Promise.all([
                  this.checkLocalServerHeartbeat(),
                  this.checkPlaystationHeartbeat(),
              ])
          }
          finally {
              this.connectionHeartbeatRunning = false
          }
      },

      async checkLocalServerHeartbeat(){
          if (!this.serverConfig.ip || !this.serverConfig.port) {
              this.serverOnline = false
              return
          }

          try {
              await this.$ps4.checkServer()
              this.serverOnline = true
          }
          catch (e) {
              this.serverOnline = false
          }
      },

      async checkPlaystationHeartbeat(){
          if (!this.ps4Config.ip) {
              this.playstationOnline = false
              return
          }

          try {
              if (this.isPS5)
                  await this.$ps5.checkPS5()
              else if (this.getPS4TargetApp == 'goldhen')
                  await this.$ps4_goldhen.checkPS4()
              else
                  await this.$ps4.checkPS4()

              this.playstationOnline = true
          }
          catch (e) {
              this.playstationOnline = false
          }
      },

      registerChannel(){
          ipcRenderer.on('main-route', (event, data) => {
              this.move(data)
          })
      },

      move(params){
         let from  = this.$route.fullPath
         let to    = this.$router.resolve(params).route.fullPath

         if(from === to) {
             return
         }

         this.$router.push(params)
         this.$refs.menu.activeIndex = params
      },

      handleSelect(val){
          console.log('Select View ', val)
          // this.$router.push({ name: val })
      },

      openLink(link){
          shell.openExternal(link)
      },

      closeApplicationRequest(){
          this.$confirm(this.$t('menu.closeConfirm'), this.$t('menu.closeTitle'), {
            confirmButtonText: this.$t('common.buttons.ok'),
            cancelButtonText: this.$t('common.buttons.cancel'),
            type: 'warning',
            center: true
          }).then(() => {
              ipcRenderer.send('quit')
          }).catch(() => {

          });
      },

      handleViewCallback(view){
          ipcRenderer.send('show', view)
      },

      scroll(e){
          this.scrollPosition = window.pageYOffset
      },

      scrollToTop(){
          window.scrollTo({
              top: 0,
              left: 0,
              behavior: 'smooth'
          })
      },

      async checkUpdate(){
          let release = await this.$git.getLatestRelease()
          if(!release) return

          this.$refs.LatestVersionInfo.open(release)
          this.newVersionAvailable = false
      },

      async autoCheckUpdate(){
          let release = await this.$git.getLatestRelease()
          if(!release) return

          // patch root app version for debug purpose
          // this.$root.versions.app = "2.7.3"

          let version = this.$git.getVersion(release)
          let current = this.$root.versions.app
          let compare = this.$git.compareVersion(current, version)
          // console.log("Autocheck for latest updates on startup", compare)

          if(compare == -1){
              this.newVersionAvailable = true
              this.$refs.LatestVersionInfo.open(release)
          }
          else {
              this.newVersionAvailable = false
          }
      },

      dragover(e){
        e.preventDefault();
        e.stopPropagation();

        this.showDragAndDropOverlay = true
        this.draggedFiles = []
      },

      drop(e){
        e.preventDefault();
        e.stopPropagation();

        let files = [];
        for (const f of event.dataTransfer.files) {
            // console.log('File Object of dragged files: ', f)

            if( f.path.includes('.pkg') ){
                files.push(f.path);
            }
            else {
                let filesInFolder = this.$fs.getFiles(f.path, true).filter( file => this.$fs.isPKG(file) )
                // console.log("Files in Folder", f.path, filesInFolder)
                files.push(...filesInFolder)
            }
        }

        if( files.length == 0 ){
            this.showDragAndDropOverlay = false
            this.draggedFiles = []
            this.$root.sendMain("No PKG Files found in the Drag and Drop")
            return
        }

        this.showDragAndDropOverlay = true
        this.draggedFiles = files
      },

  }
}
</script>

<style lang="scss" scoped>

.main_view.fixed_table_view {
    height: 100vh;
    overflow: hidden;
}

.connection_indicators {
    float: left;
    display: flex;
    align-items: center;
    height: 60px;
    margin-left: 18px;
}

.fa-server {
  font-size: 14px;
}
.connection_indicator + .connection_indicator {
    margin-left: 14px;
}

.connection_indicator {
    display: inline-flex;
    align-items: center;
    font-size: 16px !important;

    i {
        color: #f56c6c !important;
    }

    &.online i {
        color: #67c23a !important;
    }
}

.connection_dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #f56c6c;
    box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.16);
    margin-left: 6px;

    &.online {
        background: #67c23a;
        box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.16);
    }
}

</style>
