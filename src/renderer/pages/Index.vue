<template>
  <div class="ProcessView">
    <el-row style="margin-bottom: 20px;">
      <el-col :span="20">
        <el-dropdown @command="handleDropdownCommand" style="margin-right: 10px">
          <el-button size="small" icon="el-icon-refresh-left">
            {{ $t('queue.actions.resetOptions') }} <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item icon="el-icon-refresh-left" command="resetAll">{{ $t('queue.dropdown.resetAll') }}</el-dropdown-item>
            <el-dropdown-item icon="el-icon-refresh-left" command="resetInstalled">{{ $t('queue.dropdown.resetInstalled') }}</el-dropdown-item>
            <el-dropdown-item icon="el-icon-refresh-left" command="clearFinishedFiles">{{ $t('queue.dropdown.clearFinished') }}</el-dropdown-item>
            <el-dropdown-item icon="el-icon-delete" command="clearInstalledFiles">{{ $t('queue.dropdown.clearInstalled') }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

        <el-dropdown @command="handleDropdownCommand" style="margin-right: 10px">
          <el-button size="small" icon="el-icon-check">
            {{ $t('queue.actions.checkOptions') }} <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item icon="fa fa-server" command="checkHB">{{ $t('queue.dropdown.checkHb') }}</el-dropdown-item>
            <el-dropdown-item icon="fab fa-playstation" command="checkPS4">{{ $t('queue.dropdown.checkPs4') }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

        <el-button size="small" icon="el-icon-link" @click="openAddFileDialog" v-if="app.config.enableExternalLinks"> {{ $t('queue.actions.addUrl') }}</el-button>

        <el-button size="small" icon="el-icon-sync" :type="queueScanner ? 'success active' : ' active'" @click="toggleQueueScanner"> {{ $t('queue.actions.queueScanner') }}</el-button>
        <el-button size="small"
            :type="queueAutoRunning ? 'danger' : ''"
            :icon="queueAutoRunning ? 'fa fa-stop' : 'fa fa-play'"
            @click="toggleQueueAutostart"
            v-if="queueScanner">
          {{ queueAutoRunning ? $t('queue.actions.stop') : $t('queue.actions.autostart') }}
        </el-button>
        <el-checkbox v-model="skipInstalledQueueItems" v-if="queueScanner" style="margin-left: 10px"> {{ $t('queue.actions.skipInstalled') }}</el-checkbox>

        <span class="queue_stats">
          <el-tag size="small" type="info">{{ $t('queue.stats.total') }} {{ queueStats.total }}</el-tag>
          <el-tag size="small" type="success">{{ $t('queue.stats.installed') }} {{ queueStats.installed }}</el-tag>
          <el-tag size="small" type="danger">{{ $t('queue.stats.failed') }} {{ queueStats.failed }}</el-tag>
        </span>

        <el-button size="small" @click="test" v-if="false">Test</el-button>
      </el-col>
      <el-col :span="4">
        <el-input v-model="search" size="small" :placeholder="$t('common.placeholder.search')" prefix-icon="fas fa-search"/>
      </el-col>
    </el-row>


    <el-table :data="files" v-loading="loading" class="file"
        :element-loading-text="$t('server.messages.loadingFiles')"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(255, 255, 255, 0.8)"
        :empty-text="$t('common.table.noData')"
        :max-height="tableMaxHeight"
    style="width: 100%">

      <el-table-column type="index" label="#" width="55" align="center"></el-table-column>

      <el-table-column type="expand">
        <template slot-scope="scope">
          <!-- 状态信息区 -->
          <div class="expand-section">
            <div class="expand-section-title">{{ $t('queue.expand.statusInfo') }}</div>
            <div class="expand-grid">
              <div class="expand-item">
                <span class="expand-label">{{ $t('queue.expand.percent') }}</span>
                <el-tag size="mini" type="primary">{{ scope.row.percentage }}%</el-tag>
              </div>
              <div class="expand-item">
                <span class="expand-label">{{ $t('common.table.status') }}</span>
                <el-tag size="mini" :type="$helper.getFileStatus(scope.row.status)">{{ $t('queue.status.' + scope.row.status) || scope.row.status }}</el-tag>
              </div>
              <div class="expand-item">
                <span class="expand-label">{{ $t('queue.expand.type') }}</span>
                <span class="expand-value">{{ scope.row.type || '-' }}</span>
              </div>
              <div class="expand-item">
                <span class="expand-label">{{ $t('queue.expand.task') }}</span>
                <span class="expand-value">{{ scope.row.task || '-' }}</span>
              </div>
              <div class="expand-item" v-if="scope.row.cusa">
                <span class="expand-label">{{ $t('queue.expand.cusa') }}</span>
                <span class="expand-value">{{ scope.row.cusa }}</span>
              </div>
              <div class="expand-item">
                <span class="expand-label">{{ $t('common.table.size') }}</span>
                <span class="expand-value">{{ scope.row.size || '-' }}</span>
              </div>
              <div class="expand-item">
                <span class="expand-label">{{ $t('queue.expand.logs') }}</span>
                <span class="expand-value">{{ scope.row.logs ? scope.row.logs.length : 0 }}</span>
              </div>
            </div>
          </div>

          <!-- 文件信息区 -->
          <div class="expand-section" v-if="scope.row.sfo?.readSFOHeader">
            <div class="expand-section-title">{{ $t('queue.expand.sfoInfo') }}</div>
            <div class="expand-grid">
              <div class="expand-item" v-if="scope.row.sfo.TITLE">
                <span class="expand-label">{{ $t('queue.expand.title') }}</span>
                <span class="expand-value">{{ scope.row.sfo.TITLE }}</span>
              </div>
              <div class="expand-item" v-if="scope.row.sfo.VERSION">
                <span class="expand-label">{{ $t('queue.expand.version') }}</span>
                <span class="expand-value">{{ scope.row.sfo.VERSION }}</span>
              </div>
              <div class="expand-item" v-if="scope.row.sfo.CATEGORY">
                <span class="expand-label">{{ $t('queue.expand.category') }}</span>
                <el-tag size="small" :type="$helper.getSfoCategoryLabel(scope.row.sfo.CATEGORY).color">
                  {{ $helper.getSfoCategoryLabel(scope.row.sfo.CATEGORY).label }}
                </el-tag>
              </div>
              <div class="expand-item" v-if="scope.row.sfo.CONTENT_ID">
                <span class="expand-label">{{ $t('queue.expand.contentId') }}</span>
                <span class="expand-value">{{ scope.row.sfo.CONTENT_ID }}</span>
              </div>
            </div>
          </div>

          <!-- 路径信息区 -->
          <div class="expand-section">
            <div class="expand-section-title">{{ $t('queue.expand.filePaths') }}</div>
            <div class="expand-paths">
              <div class="expand-path-item">
                <span class="expand-label">{{ $t('queue.expand.fileName') }}</span>
                <span class="expand-value expand-text">{{ scope.row.name }}</span>
              </div>
              <div class="expand-path-item">
                <span class="expand-label">{{ $t('queue.expand.patchedName') }}</span>
                <span class="expand-value expand-text">{{ scope.row.patchedFilename || '-' }}</span>
              </div>
              <div class="expand-path-item">
                <span class="expand-label">{{ $t('queue.expand.path') }}</span>
                <span class="expand-value expand-text">{{ scope.row.path || '-' }}</span>
              </div>
              <div class="expand-path-item">
                <span class="expand-label">{{ $t('queue.expand.pkgUrl') }}</span>
                <span class="expand-value expand-text">{{ scope.row.url || '-' }}</span>
              </div>
              <div class="expand-path-item">
                <span class="expand-label">{{ $t('queue.expand.icon0Url') }}</span>
                <span class="expand-value expand-text">{{ scope.row.image || '-' }}</span>
              </div>
            </div>
          </div>

          <!-- 调试信息 -->
          <pre v-if="showDebugInRow" class="expand-debug">{{ scope.row }}</pre>
        </template>
      </el-table-column>

      <el-table-column :label="$t('common.table.cover')" width="100" v-if="sfoEnabled">
        <template slot-scope="scope">
          <div class='image' :style="{ backgroundImage: 'url('+scope.row.image+')' }"/>
        </template>
      </el-table-column>

      <el-table-column prop="name" :label="$t('common.table.name')" min-width="220">
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

      <el-table-column :label="$t('common.table.ext')" width="100" v-if="showExtension">
        <template slot-scope="scope">
          <el-tag size="mini"
              :type="scope.row.ext === '.pkg' ? 'primary' : 'success'"
              disable-transitions>{{ scope.row.ext }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="task" :label="$t('common.table.task')" width="105" v-if="showTask && !isPS5"></el-table-column>
      <el-table-column :label="$t('common.table.version')" width="90" v-if="showVersion">
        <template slot-scope="scope">
          <el-tag size="small" type="info" v-if="scope.row.sfo?.VERSION">{{ scope.row.sfo.VERSION }}</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column prop="status" :label="$t('common.table.status')" width="140" align="center">
        <template slot-scope="scope">
          <span class="status-tags" v-if="scope.row.status == 'installedSkipped' || scope.row.status == 'installed + skipped'">
            <el-tag size="mini" plain type="success">{{ $t('queue.status.installedSkipped') }}</el-tag>
            <el-tag size="mini" plain type="info">{{ $t('queue.status.skipped') }}</el-tag>
          </span>
          <el-tag v-else size="small" plain :type="$helper.getFileStatus(scope.row.status)">
            <i class="el-icon-loading" v-if="scope.row.status == 'installing'"/> {{ $t('queue.status.' + scope.row.status) || scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="size" :label="$t('common.table.size')" width="120" align="right">
        <template slot-scope="scope">
          <el-tag size="small" plain :type="$helper.getFileSizeType(scope.row.size)">{{ scope.row.size }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column :label="$t('common.table.progress')" width="140" align="center" v-if="showPercentage">
        <template slot-scope="scope">
          <div class="progress-display">
            <el-progress :stroke-width="25" :percentage="scope.row.percentage" :show-text="false" stroke-linecap="square"></el-progress>
            <span class="progress-percentage">{{ scope.row.percentage }}%</span>
          </div>
          <div class="progress-meta" v-if="scope.row.rest && scope.row.rest != 0">
            <span>{{ $helper.secondsToString(scope.row.rest) }}</span>
            <span v-if="scope.row.percentage > 0 && scope.row.sizeInBytes">
                    ~{{ $helper.formatSpeed(scope.row.sizeInBytes, scope.row.percentage, scope.row.rest) }}
                </span>
          </div>
        </template>
      </el-table-column>

      <el-table-column :label="$t('common.table.operation')" width="150" align="right">
        <template slot-scope="scope">
          <el-button circle size="small" icon="fa fa-minus" @click="removeFromQueue(scope.row)"/>

          <el-button circle size="small" icon="fa fa-info" @click="info(scope.row)" v-if="false"></el-button>
          <el-button circle size="small" icon="fa fa-stop" @click="stop(scope.row)" v-if="false"></el-button>
          <el-button circle size="small" icon="fa fa-play" v-if="scope.row.status != 'installing' && !(isSingleDPI && scope.row.status == 'error')" @click="start(scope.row)"></el-button>
          <el-button circle size="small" type="danger" icon="el-icon-refresh-right"
              :title="$t('queue.operation.retryFailed')"
              v-if="isSingleDPI && scope.row.status == 'error'"
              @click="retryFailedInstall(scope.row)"></el-button>
          <el-button circle size="small" icon="fa fa-pause" v-if="scope.row.status == 'installing'" @click="pause(scope.row)"></el-button>

          <el-button circle size="small" icon="fab fa-playstation" @click="isInstalled(scope.row)"/>

          <el-button circle size="small" icon="fa fa-check" v-if="scope.row.status == 'finished' && scope.row.status == 'serving' && scope.row.status == 'installing'"/>
        </template>
      </el-table-column>
    </el-table>

    <AddFileByURLDialog ref="AddFileByURLDialog"/>
    <mainComponents v-if="false"/>

    <pre v-if="debug">{{ queue }}</pre>
  </div>
</template>

<script>
import {get, sync} from 'vuex-pathify'
import JSON5 from 'json5'
import i18n from '@/plugins/i18n'

export default {
  name: 'Index',

  data() {
    return {
      debug: false,

      loading: false,
      showTask: true,
      showCUSA: false,
      showVersion: false,
      showPercentage: true,
      showExtension: false,
      showDebugInRow: false,
      ints: [],
      queueAutoRunning: false,
      queueSkippedInstalledCount: 0,
      queueNextTimer: null,
      search: '',
      tableMaxHeight: 400,
    }
  },

  mounted() {
    this.search = ''
    // Migrate old status values to new ones
    this.queueFiles.forEach(file => {
      if (file.status === 'installed + skipped') {
        file.status = 'installedSkipped'
      }
    })
    this.$nextTick(() => {
      this.calcTableMaxHeight()
    })
    window.addEventListener('resize', this.onResize)
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  },

  computed: {
    app: get('app'),
    server: get('app/server'),
    queue: get('queue'),
    logs: get('queue/logs'),
    tasks: get('queue/tasks'),
    draggedServingFiles: sync('server/draggedServingFiles'),
    servingFiles: sync('server/servingFiles'),
    queueFiles: get('queue/queue'),
    installedFiles: sync('queue/installed'),
    ps4ip: get('app/getPS4IP'),
    updateInterval: get('app/ps4.update'),
    singleDPIQueueMode: get('app/ps4.singleDPI_queue_mode'),
    singleDPIQueueDelaySeconds: get('app/ps4.singleDPI_queue_delay_seconds'),
    queueScanner: get('app/server.enableQueueScanner'),
    skipInstalledQueueItems: sync('app/server.skipInstalledQueueItems'),
    notify: get('app/config.enableSystemNotifications'),
    isPS5: get('app/isPS5'),
    isSingleDPI: get('app/isSingleDPI'),
    sfoEnabled: get('app/getReadSFOHeader'),
    getPS4TargetApp: get('app/getPS4TargetApp'),
    files() {
      return this.queueFiles.filter(file => this.$helper.matchesFileSearch(file, this.search))
    },
    queueStats() {
      const installedKeys = new Set(this.installedFiles.map(file => file.path || file.name))
      const installed = this.queueFiles.filter(file => {
        const status = String(file.status || '')
        return installedKeys.has(file.path || file.name) ||
            status == 'finish' || status.startsWith('installed')
      }).length
      const failed = this.queueFiles.filter(file => file.status == 'error').length

      return {
        total: this.queueFiles.length,
        installed,
        failed,
      }
    },
    finishedFiles() {
      return this.queueFiles.filter(file => ['finish', 'Sent to PS5'].includes(file.status))
    }
  },

  methods: {
    checkHB() {
      this.$ps4.checkServer().then(({data}) => {
        this.$message({message: data.message, type: 'success'})
      })
          .catch(e => {
            this.$message({
              message: this.$t('messages.connection.serverNotWorking'),
              type: 'error'
            })
          })
    },

    async checkPS4() {
      // ps5 check
      if (this.isPS5)
        return await this.$ps5.checkPS5()
            .then(() => {
              this.log(this.$t('messages.connection.ps5CheckAccessible'))
              this.$message({message: this.$t('messages.connection.ps5CheckAccessible'), type: 'success'})
            })
            .catch(e => {
              console.log(e)
              this.log(e)
              this.$message({message: this.$t('messages.connection.ps5CheckNotAccessible'), type: 'error'})
            })


      // backwardscompatibility for ps4
      this.$ps4.checkPS4()
          .then((res) => {
            this.log(this.$t('messages.connection.ps4Accessible'), {status: res.status, statusText: res.statusText})
            this.$message({message: this.$t('messages.connection.ps4CheckAccessible'), type: 'success'})
          })
          .catch(e => {
            this.log(this.$t('messages.connection.ps4CheckNotAccessible'), e)
            this.$message({message: this.$t('messages.connection.ps4NotAccessible'), type: 'error'})
          })
    },

    test() {
      if (this.notify)
        this.sendNotification({title: this.$t('messages.notifications.test'), body: this.$t('messages.notifications.testBody')})
    },

    isInstalled(file, {silent = false} = {}) {
      if (this.isSingleDPI) {
        return this.$ps5.isInstalled(file)
            .then(data => {
              if (!data || data.res !== 0)
                throw new Error(data && data.error ? data.error : this.$t('errors.invalidSingleDpiResponse'))

              const exists = data.exists === true || data.exists === 1 || data.exists === 'true'
              if (exists)
                file.status = 'installed'

              const message = exists
                  ? this.$t('messages.install.alreadyInstalled')
                  : this.$t('messages.install.notInstalled')
              const type = exists ? 'warning' : 'success'
              this.log(message, data)
              if (!silent)
                this.$message({message, type})

              return exists
            })
            .catch(e => {
              console.log(e)
              this.log(file.name + ' ' + this.$t('errors.detectionFailed'), e, 'error')
              if (!silent)
                this.$message({message: e.message || String(e), type: 'error'})
              return false
            })
      }

      if (this.isPS5) {
        if (!silent)
          this.$message({message: this.$t('messages.install.notImplementedPs5'), type: "info"})
        return Promise.resolve(false)
      }

      return this.$ps4.isInstalled(file)
          .then(({data}) => {
            if (data.exists == true)
              file.status = 'installed'

            let {exists, size, type} = data
            this.log(data.message, {exists, size, type})
            if (!silent)
              this.$message({message: data.message, type: data.type})

            return Boolean(data.exists)
          })
          .catch(e => {
            this.clearInterval(file)
            console.log(e)
            this.log(file.name + ' ' + this.$t('errors.detectionFailed'), e, 'error')
            return false
          })
    },

    async start(file) {
      // ps5 version
      if (this.isPS5) {
        this.log(file.name + ' install request')

        return await this.$ps5.install(file)
            .then((data) => {
              // this.$message({ message: file.name + ' send to PS5', file, type: "info" })
              console.log(data)
              this.log(data)

              // validate install response
              if (data && Object.prototype.hasOwnProperty.call(data, 'res')) {
                let code = parseInt(data.res)

                // success
                if (code == 0) {
                  if (this.isSingleDPI) {
                    this.setStatus(file, 'installing')

                    if (data.content_id) {
                      this.setTask(file, data.content_id)
                      this.startInterval(file)
                    }
                  } else {
                    this.setStatus(file, "Sent to PS5")
                  }

                  this.log(file.name + ' install request successfull', file.url)
                  return this.$message({
                    dangerouslyUseHTMLString: true,
                    message: this.$t('messages.install.requestSuccess', { filename: file.name }),
                    type: "success"
                  })
                }

                if (this.isSingleDPI) {
                  this.clearInterval(file)
                  this.setStatus(file, 'error')
                }

                if (code == -2135809020) {
                  this.log(file.name + ' file at URL not found', file.url)
                  return this.$message({
                    dangerouslyUseHTMLString: true,
                    message: this.$t('messages.install.pkgNotFound', { code: code, filename: file.name }),
                    type: "error"
                  })
                }

                // something else, maybe in queue, maybe full storage, maybe whatever
                this.$message({
                  dangerouslyUseHTMLString: true,
                  message: this.$t('messages.install.unknownResponseForPs5', { code: data.res, filename: file.name }),
                  type: "info"
                })
              } else {
                if (this.isSingleDPI) {
                  this.clearInterval(file)
                  this.setStatus(file, 'error')
                }
                this.$message({message: this.$t('messages.install.unknownResponse'), type: "warning"})
              }
            })
            .catch(e => {
              console.log(e)
              this.log(e)
              this.clearInterval(file)
              this.setStatus(file, 'error')
              this.$message({message: e.message || String(e), type: 'error'})
            })
      }

      // ps4 simple goldhen
      if (this.getPS4TargetApp == 'goldhen') {
        console.log("GoldHEN Install request")
        return this.$ps4_goldhen.install(file)
            .then(data => {
              console.log("GodlHEN Request Done. Check response")
              console.log(data)
              this.log(data)
            })
            .catch(e => {
              console.error("GoldHEN Error")
              console.log(e)
              this.setStatus(file, 'error')
              this.log(`${file.name} GoldHEN install failed`, e, 'error')
              this.$message({message: e.message || String(e), type: 'error'})
            })
      }

      // ps4 version
      if (file.task && ['pause', 'stop'].includes(file.status)) {
        console.log(file.name + ' found task id ' + file.task)
        return this.resume(file)
      }

      this.log(file.name + ' prepare start installing', file)

      this.clearInterval(file)

      this.log("Install Request", {type: 'direct', packages: [file.url]})

      await this.$ps4.install(file)
          .then(({data}) => {
            this.log(file.name + ' install', data)

            // let example =   {
            //   "status": "success",
            //   "task_id": 268435806,
            //   "title": "Tin & Kuna"
            // }

            if (data.status == 'success') {
              this.$store.dispatch('queue/addTask', data)

              this.setTask(file, data.task_id)
              this.setStatus(file, 'installing')
              this.sendNotification({title: this.$t('messages.notifications.installing'), body: file.name + " " + this.$t('messages.notifications.installingBody').replace('{filename}', '')})
              this.startInterval(file)
              this.$root.track({name: 'install.success', data: {name: 'Install Request success', value: file.name}})

              this.log(file.name + ' has been started installing with Task ID ' + data.task_id, data)
            } else {
              console.log(file.name + " error on install", data)
              this.log(file.name + " error on install", data)
              this.setStatus(file, 'error')
              this.$message({message: this.$t('messages.install.requestFailed', { filename: file.name }), type: 'error'})
              this.$root.track({name: 'install.error', data: {name: 'Install Request failed', value: file.name}})
              // 2157510677 error on double install?
              // 2157510663 already installed?
              // 2157510681 task doesn't exist
            }

          })
          .catch(e => {
            this.clearInterval(file)
            console.log(e)
            this.log("Install error", e, 'error')

            if (e.status == 'fail' && e.error_code && this.handleStartInstallError(file, e))
              return

            this.setStatus(file, 'error')
            this.$message({message: e.message || String(e), type: 'error'})
          })
    },

    async retryFailedInstall(file) {
      this.clearInterval(file)
      this.setTask(file, '')
      file.percentage = 0
      file.rest = 0
      this.setStatus(file, 'in queue')
      this.log(file.name + ' retry failed singleDPI installation')
      await this.start(file)
    },

    stop(file) {
      console.log(file.name + ' stop')

      this.clearInterval(file)

      this.$ps4.stop(file)
          .then(({data}) => {
            console.log("Stop ", data)
            this.setStatus(file, 'stop')
            this.log(file.name + ' stop Task ID ' + file.task, data)
          })
          .catch(e => {
            this.clearInterval(file)
            console.log(e)
          })
    },

    pause(file) {
      console.log(file.name + ' pause')

      this.clearInterval(file)

      this.$ps4.stop(file)
          .then(({data}) => {
            console.log("pause ", data)
            this.setStatus(file, 'pause')
            this.log(file.name + ' pause', data)
          })
          .catch(e => {
            this.clearInterval(file)
            console.log(e)
          })
    },

    resume(file) {
      console.log(file.name + ' continue task id ' + file.task)

      this.clearInterval(file)

      this.$ps4.resume(file)
          .then(({data}) => {
            if (data.status == 'success') {
              console.log("resume ", data)
              this.setStatus(file, 'installing')
              this.startInterval(file)

              this.log(file.name + ' resume Task ID ' + file.task, data)
            }
          })
          .catch(e => {
            this.clearInterval(file)
            console.log(e)
          })
    },

    remove(file) {
      console.log(file.name + ' remove ')

      this.clearInterval(file)

      this.$ps4.remove(file)
          .then(({data}) => {
            console.log(data)
            this.log(file.name + ' remove', data)
          })
          .catch(e => {
            this.clearInterval(file)
            console.log(e)
          })
    },

    info(file) {
      if (this.isSingleDPI) {
        // A final status response can overlap with another in-flight poll.
        // Once a task is finalized, ignore late responses so the queue is
        // advanced exactly once.
        if (['finish', 'installed'].includes(file.status))
          return

        return this.$ps5.status(file.task)
            .then(data => {
              if (!data || data.res !== 0) {
                this.log(file.name + ' singleDPI status failed', data)
                return
              }

              const downloadProgress = Number(data.progress || 0)
              const promoteProgress = Number(data.promote_progress || 0)
              const progress = data.status == 'promoting'
                  ? promoteProgress
                  : downloadProgress

              file.percentage = Math.max(0, Math.min(100, Math.round(progress)))
              file.rest = Number(data.remain_time || 0)
              file.status = data.status || 'installing'
              file.logs.unshift(data)

              if (Number(data.error_code || 0) !== 0) {
                this.clearInterval(file)
                file.status = 'error'
                this.log(file.name + ' singleDPI install error', data)
                return
              }

              if (['playable', 'completed', 'installed'].includes(data.status)) {
                this.clearInterval(file)
                file.percentage = 100
                file.rest = 0
                this.setStatus(file, 'finish')
                this.fileInstalled(file, 'installed')
                this.log(file.name + ' finished', data)
                return
              }

              this.log(file.name + ' singleDPI status', data)
            })
            .catch(e => {
              this.clearInterval(file)
              this.log(file.name + ' singleDPI status request failed', e)
              console.log(e)
            })
      }

      this.$ps4.getTask(file)
          .then(({data}) => {
            console.log(file.name + " get task info ", data)

            // let example = {
            //   "status": "success",
            //   "bits": 394,
            //   "error": 0,
            //   "length": 2667446272,
            //   "transferred": 236060672,
            //   "length_total": 2667446272,
            //   "transferred_total": 236060672,
            //   "num_index": 1,
            //   "num_total": 1,
            //   "rest_sec": 1116,
            //   "rest_sec_total": 1116,
            //   "preparing_percent": 100,
            //   "local_copy_percent": 0
            // }

            if (data.status && data.status == 'success') {
              let length = Math.round(parseInt(data.length))
              let done = Math.round(parseInt(data.transferred))
              let onePercent = 100 / length
              let percent = Math.round(done * onePercent)
              // console.log("percent", length, done, onePercent, percent)
              let isWorking = data.length != data.transferred
              let haveRestTime = data.rest_sec_total != 0

              // check if we are in prepare state
              if (data.preparing_percent != 100 && data.local_copy_percent != 100 && data.transferred == 0 && data.length == 0) {
                this.log(file.name + ' ps4 is still preparing ' + data.preparing_percent + '%', data)
                return
              }

              if (data.length == 0 && data.transferred == 0) {
                this.log(file.name + ' ps4 prepared but still doing some work', data)
                return
              }

              if (isWorking && percent < 100 && haveRestTime) {
                file.percentage = percent
                file.rest = data.rest_sec_total
                this.log(file.name + ' info', data)
              } else {
                this.clearInterval(file)
                file.percentage = 100
                file.rest = 0
                this.setStatus(file, 'finish')
                this.fileInstalled(file, 'installed')

                this.log(file.name + ' finished', data)
              }

              file.logs.unshift(data)
            } else {
              console.log("Task Info Fail", data)
              this.log(file.name + ' Info fail', data)
              this.clearInterval(file)
            }

          })
          .catch(e => {
            this.clearInterval(file)
            console.log(e)
          })

      // this.log(file.name + ' info')
    },

    find(file) {
      if (this.isPS5) {
        this.$message({message: "'Find file' is not implemented for PS5 yet", type: "info"})
        return
      }

      this.$ps4.find(file)
          .then(({data}) => {
            this.log(file.name + ' find', data)
          })
          .catch(e => {
            this.clearInterval(file)
            console.log(e)
          })
    },

    startInterval(file) {
      this.clearInterval(file)
      this.ints[file.patchedFilename] = setInterval(() => {
        // console.log(file.name + ' ' + file.percentage)
        this.info(file)
      }, this.updateInterval)
    },

    haveInterval(file) {
      if (this.ints[file.patchedFilename])
        return this.ints[file.patchedFilename]

      return false
    },

    clearInterval(file) {
      clearInterval(this.ints[file.patchedFilename])
      delete this.ints[file.patchedFilename]
    },

    setStatus(file, status) {
      this.$store.dispatch('queue/status', {file, status})
    },

    setTask(file, id) {
      this.$store.dispatch('queue/task', {file, id})
    },

    log(msg = '', data = {}, type = 'log') {
      // this.$store.dispatch('queue/addLog', a)
      this.$root.sendPS4({time: Date.now(), msg, data, type})
    },

    sendNotification(data) {
      if (this.notify)
        this.$root.notify(data)
    },

    fileInstalled(file, status = 'installed') {
      let servingFile = this.$store.getters['server/findFile'](file)
      if (servingFile) {
        servingFile.status = status
      }

      this.setTask(file, '')
      this.sendNotification({title: i18n.t('messages.notifications.finished'), body: file.name + " " + i18n.t('messages.notifications.finishedBody').replace('{filename}', '')})
      this.$store.dispatch('queue/installed', file)
      this.$root.track({name: 'installed', data: {name: 'File installed', value: file.name}})


      // queue scanner hook
      if (this.queueScanner && this.queueAutoRunning)
        this.scheduleQueueScannerNextItem()
    },

    scheduleQueueScannerNextItem() {
      if (!this.queueAutoRunning)
        return

      if (this.queueNextTimer) {
        clearTimeout(this.queueNextTimer)
        this.queueNextTimer = null
      }

      // Do not wait after the final item just to report an empty queue.
      if (!this.queueFiles.some(file => this.isQueueInstallCandidate(file))) {
        this.handleQueueScannerNextItem()
        return
      }

      const configuredDelay = this.singleDPIQueueMode == 'delay'
          ? Number(this.singleDPIQueueDelaySeconds || 0)
          : 0
      const delaySeconds = Math.max(0, Math.min(3600, configuredDelay))

      if (!this.isSingleDPI || delaySeconds == 0) {
        this.handleQueueScannerNextItem()
        return
      }

      this.$message({
        type: 'info',
        message: this.$t('queue.messages.nextQueueDelay', { seconds: delaySeconds })
      })

      this.queueNextTimer = setTimeout(() => {
        this.queueNextTimer = null
        if (this.queueScanner && this.queueAutoRunning)
          this.handleQueueScannerNextItem()
      }, delaySeconds * 1000)
    },

    getRandomInt(max) {
      return Math.floor(Math.random() * max);
    },

    isQueueInstallCandidate(file) {
      if (file.status == 'in queue')
        return true

      return !this.skipInstalledQueueItems &&
          file.status && file.status.startsWith('installed')
    },

    markQueueItemInstalledAndSkipped(file) {
      const status = 'installedSkipped'
      const servingFile = this.$store.getters['server/findFile'](file)

      this.$store.dispatch('queue/installed', file)
      this.setStatus(file, status)
      if (servingFile)
        servingFile.status = status

      this.log(file.name + ' is already installed and was skipped')
      this.$root.track({
        name: 'QueueScanner.skipInstalled',
        data: {name: 'QueueScanner skipped installed item', value: file.name}
      })
    },

    resetAll() {
      this.$confirm(this.$t('queue.messages.resetAllConfirm'), this.$t('queue.dropdown.resetAll'),
          {
            confirmButtonText: this.$t('common.buttons.ok'),
            cancelButtonText: this.$t('common.buttons.cancel'),
            type: 'warning',
            center: true,
          })
          .then(() => {
            this.stopQueueAutostart(false)
            this.ints.map(i => clearInterval(i))
            this.servingFiles.map(file => file.status = 'serving')
            this.draggedServingFiles.map(file => file.status = 'serving')

            this.$store.dispatch('queue/resetAll')
            this.$root.track({name: 'resetAll', data: {name: 'Processing Center reset'}})

            this.$message({
              type: 'success',
              message: this.$t('queue.messages.resetAllSuccess')
            });
          })
          .catch(() => {
          });
    },

    resetInstalled() {
      const getFileKey = file => file.path || file.name
      const installedKeys = new Set(this.installedFiles.map(getFileKey))
      const isInstalledFile = file => {
        const status = String(file.status || '')
        return installedKeys.has(getFileKey(file)) ||
            status == 'finish' || status == 'Sent to PS5' || status.startsWith('installed')
      }
      const filesToReset = this.queueFiles.filter(isInstalledFile)
      const resetKeys = new Set(filesToReset.map(getFileKey))

      filesToReset.forEach(file => {
        this.clearInterval(file)
        file.status = 'in queue'
        file.task = ''
        file.percentage = 0
        file.rest = 0
      })

      this.servingFiles
          .filter(file => resetKeys.has(getFileKey(file)))
          .forEach(file => file.status = 'in queue')

      this.draggedServingFiles
          .filter(file => resetKeys.has(getFileKey(file)))
          .forEach(file => file.status = 'in queue')

      this.$store.dispatch('queue/setInstalled', [])
      this.$root.track({name: 'resetInstalled', data: {name: 'Reset installed Files'}})
      this.$message({
        type: 'success',
        message: this.$t('queue.messages.resetInstalledSuccess', { count: filesToReset.length })
      })
    },

    clearFinishedFiles() {
      this.finishedFiles.map(file => this.removeFromQueue(file))
      this.$root.track({name: 'clearFinishedFiles', data: {name: 'Clear finished Files'}})
    },

    clearInstalledFiles() {
      this.queueFiles
          .filter(file => file.status && file.status.startsWith('installed'))
          .map(file => this.removeFromQueue(file))
      this.$root.track({name: 'clearInstalledFiles', data: {name: 'Clear installed Files'}})
    },

    removeFromQueue(file) {
      this.clearInterval(file)
      let servingFile = this.$store.getters['server/findFile'](file)

      if (servingFile && servingFile.status == 'in queue') {
        servingFile.status = 'serving'
      }

      if (file.task) {
        this.stop(file)
      }

      this.$store.dispatch('queue/removeFromQueue', file)
      this.$root.track({name: 'removeFromQueue', data: {name: 'Removed from Queue', value: file.name}})
    },

    openAddFileDialog() {
      this.$refs.AddFileByURLDialog.show = true
    },

    handleDropdownCommand(cmd) {
      this[cmd]()
    },

    toggleQueueScanner() {
      const wasEnabled = this.queueScanner
      this.$store.dispatch('app/toggleQueueScanner')

      if (wasEnabled)
        this.stopQueueAutostart(false)

      this.$root.track({name: 'QueueScanner.toggle', data: {name: 'Toggle QueueScanner', value: this.queueScanner}})
    },

    toggleQueueAutostart() {
      if (this.queueAutoRunning) {
        this.stopQueueAutostart()
        return
      }

      this.queueAutoRunning = true
      this.queueSkippedInstalledCount = 0
      this.handleQueueScannerNextItem()
    },

    stopQueueAutostart(notify = true) {
      this.queueAutoRunning = false
      if (this.queueNextTimer) {
        clearTimeout(this.queueNextTimer)
        this.queueNextTimer = null
      }

      if (notify)
        this.$message({type: 'error', message: this.$t('queue.messages.autostartStopped')})
    },

    async handleQueueScannerNextItem() {
      if (!this.queueAutoRunning)
        return

      // Clicking Autostart during a configured delay means "start now".
      if (this.queueNextTimer) {
        clearTimeout(this.queueNextTimer)
        this.queueNextTimer = null
      }

      let findNextFile = this.queueFiles.filter(file => this.isQueueInstallCandidate(file))
      console.log(findNextFile, findNextFile.length)

      // no items
      if (findNextFile.length == 0) {
        this.queueAutoRunning = false
        const skippedCount = this.queueSkippedInstalledCount
        return this.$message({
          type: 'success',
          message: skippedCount > 0
              ? this.$t('queue.messages.queueCompletedSkipped', { count: skippedCount })
              : this.$t('queue.messages.queueNoItems')
        });
      }

      // Legacy etaHEN has no task progress API, so retain its bulk mode.
      // singleDPI reports completion and must advance strictly one item at
      // a time through fileInstalled(). Mixing both paths duplicates jobs.
      if (this.isPS5 && !this.isSingleDPI)
        return await this.handleQueueScannerNextItemPS5(findNextFile)

      while (findNextFile.length > 0) {
        const file = findNextFile[0]

        if (this.skipInstalledQueueItems) {
          const installed = await this.isInstalled(file, {silent: true})
          if (!this.queueAutoRunning)
            return

          if (installed) {
            this.markQueueItemInstalledAndSkipped(file)
            this.queueSkippedInstalledCount++
            findNextFile = this.queueFiles.filter(item => this.isQueueInstallCandidate(item))
            continue
          }
        }

        this.$message({
          dangerouslyUseHTMLString: true,
          type: 'success',
          message: this.$t('queue.messages.foundNextFile', { filename: file.name }),
        });
        this.$root.track({
          name: 'QueueScanner.next',
          data: {name: 'QueueScanner handle next item in List', value: file.name}
        })
        await this.start(file)
        return
      }

      this.queueAutoRunning = false
      if (this.queueSkippedInstalledCount > 0)
        this.$message({
          type: 'success',
          message: this.$t('queue.messages.queueCompletedSkipped', { count: this.queueSkippedInstalledCount })
        })
    },

    async handleQueueScannerNextItemPS5(files = []) {
      this.$confirm(
          i18n.t('messages.queue.bulkInstallWarning', { count: files.length }),
          i18n.t('messages.queue.bulkInstallTitle'),
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: i18n.t('messages.queue.bulkInstallContinue'),
            cancelButtonText: i18n.t('common.buttons.cancel'),
            type: 'warning',
            center: true,
          })
          .then(async () => {
            // first check the connection
            await this.$ps5.checkPS5()
                .then(async () => {
                  this.log(i18n.t('messages.connection.ps5ConnectionReady'))
                  this.$message({message: i18n.t('messages.connection.ps5ConnectionReady'), type: 'success'})
                  await new Promise((resolve => setTimeout(() => resolve(), 200)))
                })
                .catch(e => {
                  console.log(e)
                  this.log(e)
                  this.$message({message: i18n.t('messages.connection.ps5ConnectionFailed'), type: 'error'})
                  throw new Error(i18n.t('errors.ps5ConnectionFailed'))
                })

            // warn the user
            this.$message({
              dangerouslyUseHTMLString: true,
              type: 'success',
              timeout: 3000,
              message: i18n.t('messages.queue.bulkFoundFiles', { count: files.length })
            })

            // countdown
            await new Promise((resolve => setTimeout(() => resolve(), 3000)))

            // bulk request handling
            let total = files.length
            for (let i = 0; i < files.length; i++) {
              if (!this.queueAutoRunning)
                break
              await this.start(files[i])
              await new Promise(resolve => setTimeout(resolve, 2000))
            }

            if (!this.queueAutoRunning)
              return

            this.$message({message: i18n.t('messages.queue.bulkFinished'), type: 'success'})

            if (this.notify)
              this.$root.notify({title: i18n.t('messages.notifications.queueScanner'), body: i18n.t('messages.queue.bulkRequestsFinished', { count: total })})
          })
          .catch(() => {
          })
          .finally(() => {
            this.queueAutoRunning = false
          })
    },

    handleStartInstallError(file, e) {
      let code = e.error_code

      if (code == 2157510677) {
        file.status = 'exists'
        this.handleQueueScannerNextItem()
        return true
      }

      return false
    },

    calcTableMaxHeight() {
      try {
        const table = this.$el.querySelector('.el-table')
        if (!table) {
          this.tableMaxHeight = Math.max(180, window.innerHeight - 250)
          return
        }
        const tableRect = table.getBoundingClientRect()
        const processRect = this.$el.getBoundingClientRect()
        this.tableMaxHeight = Math.max(180, processRect.bottom - tableRect.top - 20)
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
.ProcessView {
  height: calc(100vh - 130px);
  overflow: hidden;

  .queue_stats {
    display: inline-flex;
    margin-left: 10px;
    vertical-align: middle;

    .el-tag + .el-tag {
      margin-left: 5px;
    }
  }

  .status-tags {
    display: inline-flex;

    .el-tag + .el-tag {
      margin-left: 4px;
    }
  }

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
    //margin-right: 4px;
  }

  .sfo-title-id-tag {
    display: inline-block;
    background-color: #ecf5ff;
    color: #1b7a60;
    padding: 0 4px;
    border-radius: 3px;
    font-size: 12px;
    //margin-right: 4px;
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

  .progress-meta {
    display: flex;
    flex-direction: column;
    gap: 1px;
    font-size: 11px;
    color: #909399;
    margin-top: 4px;
    line-height: 1.2;
    white-space: nowrap;
  }

  .progress-display {
    position: relative;

    .progress-percentage {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 12px;
      font-weight: 600;
      line-height: 25px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.95), 0 0 2px rgba(0, 0, 0, 0.8);
      pointer-events: none;
    }
  }

  /* 展开区域样式 */
  .expand-section {
    margin: 0 12px 8px;
    padding: 9px 12px;
    background: #f5f7fa;
    border-radius: 4px;
    border-left: 3px solid #dcdfe6;

    .expand-section-title {
      font-size: 11px;
      font-weight: 600;
      color: #606266;
      margin-bottom: 7px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
  }

  .expand-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    gap: 7px 14px;
  }

  .expand-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
    min-width: 0;

    .expand-label {
      font-size: 11px;
      color: #909399;
      min-width: 120px;
      white-space: nowrap;
    }

    .expand-value {
      font-size: 12px;
      color: #303133;
      font-weight: 500;
      word-break: break-all;
    }
  }

  .expand-paths {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .expand-path-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    line-height: 1.35;

    .expand-label {
      font-size: 12px;
      color: #909399;
      min-width: 120px;
      flex-shrink: 0;
    }

    .expand-text {
      font-size: 12px;
      color: #606266;
      word-break: break-all;
      line-height: 1.35;
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
