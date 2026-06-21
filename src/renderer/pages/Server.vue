<template>
  <div class="ServerView">

    <el-row style="margin-bottom: 20px">
      <el-button :type="$helper.is(tab == 'server', 'success active', '')" data-umami-event="tab.server" @click="$root.serverTab = 'server'"> Base Files</el-button>
      <el-button :type="$helper.is(tab == 'dragged', 'success active', '')" data-umami-event="tab.dragged" @click="$root.serverTab = 'dragged'"> Dragged Files</el-button>
      <el-button disabled> Upcoming Feature Files from Hosts!</el-button>
    </el-row>

    <el-row style="margin-bottom: 20px;">
      <el-col :span="20" style="display: flex">
        <el-button @click="reload" size="small" icon="el-icon-refresh-left" style="margin-right: 10px; height: 32px;" v-if="tab == 'server'"> Reload</el-button>

        <el-form class="base_path_input_form" v-if="$root.serverTab == 'server'">
          <el-form-item style="margin: 0px; width: 100%;">
            <el-input size="small" placeholder="Select your base path of your PKG's" v-model="server.base_path" disabled>
              <el-button size="mini" slot="append" icon="el-icon-edit" @click.native="enterManuallyBasePath"></el-button>
              <el-button size="mini" slot="append" icon="el-icon-folder" @click.native="selectBasePath"></el-button>
              <el-button size="mini" slot="append" icon="el-icon-plus" @click.native="addAllFilesToQueue"> Add all to Queue</el-button>
            </el-input>
          </el-form-item>
        </el-form>

        <el-button size="small" icon="el-icon-delete" @click.native="removeFilesFromDragged" v-if="tab == 'dragged'"> Remove all files</el-button>
        <el-button size="small" icon="el-icon-plus" @click.native="addAllFilesToQueue" v-if="tab == 'dragged'"> Add all to Queue</el-button>
      </el-col>
      <el-col :span="4">
        <el-input v-model="search" size="small" placeholder="Search" prefix-icon="fas fa-search"/>
      </el-col>
    </el-row>


    <el-table :data="files" v-loading="loading" class="file"
        element-loading-text="Loading Server files"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(255, 255, 255, 0.8)"
        :max-height="tableMaxHeight"
        style="width: 100%">
      <el-table-column type="index" label="#" width="55" align="center"></el-table-column>

      <el-table-column type="expand">
        <template slot-scope="scope">
          <div class="expand-section">
            <div class="expand-section-title">File Paths</div>
            <div class="expand-paths">
              <div class="expand-path-item">
                <span class="expand-label">File Name</span>
                <span class="expand-value expand-text">{{ scope.row.name }}</span>
              </div>
              <div class="expand-path-item">
                <span class="expand-label">Patched Name</span>
                <span class="expand-value expand-text">{{ scope.row.patchedFilename }}</span>
              </div>
              <div class="expand-path-item">
                <span class="expand-label">Path</span>
                <span class="expand-value expand-text">{{ scope.row.path }}</span>
              </div>
              <div class="expand-path-item">
                <span class="expand-label">PKG URL</span>
                <span class="expand-value expand-text">{{ scope.row.url }}</span>
              </div>
              <div class="expand-path-item">
                <span class="expand-label">Icon0 URL</span>
                <span class="expand-value expand-text">{{ scope.row.image }}</span>
              </div>
            </div>
          </div>

          <div class="expand-section expand-section-sfo" v-if="scope.row.sfo?.readSFOHeader">
            <div class="expand-section-title">SFO Information</div>
            <div class="expand-grid">
              <div class="expand-item" v-if="scope.row.sfo.TITLE">
                <span class="expand-label">Title</span>
                <span class="expand-value">{{ scope.row.sfo.TITLE }}</span>
              </div>
              <div class="expand-item" v-if="scope.row.sfo.VERSION">
                <span class="expand-label">Version</span>
                <el-tag size="mini" type="success">{{ scope.row.sfo.VERSION }}</el-tag>
              </div>
              <div class="expand-item" v-if="scope.row.sfo.CATEGORY">
                <span class="expand-label">Category</span>
                <el-tag size="mini" :type="$helper.getSfoCategoryLabel(scope.row.sfo.CATEGORY).color">
                  {{ $helper.getSfoCategoryLabel(scope.row.sfo.CATEGORY).label }}
                </el-tag>
              </div>
              <div class="expand-item" v-if="scope.row.sfo.CONTENT_ID">
                <span class="expand-label">Content ID</span>
                <el-tag size="mini" type="info">{{ scope.row.sfo.CONTENT_ID }}</el-tag>
              </div>
            </div>
          </div>

          <pre v-if="debugItemInRow" class="expand-debug">{{ scope.row }}</pre>
        </template>
      </el-table-column>

      <el-table-column label="Cover" width="100" v-if="sfoEnabled">
        <template slot-scope="scope">
          <div class='image' :style="{ backgroundImage: 'url('+scope.row.image+')' }"/>
        </template>
      </el-table-column>

      <el-table-column prop="name" label="Name" min-width="220">
        <template slot-scope="scope">
          <template v-if="scope.row.sfo?.readSFOHeader && scope.row.sfo.TITLE">
            <div class="sfo-title">
              <span class="sfo-title-name-tag">{{ scope.row.sfo.TITLE }}</span>
            </div>
            <div class="sfo-title">
              <!--              <el-tag size="mini" type="warning" class="sfo-title-id-tag" v-if="showCUSA && scope.row.cusa">{{ scope.row.cusa }}</el-tag>-->
              <span class="sfo-version-tag" v-if="scope.row.sfo.VERSION">[{{ scope.row.sfo.VERSION }}]</span>
              <span class="sfo-title-id-tag" v-if="scope.row.sfo.TITLE_ID">[{{ scope.row.sfo.TITLE_ID }}]</span>
            </div>
            <div class="sfo-subtitle">
              <span class="sfo-filename">{{ scope.row.name }}</span>
              <el-tag size="small" :type="$helper.getSfoCategoryLabel(scope.row.sfo.CATEGORY).color" class="sfo-category-tag" v-if="scope.row.sfo.CATEGORY">{{ $helper.getSfoCategoryLabel(scope.row.sfo.CATEGORY).label }}</el-tag>
              <el-tag size="small" type="info" class="sfo-contentid-tag"> {{ scope.row.sfo.CONTENT_ID }}</el-tag>
            </div>
          </template>
          <template v-else>
            <el-tag size="mini" type="warning" class="sfo-title-id-tag" v-if="showCUSA && scope.row.cusa">{{ scope.row.cusa }}</el-tag>
            {{ scope.row.name }}
            <small v-if="scope.row.sfo?.readSFOHeader">(v{{ scope.row.sfo.APP_VER }})</small>
          </template>
        </template>
      </el-table-column>

      <el-table-column label="Ext" width="100" v-if="showExtension">
        <template slot-scope="scope">
          <el-tag size="mini"
              :type="scope.row.ext === '.pkg' ? 'primary' : 'success'"
              disable-transitions>{{ scope.row.ext }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="status" label="Status" width="120" align="center">
        <template slot-scope="scope">
          <el-tag size="small" plain :type="$helper.getFileStatus(scope.row.status)">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="size" label="Size" width="120" align="right">
        <template slot-scope="scope">
          <el-tag size="small" plain :type="$helper.getFileSizeType(scope.row.size)">{{ scope.row.size }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Progress" width="100px" v-if="showPercentage">
        <template slot-scope="scope">
          <el-tag size="mini" v-if="0">n/a</el-tag>
          <el-progress :stroke-width="15" :percentage="scope.row.percentage" :text-inside="true" stroke-linecap="square"></el-progress>
        </template>
      </el-table-column>

      <el-table-column label="Operation" width="100" align="right">
        <template slot-scope="scope">
          <el-button circle size="small" icon="fa fa-minus" @click="removeFromQueue(scope.row)" v-if="scope.row.status == 'in queue'"/>
          <el-button circle size="small" icon="el-icon-plus" @click="addToQueue(scope.row)" v-if="scope.row.status != 'in queue'"/>
          <el-button circle size="small" icon="fa fa-cloud-download-alt" @click="check(scope.row.url)" v-if="tab == 'server'"/>
          <el-button circle size="small" icon="el-icon-delete" @click="removeFileFromDragged(scope.row)" v-if="tab == 'dragged'"/>
        </template>
      </el-table-column>
    </el-table>

    <template class='file_list' v-if="debug">
      <pre>{{ server.base_path }}</pre>
      <pre>{{ files }}</pre>
    </template>

  </div>
</template>

<script>
import fs from 'fs'
import path from 'path'
import {get, sync} from 'vuex-pathify'
import {remote, ipcRenderer} from 'electron'

import express from 'express'
import http from 'http'

export default {
  name: 'ServerList',

  data() {
    return {
      // files: [],
      debug: false,
      debugItemInRow: true,

      showExtension: false,
      showCUSA: true,
      showVersion: false,
      showPercentage: false,

      search: '',

      app: null,
      http: null,
      tableMaxHeight: 400,
    }
  },

  mounted() {
    // this.run()
    this.search = ''
    this.$nextTick(() => {
      this.calcTableMaxHeight()
    })
    window.addEventListener('resize', this.onResize)
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  },

  computed: {
    server: sync('app/server'),
    draggedFiles: get('server/draggedFiles'),
    draggedServingFiles: get('server/draggedServingFiles'),
    serverFiles: get('server/serverFiles'),
    servingFiles: get('server/servingFiles'),
    queueFiles: get('queue/queue'),
    routes: get('server/routes'),
    loading: get('server/loading'),
    sfoEnabled: get('app/getReadSFOHeader'),
    files() {
      let finalFiles = this.servingFiles

      if (this.tab == 'dragged')
        finalFiles = this.draggedServingFiles

      return finalFiles.filter(file => this.$helper.matchesFileSearch(file, this.search))
    },
    tab() {
      return this.$root.serverTab
    },
  },

  methods: {
    reload() {
      if (!this.server.base_path) {
        this.$message({
          type: 'warning',
          message: 'No server base path given. Please Configure first.'
        });
        return
      }

      console.log("Reload files at base path. Triggered though Server-List")
      // this.$store.dispatch('server/startLoading')
      // this.$store.dispatch('server/loadFiles', this.server.base_path)
      this.loadFiles()

      // this.$store.dispatch('server/stopLoading')
      // setTimeout( () => this.$store.dispatch('server/stopLoading'), 2000)
      // console.log(this.routes)
    },

    check(url) {
      this.$root.openWithAutoclose(url)
    },

    run() {
      this.$store.dispatch('server/resetLogs')

      setInterval(() => {
        let x = this.servingFiles[0]
        console.log("run test", x)
        x.percentage++

        this.$store.dispatch('server/addLog', 'just a test')
      }, 1000)
    },

    addToQueue(file) {
      let find = this.$store.getters['queue/isInQueueUnique'](file)

      if (!find) {
        file.status = 'in queue'
        this.$store.dispatch('queue/addToQueue', file)
        this.$root.track({name: 'addToQueue', data: {name: 'Added to Queue', value: file.name}})
      } else {
        if (file.status == 'serving')
          file.status = 'in queue'

        this.$message({
          message: file.name + ' is already in Queue',
          type: 'warning'
        })
      }
    },

    removeFromQueue(file, notify = true) {
      let servingFile = this.$store.getters['server/findFile'](file)

      if (servingFile && servingFile.status == 'in queue') {
        servingFile.status = 'serving'
        this.$store.dispatch('queue/removeFromQueue', file)
        this.$root.track({name: 'removeFromQueue', data: {name: 'Removed from Queue', value: file.name}})
      } else {
        if (notify)
          this.$message({
            message: "Can't remove " + file.name + " from queue because it's in another state",
            type: 'warning'
          })
      }
    },

    addAllFilesToQueue() {
      this.files.map(file => {
        if (!this.$store.getters['queue/isInQueue'](file))
          this.addToQueue(file)
      })

      this.$message({
        type: 'success',
        message: 'All Files has been added to the Queue'
      });
      this.$root.track({name: 'addAllFilesToQueue', data: {name: 'Add all files to the Queue'}})
    },

    enterManuallyBasePath() {
      this.$prompt('Please input base path', 'Base Path for the Server', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        // inputPattern: /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
        // inputErrorMessage: 'Invalid Email'
      }).then(({value}) => {
        if (value) {
          this.server.base_path = value
          this.$message({
            type: 'success',
            message: 'Your base_path has been set to:' + value
          });
          this.loadFiles()
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Input canceled'
        });
      });
    },

    async selectBasePath() {
      let path = await remote.dialog.showOpenDialog({properties: ['openDirectory']})

      if (path && !path.canceled) {
        // console.log("Path changed in Server Tab.")
        this.server.base_path = path.filePaths[0]
        this.$store.dispatch('app/setServer', this.server)
        this.loadFiles()
      }
    },

    loadFiles() {
      this.$store.dispatch('server/loadFiles', this.server.base_path)

      this.$message({
        type: 'success',
        message: 'Files has been reloaded'
      });
      this.$root.track({name: 'reload', data: {name: 'Reload Server files from base Path'}})
    },

    removeFilesFromDragged() {
      let leftFilesWithNoQueue = this.draggedServingFiles.filter(file => file.status != 'serving')
      this.$store.dispatch('server/setDraggedFiles', leftFilesWithNoQueue)

      this.$message({
        type: 'success',
        message: 'Not serving Files has been removed'
      });
      this.$root.track({name: 'removeFilesFromDragged', data: {name: 'Remove all dragged Items'}})
    },

    removeFileFromDragged(file) {
      let fileInQueue = this.$store.getters['queue/isInQueue'](file)

      if (fileInQueue) {
        const h = this.$createElement
        return this.$msgbox({
          title: "Remove File from List",
          message: h('div', null, [
            h('span', null, " "),
            h('br', null),
            h('b', null, file.name),
            h('br', null),
            h('span', null, 'is in the Queue'),
            h('br', null),
            h('span', null, 'Are you sure to remove the file?')
          ]),
          showCancelButton: true,
        })
            .then(_ => {
              this.removeFileFromDraggedHandler(file)
            })
            .catch(_ => {
            })
      }

      this.removeFileFromDraggedHandler(file)
    },

    removeFileFromDraggedHandler(file) {
      this.removeFromQueue(file, false)
      let cleaned = this.draggedServingFiles.filter(f => f.path != file.path)
      this.$store.dispatch('server/setDraggedFiles', cleaned)
      this.$root.track({
        name: 'removeFileFromDraggedHandler',
        data: {name: 'Remove dragged File from List', value: file.name}
      })
    },

    calcTableMaxHeight() {
      try {
        const table = this.$el.querySelector('.el-table')
        if (!table) {
          this.tableMaxHeight = Math.max(180, window.innerHeight - 250)
          return
        }
        const tableRect = table.getBoundingClientRect()
        const serverRect = this.$el.getBoundingClientRect()
        this.tableMaxHeight = Math.max(180, serverRect.bottom - tableRect.top - 20)
      } catch (e) {
        this.tableMaxHeight = 400
      }
    },

    onResize() {
      this.calcTableMaxHeight()
    },

  }
}
</script>

<style lang="scss" scoped>
.path_input_tag {
  margin-right: 10px;
  max-width: 100%;
  overflow: hidden;
}

.base_path_input_form {
  width: 100%;
  margin-right: 10px;
  margin-bottom: 0px;
}

.base_path_input_form .el-form-item__content {
  line-height: 1;
}

.ServerView {
  height: calc(100vh - 130px);
  overflow: hidden;

  .sfo-title {
    font-weight: 600;
    font-size: 14px;
    color: #303133;
    line-height: 1.3;
  }

  .sfo-version-tag {
    display: inline-block;
    background-color: #ecf5ff;
    color: #409eff;
    padding: 0 4px;
    border-radius: 3px;
    font-size: 12px;
  }

  .sfo-title-id-tag {
    display: inline-block;
    background-color: #ecf5ff;
    color: #1b7a60;
    padding: 0 4px;
    border-radius: 3px;
    font-size: 12px;
  }

  .sfo-subtitle {
    margin-top: 3px;
    font-size: 12px;
    color: #909399;
    line-height: 1.4;

    .sfo-filename {
      display: block;
      word-break: break-all;
    }

    .sfo-category-tag {
      margin-top: 2px;
      margin-right: 4px;
    }

    .sfo-contentid-tag {
      margin-top: 2px;
    }
  }

  /* 展开区域样式 */
  .expand-section {
    margin-bottom: 15px;
    padding: 10px 15px;
    background: #f5f7fa;
    border-radius: 4px;

    .expand-section-title {
      font-size: 12px;
      font-weight: 600;
      color: #606266;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }

  .expand-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px 16px;
  }

  .expand-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    min-width: 0;
    padding-left: 8px;
    border-left: 2px solid #dcdfe6;

    .expand-label {
      font-size: 10px;
      font-weight: 600;
      color: #909399;
      white-space: nowrap;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      min-width: 120px;
    }

    .expand-value {
      font-size: 12px;
      color: #303133;
      font-weight: 500;
      line-height: 1.35;
      word-break: break-all;
    }
  }

  .expand-paths {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .expand-path-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;

    .expand-label {
      font-size: 12px;
      color: #909399;
      flex-shrink: 0;
      min-width: 120px;
    }

    .expand-text {
      font-size: 12px;
      color: #606266;
      word-break: break-all;
      line-height: 1.4;
    }
  }

  .expand-debug {
    margin-top: 10px;
    padding: 10px;
    background: #2d2d2d;
    color: #abb2bf;
    border-radius: 4px;
    font-size: 11px;
    max-height: 300px;
    overflow: auto;
  }
}
</style>
