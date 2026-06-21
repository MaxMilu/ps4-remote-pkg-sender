<template>
<div class="ProcessView">

<el-row style="margin-bottom: 20px;">
    <el-col :span="20">
        <el-dropdown @command="handleDropdownCommand" style="margin-right: 10px">
        <el-button size="small" icon="el-icon-refresh-left" >
            Reset Options <i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
            <el-dropdown-item icon="el-icon-refresh-left" command="resetAll">Reset Queue, Tasks and Installed</el-dropdown-item>
            <el-dropdown-item icon="el-icon-refresh-left" command="resetInstalled">Reset Installed</el-dropdown-item>
            <el-dropdown-item icon="el-icon-refresh-left" command="clearFinishedFiles">Remove finished files from Queue</el-dropdown-item>
            <el-dropdown-item icon="el-icon-delete" command="clearInstalledFiles">Remove installed files from Queue</el-dropdown-item>
        </el-dropdown-menu>
        </el-dropdown>

        <el-dropdown @command="handleDropdownCommand" style="margin-right: 10px">
        <el-button size="small" icon="el-icon-check" >
            Check Options <i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
            <el-dropdown-item icon="fa fa-server" command="checkHB">Check Local Server</el-dropdown-item>
            <el-dropdown-item icon="fab fa-playstation" command="checkPS4">Check Playstation</el-dropdown-item>
        </el-dropdown-menu>
        </el-dropdown>

        <el-button size="small" icon="el-icon-link" @click="openAddFileDialog" v-if="app.config.enableExternalLinks"> Add URL </el-button>

        <el-button size="small" icon="el-icon-sync" :type="queueScanner ? 'success active' : ' active'" @click="toggleQueueScanner"> Queue Scanner </el-button>
        <el-button size="small" icon="fa fa-play" @click="handleQueueScannerNextItem" v-if="queueScanner"> Autostart </el-button>
        <el-checkbox v-model="skipInstalledQueueItems" v-if="queueScanner" style="margin-left: 10px"> Skip Installed </el-checkbox>

        <el-button size="small" @click="test" v-if="false">Test </el-button>
    </el-col>
    <el-col :span="4">
        <el-input v-model="search" size="small" placeholder="Search" prefix-icon="fas fa-search" />
    </el-col>
</el-row>


<el-table :data="files" v-loading="loading" class="file"
    element-loading-text="Loading Server files"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255, 255, 255, 0.8)"
    :max-height="tableMaxHeight"
    style="width: 100%">

    <el-table-column type="expand">
        <template slot-scope="scope">
            <!-- 操作按钮区 -->
            <div class="expand-section expand-actions">
                <el-button-group size="mini">
                    <el-button icon="fa fa-search" @click="find(scope.row)"> Find </el-button>
                    <el-button icon="fa fa-info" @click="info(scope.row)" :disabled="!scope.row.task"> Info </el-button>
                    <el-button icon="fa fa-play" @click="start(scope.row)"> Start </el-button>
                    <el-button icon="fa fa-pause" @click="pause(scope.row)" :disabled="!scope.row.task"> Pause </el-button>
                    <el-button icon="fa fa-play" @click="resume(scope.row)" :disabled="!scope.row.task"> Resume </el-button>
                    <el-button icon="fa fa-stop" @click="stop(scope.row)" :disabled="!scope.row.task"> Stop </el-button>
                    <el-button icon="fa fa-trash" @click="remove(scope.row)" :disabled="!scope.row.task"> Remove </el-button>
                </el-button-group>
            </div>

            <!-- 状态信息区 -->
            <div class="expand-section">
                <div class="expand-section-title">Status Information</div>
                <div class="expand-grid">
                    <div class="expand-item">
                        <span class="expand-label">Percent</span>
                        <el-tag size="small" type="primary">{{ scope.row.percentage }}%</el-tag>
                    </div>
                    <div class="expand-item">
                        <span class="expand-label">Status</span>
                        <el-tag size="small" :type="$helper.getFileStatus(scope.row.status)">{{ scope.row.status }}</el-tag>
                    </div>
                    <div class="expand-item">
                        <span class="expand-label">Type</span>
                        <el-tag size="small" type="info">{{ scope.row.type || '-' }}</el-tag>
                    </div>
                    <div class="expand-item">
                        <span class="expand-label">Task</span>
                        <el-tag size="small" type="info">{{ scope.row.task || '-' }}</el-tag>
                    </div>
                    <div class="expand-item" v-if="scope.row.cusa">
                        <span class="expand-label">CUSA</span>
                        <el-tag size="small" type="warning">{{ scope.row.cusa }}</el-tag>
                    </div>
                    <div class="expand-item">
                        <span class="expand-label">Size</span>
                        <el-tag size="small" :type="$helper.getFileSizeType(scope.row.size)">{{ scope.row.size }}</el-tag>
                    </div>
                    <div class="expand-item">
                        <span class="expand-label">Logs</span>
                        <el-tag size="small" type="info">{{ scope.row.logs.length }}</el-tag>
                    </div>
                </div>
            </div>

            <!-- 文件信息区 -->
            <div class="expand-section" v-if="scope.row.sfo?.readSFOHeader">
                <div class="expand-section-title">SFO Information</div>
                <div class="expand-grid">
                    <div class="expand-item" v-if="scope.row.sfo.TITLE">
                        <span class="expand-label">Title</span>
                        <span class="expand-value">{{ scope.row.sfo.TITLE }}</span>
                    </div>
                    <div class="expand-item" v-if="scope.row.sfo.VERSION">
                        <span class="expand-label">Version</span>
                        <el-tag size="small" type="success">{{ scope.row.sfo.VERSION }}</el-tag>
                    </div>
                    <div class="expand-item" v-if="scope.row.sfo.CATEGORY">
                        <span class="expand-label">Category</span>
                        <el-tag size="small" :type="$helper.getSfoCategoryLabel(scope.row.sfo.CATEGORY).color">
                            {{ $helper.getSfoCategoryLabel(scope.row.sfo.CATEGORY).label }}
                        </el-tag>
                    </div>
                    <div class="expand-item" v-if="scope.row.sfo.CONTENT_ID">
                        <span class="expand-label">Content ID</span>
                        <el-tag size="small" type="info">{{ scope.row.sfo.CONTENT_ID }}</el-tag>
                    </div>
                </div>
            </div>

            <!-- 路径信息区 -->
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

            <!-- 调试信息 -->
            <pre v-if="showDebugInRow" class="expand-debug">{{ scope.row }}</pre>
        </template>
    </el-table-column>

    <el-table-column label="Cover" width="100" v-if="sfoEnabled">
        <template slot-scope="scope">
            <div class='image' :style="{ backgroundImage: 'url('+scope.row.image+')' }" />
        </template>
    </el-table-column>        

    <el-table-column prop="name" label="Name" min-width="220">
        <template slot-scope="scope">
            <template v-if="scope.row.sfo?.readSFOHeader && scope.row.sfo.TITLE">
                <div class="sfo-title">
                    <span class="sfo-version-tag" v-if="scope.row.sfo.VERSION">[{{ scope.row.sfo.VERSION }}]</span>
                    {{ scope.row.sfo.TITLE }}
                </div>
                <div class="sfo-subtitle">
                    <span class="sfo-filename">{{ scope.row.name }}</span>
                    <el-tag size="small" :type="$helper.getSfoCategoryLabel(scope.row.sfo.CATEGORY).color" class="sfo-category-tag" v-if="scope.row.sfo.CATEGORY">{{ $helper.getSfoCategoryLabel(scope.row.sfo.CATEGORY).label }}</el-tag>
                    <el-tag size="small" type="info" class="sfo-contentid-tag"> {{ scope.row.sfo.CONTENT_ID }} </el-tag>
                </div>
            </template>
            <template v-else>
                {{ scope.row.name }}
                <small v-if="scope.row.sfo?.readSFOHeader">(v{{ scope.row.sfo.APP_VER }})</small>
            </template>
        </template>
    </el-table-column>

    <el-table-column label="Ext" width="100" v-if="showExtension">
        <template slot-scope="scope">
            <el-tag size="mini"
                    :type="scope.row.ext === '.pkg' ? 'primary' : 'success'"
                    disable-transitions>{{scope.row.ext}}</el-tag>
        </template>
    </el-table-column>

    <el-table-column prop="task" label="Task" width="105" v-if="showTask && !isPS5"></el-table-column>
    <el-table-column prop="cusa" label="CUSA" width="100" v-if="showCUSA"></el-table-column>
    <el-table-column label="Version" width="90" v-if="showVersion">
        <template slot-scope="scope">
            <el-tag size="small" type="info" v-if="scope.row.sfo?.VERSION">{{ scope.row.sfo.VERSION }}</el-tag>
            <span v-else>-</span>
        </template>
    </el-table-column>

    <el-table-column prop="rest" label="Rest" width="150" align="center">
        <template slot-scope="scope">
            <template v-if="scope.row.rest && scope.row.rest != 0">
                <div>{{ $helper.secondsToString(scope.row.rest) }}</div>
                <div class="speed-estimate" v-if="scope.row.percentage > 0 && scope.row.sizeInBytes">
                    ~{{ $helper.formatSpeed(scope.row.sizeInBytes, scope.row.percentage, scope.row.rest) }}
                </div>
            </template>
        </template>
    </el-table-column>

    <el-table-column prop="status" label="Status" width="120" align="center">
        <template slot-scope="scope">
            <el-tag size="small" plain :type="$helper.getFileStatus(scope.row.status)"> <i class="el-icon-loading" v-if="scope.row.status == 'installing'" /> {{ scope.row.status }} </el-tag>
        </template>
    </el-table-column>

    <el-table-column prop="size" label="Size" width="120" align="right">
        <template slot-scope="scope">
            <el-tag size="small" plain :type="$helper.getFileSizeType(scope.row.size)">{{ scope.row.size }}</el-tag>
        </template>
    </el-table-column>

    <el-table-column label="Progress" width="100px" v-if="showPercentage">
        <template slot-scope="scope">
            <el-progress :stroke-width="25" :percentage="scope.row.percentage" :text-inside="true" stroke-linecap="square"></el-progress>
        </template>
    </el-table-column>

    <el-table-column label="Operation" width="150" align="right">
        <template slot-scope="scope">
            <el-button circle size="small" icon="fa fa-minus" @click="removeFromQueue(scope.row)" />

            <el-button circle size="small" icon="fa fa-info" @click="info(scope.row)" v-if="false"> </el-button>
            <el-button circle size="small" icon="fa fa-stop" @click="stop(scope.row)" v-if="false"> </el-button>
            <el-button circle size="small" icon="fa fa-play" v-if="scope.row.status != 'installing'" @click="start(scope.row)"> </el-button>
            <el-button circle size="small" icon="fa fa-pause" v-if="scope.row.status == 'installing'" @click="pause(scope.row)"> </el-button>

            <el-button circle size="small" icon="fab fa-playstation" @click="isInstalled(scope.row)" />

            <el-button circle size="small" icon="fa fa-check" v-if="scope.row.status == 'finished' && scope.row.status == 'serving' && scope.row.status == 'installing'" />
        </template>
    </el-table-column>
</el-table>

<AddFileByURLDialog ref="AddFileByURLDialog"/>
<mainComponents v-if="false" />

<pre v-if="debug">{{ queue }}</pre>
</div>
</template>

<script>
import { get, sync } from 'vuex-pathify'
import JSON5 from 'json5'

export default {
    name: 'Index',

    data(){ return {
        debug: false,

        loading: false,
        showTask: true,
        showCUSA: false,
        showVersion: false,
        showPercentage: true,
        showExtension: false,
        showDebugInRow: false,
        ints: [],
        queueNextTimer: null,
        search: '',
        tableMaxHeight: 400,
    }},

    mounted(){
        this.search = ''
        this.$nextTick(() => { this.calcTableMaxHeight() })
        window.addEventListener('resize', this.onResize)
    },

    beforeDestroy(){
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
        files(){ 
            let search = this.search.toLowerCase()

            if(search.length != 0)
                return this.queueFiles.filter( file =>
                    file.name.toLowerCase().includes(search) || 
                    file.cusa.toLowerCase().includes(search) ||
                    file.status.toLowerCase().includes(search)
                )

            return this.queueFiles
        },
        finishedFiles(){
            return this.queueFiles.filter( file => ['finish', 'Sent to PS5'].includes(file.status) )
        }
    },

    methods: {
        checkHB(){
            this.$ps4.checkServer().then( ({ data }) => {
                this.$message({ message: data.message, type: 'success' })
            })
            .catch( e => {
                this.$message({ message: "No Heartbeat. Server is not working, please check the Server Logs.", type: 'error' })
            })
        },

        async checkPS4(){
                // ps5 check
                if( this.isPS5 )
                    return await this.$ps5.checkPS5()
                        .then( () => {
                            this.log("PS5 Connection available")
                            this.$message({ message: "PS5 Connection available", type: 'success' })
                        })
                        .catch( e => {
                            console.log(e)
                            this.log(e)
                            this.$message({ message: "PS5 Connection failed", type: 'error' })                    
                        })
                

                // backwardscompatibility for ps4
                this.$ps4.checkPS4()
                    .then( (res) => {
                        this.log("PS4 is accessible", { status: res.status, statusText: res.statusText })
                        this.$message({ message: "Check Playstation: PS4 is accessible", type: 'success' })
                    })
                    .catch( e => {
                        this.log("Check Playstation: PS4 is not accessible", e)
                        this.$message({ message: "PS4 is not accessible.", type: 'error' })
                    })
        },

        test(){
            if(this.notify)
                this.sendNotification({ title: "Test", body: "This test is for Systemwide Notifications" })
        },

        isInstalled(file){
            if(this.isSingleDPI){
                return this.$ps5.isInstalled(file)
                    .then(data => {
                        if(!data || data.res !== 0)
                            throw new Error(data && data.error ? data.error : 'Invalid singleDPI response')

                        if(data.exists)
                            file.status = 'installed'

                        const message = data.exists
                            ? 'Already installed on your PS5.'
                            : 'Not detected on your PS5.'
                        const type = data.exists ? 'warning' : 'success'
                        this.log(message, data)
                        this.$message({ message, type })
                    })
                    .catch(e => {
                        console.log(e)
                        this.$message({ message: e.message || String(e), type: 'error' })
                    })
            }

            if( this.isPS5 )
                return this.$message({ message: "'Is Installed' feature is not implemented for PS5 yet", type: "info" })                

            this.$ps4.isInstalled(file)
                    .then( ({ data }) => {
                        if(data.exists == true)
                            file.status = 'installed'

                        let { exists, size, type } = data
                        this.log(data.message, { exists, size, type })
                        this.$message({ message: data.message, type: data.type })
                    })
                    .catch( e => {
                        this.clearInterval(file)
                        console.log(e)
                    })
        },

        async start(file){
            // ps5 version 
            if( this.isPS5 ){            
                this.log(file.name + ' install request')                

                return await this.$ps5.install(file)
                    .then( (data) => {
                        // this.$message({ message: file.name + ' send to PS5', file, type: "info" })                        
                        console.log(data)
                        this.log(data)

                        // validate install response 
                        if(data && Object.prototype.hasOwnProperty.call(data, 'res')){
                            let code = parseInt(data.res)                        

                            // success
                            if( code == 0 ){
                                if(this.isSingleDPI){
                                    this.setStatus(file, 'installing')

                                    if(data.content_id){
                                        this.setTask(file, data.content_id)
                                        this.startInterval(file)
                                    }
                                }
                                else {
                                    this.setStatus(file, "Sent to PS5")
                                }

                                this.log(file.name + ' install request successfull', file.url)
                                return this.$message({ 
                                    dangerouslyUseHTMLString: true,
                                    message: `Install Request Success for <br>${file.name}`,
                                    type: "success" 
                                })
                            }

                            if( code == -2135809020 ){
                                this.log(file.name + ' file at URL not found', file.url)
                                return this.$message({ 
                                    dangerouslyUseHTMLString: true,
                                    message: `Error ${code} | PKG file response 404. Check Server heartbeat. <br>${file.name}`,
                                    type: "error" 
                                })                    
                            }        
                            
                            // something else, maybe in queue, maybe full storage, maybe whatever
                            this.$message({ 
                                dangerouslyUseHTMLString: true,
                                message: `Response Code ${data.res} for <br>${file.name}`, 
                                type: "info" 
                            })
                        }
                        else {
                            this.$message({ message: `Unknown Response. Please check Logs.`, type: "warning" })                            
                        }
                    })
                    .catch( e => {
                        console.log(e)
                        this.log(e)
                        this.$message({ message: e, type: 'error' })
                    })            
            }          

            // ps4 simple goldhen
            if( this.getPS4TargetApp == 'goldhen' ){
                console.log("GoldHEN Install request")
                return this.$ps4_goldhen.install(file)
                    .then( data => {
                        console.log("GodlHEN Request Done. Check response")
                        console.log(data)
                        this.log(data)
                    })
                    .catch( e => {
                        console.error("GoldHEN Error")
                        console.log(e)
                    })
            }

            // ps4 version
            if(file.task && ['pause', 'stop'].includes(file.status) ){
                console.log(file.name + ' found task id ' + file.task)
                return this.resume(file)
            }

            this.log(file.name + ' prepare start installing', file)

            this.clearInterval(file)

            this.log("Install Request", { type : 'direct', packages: [file.url] })

            await this.$ps4.install(file)
                .then( ({ data }) => {
                    this.log(file.name + ' install', data)

                    // let example =   {
                    //   "status": "success",
                    //   "task_id": 268435806,
                    //   "title": "Tin & Kuna"
                    // }

                    if( data.status == 'success'){
                        this.$store.dispatch('queue/addTask', data)

                        this.setTask(file, data.task_id)
                        this.setStatus(file, 'installing')
                        this.sendNotification({ title: "Installing", body: file.name + " is installing" })
                        this.startInterval(file)
                        this.$root.track({ name: 'install.success', data: { name: 'Install Request success', value: file.name } })

                        this.log(file.name + ' has been started installing with Task ID ' + data.task_id, data)
                    }
                    else {
                        console.log(file.name + " error on install", data)
                        this.log(file.name + " error on install", data)
                        this.$root.track({ name: 'install.error', data: { name: 'Install Request failed', value: file.name } })
                        // 2157510677 error on double install?
                        // 2157510663 already installed?
                        // 2157510681 task doesn't exist
                    }

                })
                .catch( e => {
                    this.clearInterval(file)
                    console.log(e)
                    this.log("Install error", e, 'error')

                    if(e.status == 'fail' && e.error_code)
                        this.handleStartInstallError(file, e)
                })
        },

        stop(file){
            console.log(file.name + ' stop')

            this.clearInterval(file)

            this.$ps4.stop(file)
                    .then( ({ data }) => {
                        console.log("Stop ", data)
                        this.setStatus(file, 'stop')
                        this.log(file.name + ' stop Task ID ' + file.task, data)
                    })
                    .catch( e => {
                        this.clearInterval(file)
                        console.log(e)
                    })
        },

        pause(file){
            console.log(file.name + ' pause')

            this.clearInterval(file)

            this.$ps4.stop(file)
                    .then( ({ data }) => {
                        console.log("pause ", data)
                        this.setStatus(file, 'pause')
                        this.log(file.name + ' pause', data)
                    })
                    .catch( e => {
                        this.clearInterval(file)
                        console.log(e)
                    })
        },

        resume(file){
            console.log(file.name + ' continue task id ' + file.task)

            this.clearInterval(file)

            this.$ps4.resume(file)
                    .then( ({ data }) => {
                        if(data.status == 'success'){
                            console.log("resume ", data)
                            this.setStatus(file, 'installing')
                            this.startInterval(file)

                            this.log(file.name + ' resume Task ID ' + file.task, data)
                        }
                    })
                    .catch( e => {
                        this.clearInterval(file)
                        console.log(e)
                    })
        },

        remove(file){
            console.log(file.name + ' remove ')

            this.clearInterval(file)

            this.$ps4.remove(file)
                    .then( ({ data }) => {
                        console.log(data)
                        this.log(file.name + ' remove', data)
                    })
                    .catch( e => {
                        this.clearInterval(file)
                        console.log(e)
                    })
        },

        info(file){
            if(this.isSingleDPI){
                // A final status response can overlap with another in-flight poll.
                // Once a task is finalized, ignore late responses so the queue is
                // advanced exactly once.
                if(['finish', 'installed'].includes(file.status))
                    return

                return this.$ps5.status(file.task)
                    .then(data => {
                        if(!data || data.res !== 0){
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

                        if(Number(data.error_code || 0) !== 0){
                            this.clearInterval(file)
                            file.status = 'error'
                            this.log(file.name + ' singleDPI install error', data)
                            return
                        }

                        if(['playable', 'completed', 'installed'].includes(data.status)){
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
                .then( ({ data }) => {
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
                    
                    if(data.status && data.status == 'success'){
                        let length = Math.round(parseInt(data.length))
                        let done   = Math.round(parseInt(data.transferred))
                        let onePercent = 100 / length
                        let percent = Math.round(done * onePercent)
                        // console.log("percent", length, done, onePercent, percent)
                        let isWorking = data.length != data.transferred
                        let haveRestTime = data.rest_sec_total != 0

                        // check if we are in prepare state
                        if(data.preparing_percent != 100 && data.local_copy_percent != 100 && data.transferred == 0 && data.length == 0){
                            this.log(file.name + ' ps4 is still preparing ' + data.preparing_percent + '%', data)
                            return
                        }

                        if(data.length == 0 && data.transferred == 0){
                            this.log(file.name + ' ps4 prepared but still doing some work', data)
                            return
                        }

                        if(isWorking && percent < 100 && haveRestTime){
                            file.percentage = percent
                            file.rest = data.rest_sec_total
                            this.log(file.name + ' info', data)
                        }
                        else {
                            this.clearInterval(file)
                            file.percentage = 100
                            file.rest = 0
                            this.setStatus(file, 'finish')
                            this.fileInstalled(file, 'installed')

                            this.log(file.name + ' finished', data)
                        }

                        file.logs.unshift(data)
                    }
                    else {
                        console.log("Task Info Fail", data)
                        this.log(file.name + ' Info fail', data)
                        this.clearInterval(file)
                    }

                })
                .catch( e => {
                    this.clearInterval(file)
                    console.log(e)
                })

            // this.log(file.name + ' info')
        },

        find(file){
            if( this.isPS5 ){
                this.$message({ message: "'Find file' is not implemented for PS5 yet", type: "info" })
                return
            }

            this.$ps4.find(file)
                    .then( ({ data }) => {
                        this.log(file.name + ' find', data)
                    })
                    .catch( e => {
                        this.clearInterval(file)
                        console.log(e)
                    })
        },

        startInterval(file){
            this.clearInterval(file)
            this.ints[file.patchedFilename] = setInterval( () => {
                // console.log(file.name + ' ' + file.percentage)
                this.info(file)
            }, this.updateInterval)
        },

        haveInterval(file){
            if(this.ints[file.patchedFilename])
                return this.ints[file.patchedFilename]

            return false
        },

        clearInterval(file){
            clearInterval(this.ints[file.patchedFilename])
            delete this.ints[file.patchedFilename]
        },

        setStatus(file, status){
            this.$store.dispatch('queue/status', { file, status })
        },

        setTask(file, id){
            this.$store.dispatch('queue/task', { file, id })
        },

        log(msg='', data={}, type='log'){
            // this.$store.dispatch('queue/addLog', a)
            this.$root.sendPS4({ time: Date.now(), msg, data, type })
        },

        sendNotification(data){
            if(this.notify)
                this.$root.notify(data)
        },

        fileInstalled(file, status='installed'){
            let servingFile = this.$store.getters['server/findFile'](file)
            if(servingFile){
                servingFile.status = status
            }

            this.setTask(file, '')
            this.sendNotification({ title: "Finished", body: file.name + " is finished installing" })
            this.$store.dispatch('queue/installed', file)
            this.$root.track({ name: 'installed', data: { name: 'File installed', value: file.name } })


            // queue scanner hook
            if(this.queueScanner)
                this.scheduleQueueScannerNextItem()
        },

        scheduleQueueScannerNextItem(){
            if(this.queueNextTimer){
                clearTimeout(this.queueNextTimer)
                this.queueNextTimer = null
            }

            // Do not wait after the final item just to report an empty queue.
            if(!this.queueFiles.some(file => this.isQueueInstallCandidate(file))){
                this.handleQueueScannerNextItem()
                return
            }

            const configuredDelay = this.singleDPIQueueMode == 'delay'
                ? Number(this.singleDPIQueueDelaySeconds || 0)
                : 0
            const delaySeconds = Math.max(0, Math.min(3600, configuredDelay))

            if(!this.isSingleDPI || delaySeconds == 0){
                this.handleQueueScannerNextItem()
                return
            }

            this.$message({
                type: 'info',
                message: `Next queue item will start in ${delaySeconds} seconds`
            })

            this.queueNextTimer = setTimeout(() => {
                this.queueNextTimer = null
                if(this.queueScanner)
                    this.handleQueueScannerNextItem()
            }, delaySeconds * 1000)
        },

        getRandomInt(max) {
            return Math.floor(Math.random() * max);
        },

        isQueueInstallCandidate(file){
            if(file.status == 'in queue')
                return true

            return !this.skipInstalledQueueItems &&
                file.status && file.status.startsWith('installed')
        },

        resetAll(){
            this.$confirm('This will clear your Queue, Tasks and Installed states.', 'Reset Queue, Tasks and Installed',
                    {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning',
                    center: true,
                    })
                    .then(() => {
                        if(this.queueNextTimer){
                            clearTimeout(this.queueNextTimer)
                            this.queueNextTimer = null
                        }
                        this.ints.map( i => clearInterval(i) )
                        this.servingFiles.map( file => file.status = 'serving')
                        this.draggedServingFiles.map( file => file.status = 'serving')

                        this.$store.dispatch('queue/resetAll')
                        this.$root.track({ name: 'resetAll', data: { name: 'Processing Center reset' } })

                        this.$message({
                        type: 'success',
                        message: 'Queue, Tasks and Installed state has been resetted'
                        });
                    })
                    .catch(() => {
                        // this.$message({
                        //   type: 'info',
                        //   message: 'Reset action canceled'
                        // });
                    });
        },

        resetInstalled(){
            console.log(this.servingFiles)

            this.queueFiles
                    .filter( file => ['installed', 'Sent to PS5'].includes(file.status))
                    .map( file => file.status = 'in queue')

            this.servingFiles
                    .filter( file => ['installed', 'Sent to PS5'].includes(file.status))
                    .map( file => file.status = 'serving')

            this.draggedServingFiles
                    .filter( file => ['installed', 'Sent to PS5'].includes(file.status))
                    .map( file => file.status = 'serving')

            this.$store.dispatch('queue/setInstalled', [])
            this.$root.track({ name: 'resetInstalled', data: { name: 'Reset installed Files' } })
        },

        clearFinishedFiles(){
            this.finishedFiles.map( file => this.removeFromQueue(file))
            this.$root.track({ name: 'clearFinishedFiles', data: { name: 'Clear finished Files' } })
        },

        clearInstalledFiles(){
            this.queueFiles
                .filter(file => file.status && file.status.startsWith('installed'))
                .map(file => this.removeFromQueue(file))
            this.$root.track({ name: 'clearInstalledFiles', data: { name: 'Clear installed Files' } })
        },

        removeFromQueue(file){
                this.clearInterval(file)
                let servingFile = this.$store.getters['server/findFile'](file)                 

                if(servingFile && servingFile.status == 'in queue'){
                    servingFile.status = 'serving'
                }

                if(file.task){
                    this.stop(file)
                }

                this.$store.dispatch('queue/removeFromQueue', file)
                this.$root.track({ name: 'removeFromQueue', data: { name: 'Removed from Queue', value: file.name } })
        },

        openAddFileDialog(){
            this.$refs.AddFileByURLDialog.show = true
        },

        handleDropdownCommand(cmd){
            this[cmd]()
        },

        toggleQueueScanner(){
            const wasEnabled = this.queueScanner
            this.$store.dispatch('app/toggleQueueScanner')

            if(wasEnabled && this.queueNextTimer){
                clearTimeout(this.queueNextTimer)
                this.queueNextTimer = null
            }

            this.$root.track({ name: 'QueueScanner.toggle', data: { name: 'Toggle QueueScanner', value: this.queueScanner } })
        },

        async handleQueueScannerNextItem(){
            // Clicking Autostart during a configured delay means "start now".
            if(this.queueNextTimer){
                clearTimeout(this.queueNextTimer)
                this.queueNextTimer = null
            }

            let findNextFile = this.queueFiles.filter(file => this.isQueueInstallCandidate(file))
            console.log(findNextFile, findNextFile.length)

            // no items
            if(findNextFile.length == 0)
                return this.$message({
                    type: 'success',
                    message: 'There are no items to be installed in the queue'
                });          

            // Legacy etaHEN has no task progress API, so retain its bulk mode.
            // singleDPI reports completion and must advance strictly one item at
            // a time through fileInstalled(). Mixing both paths duplicates jobs.
            if(this.isPS5 && !this.isSingleDPI)
                return await this.handleQueueScannerNextItemPS5(findNextFile)

            // we have a file in the queue
            if(findNextFile.length > 0){
                let file = findNextFile[0]
                this.$message({
                    dangerouslyUseHTMLString: true,
                    type: 'success',
                    message: 'Found next File in the Queue. <br>' + file.name,
                });
                this.$root.track({ name: 'QueueScanner.next', data: { name: 'QueueScanner handle next item in List', value: file.name } })
                await this.start(file)
            }
        },

        async handleQueueScannerNextItemPS5(files=[]){
            this.$confirm(
                `Queue Scanner can currently only Bulk Request` +
                `all files because there is no Process Handling` +
                `Response yet to track the progress. <br><br>`+ 
                `The Queue handler will send all eligible files ` +
                `automatically to the PS5 with a delay in ` + 
                `between. ${files.length} files to be send.`, 
                'Bulk Install Request to PS5',
            {
                dangerouslyUseHTMLString: true,
                confirmButtonText: 'OK, Continue',
                cancelButtonText: 'Cancel',
                type: 'warning',
                center: true,
            })
            .then( async () => {
                // first check the connection 
                await this.$ps5.checkPS5()
                    .then( async () => {
                        this.log("PS5 Connection is ready for Bulk Requests")
                        this.$message({ message: "PS5 Connection is Ready for Bulk Requests", type: 'success' })
                        await new Promise( (resolve => setTimeout( () => resolve(), 200)) )
                    })
                    .catch( e => {
                        console.log(e)
                        this.log(e)
                        this.$message({ message: "PS5 Connection failed. Bulk Request can't proceed.", type: 'error' })                                                
                        throw new Error('PS5 Connection failed')
                    })

                // warn the user 
                this.$message({
                    dangerouslyUseHTMLString: true,
                    type: 'success',
                    timeout: 3000,
                    message: `Found ${files.length} files to be send as Bulk Requests to the PS5. <br>`+
                            `Attention: Files will be send with a delay in between ` 
                            // + `for <br>` +  `all files that are 'in queue' from the Queue.`
                })                    

                // countdown 
                await new Promise( (resolve => setTimeout( () => resolve(), 3000)) )

                // bulk request handling 
                let total = files.length 
                for (let i = 0; i < files.length; i++) {
                    await this.start(files[i])
                    await new Promise(resolve => setTimeout(resolve, 2000))
                }

                this.$message({ message: "Queue Scanner finished. Check your PS5 download/installation", type: 'success' })

                if( this.notify )
                    this.$root.notify({ title: "Queue Scanner", body: "Bulk Requests finished for " + total + " files."})
            })
            .catch(() => {})
        },

        handleStartInstallError(file, e){
            let code = e.error_code

            if(code==2157510677){
                file.status = 'exists'
                this.handleQueueScannerNextItem()
            }
        },

        calcTableMaxHeight(){
            try {
                const table = this.$el.querySelector('.el-table')
                if(!table){
                    this.tableMaxHeight = Math.max(300, window.innerHeight - 250)
                    return
                }
                const rect = table.getBoundingClientRect()
                const offsetTop = rect.top
                this.tableMaxHeight = Math.max(300, window.innerHeight - offsetTop - 30)
            }
            catch(e){
                this.tableMaxHeight = 400
            }
        },

        onResize(){
            this.calcTableMaxHeight()
        },

    }
}
</script>

<style lang="scss" scoped>
.ProcessView {
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
        margin-right: 4px;
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

    .speed-estimate {
        font-size: 11px;
        color: #909399;
        margin-top: 2px;
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

    .expand-actions {
        background: transparent;
        padding: 5px 0;
    }

    .expand-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
    }

    .expand-item {
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 120px;

        .expand-label {
            font-size: 12px;
            color: #909399;
            white-space: nowrap;
        }

        .expand-value {
            font-size: 12px;
            color: #303133;
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
            min-width: 90px;
            flex-shrink: 0;
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
