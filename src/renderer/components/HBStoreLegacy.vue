<template>
<div class='hb_store'>

  <el-row style="margin-bottom: 10px;">
    <el-col :span="20" style="display: flex">
        <h2 style="margin:0; line-height: 32px;">{{ $t('hbstore.legacy.title') }}</h2>
    </el-col>
    <el-col :span="4">

    </el-col>
  </el-row>


  <div v-if="view == 'table'">
      <el-table :data="packages" class="file" :empty-text="$t('hbstore.noData')">
          <el-table-column type="expand">
              <template slot-scope="scope">
                  <el-tag size="small" type="info" style="margin-bottom: 5px"> {{ $t('hbstore.expand.reviewStars') }}: {{ scope.row.data.ReviewStars }} </el-tag>
                  <el-tag size="small" type="info" style="margin-bottom: 5px"> {{ $t('hbstore.expand.author') }}: {{ scope.row.data.Author }} </el-tag>
                  <el-tag size="small" type="info" style="margin-bottom: 5px" :type="$helper.getAppStoreType(scope.row.data.apptype)"> {{ $t('hbstore.expand.type') }}: {{ scope.row.data.apptype }} </el-tag>
                  <el-tag size="small" type="info" style="margin-bottom: 5px"> {{ $t('hbstore.expand.pv') }}: {{ scope.row.data.pv }} </el-tag>
                  <el-tag size="small" type="info" style="margin-bottom: 5px"> {{ $t('hbstore.expand.releaseDate') }}: {{ scope.row.data.releaseddate }} </el-tag>
                  <br>

                  <el-tag size="small" type="info" style="margin-bottom: 5px"> {{ $t('hbstore.expand.name') }}: {{ scope.row.data.name }} </el-tag> <br>
                  <div class="el-tag el-tag--info el-tag--small" style="height: auto; margin-bottom: 3px;">
                      <div style='display: flex;'>
                          <div style="margin-right: 5px; "> {{ $t('hbstore.expand.description') }}: </div>
                          <div>
                            <div v-if="scope.row.data.desc_1">{{ scope.row.data.desc_1 }} </div>
                            <div v-if="scope.row.data.desc_2">{{ scope.row.data.desc_2 }} </div>
                          </div>
                      </div>
                  </div>
                  <br>

                  <el-tag size="small" type="info" style="margin-bottom: 5px"> {{ $t('hbstore.expand.url') }}: {{ scope.row.url }} </el-tag> <br>
                  <pre v-if="debug">{{ scope.row }}</pre>
              </template>
          </el-table-column>

          <el-table-column :label="$t('common.table.cover')" width="100">
              <template slot-scope="scope">
                  <div class='image' :style="{ backgroundImage: 'url('+scope.row.data.image+')' }" />
              </template>
          </el-table-column>

          <el-table-column prop="name" :label="$t('common.table.name')">
              <template slot-scope="scope">
                  {{ scope.row.name }} <small>(v{{ scope.row.data.version}})</small>
                  <el-tag size="small" :type="$helper.getAppStoreType(scope.row.data.apptype)" style="margin-bottom: 3px;">{{ scope.row.data.apptype }}</el-tag>
                  <br>
                  <el-divider style="margin: 3px 0px" v-if="false" />
                  {{ scope.row.data.desc }} <br>
              </template>
          </el-table-column>

          <el-table-column prop="cusa" :label="$t('common.table.cusa')" width="110" align="center">
              <template slot-scope="scope">
                  <small style="font-size:12px">{{ scope.row.cusa }}</small>
              </template>
          </el-table-column>

          <el-table-column prop="status" :label="$t('common.table.type')" width="120" align="center">
            <template slot-scope="scope">
                <el-tag size="small" plain :type="$helper.getFileStatus(scope.row.status)">{{ $t('queue.status.' + scope.row.status) || scope.row.status }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="size" :label="$t('common.table.size')" width="120" align="right">
            <template slot-scope="scope">
                <el-tag size="small" plain :type="$helper.getFileSizeType(scope.row.size)">{{ scope.row.size }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column :label="$t('common.table.operation')" width="150" align="right">
              <template slot-scope="scope">
                  <el-button circle size="small" icon="fa fa-minus" @click="removeFromQueue(scope.row)" v-if="scope.row.status == 'in queue'" />
                  <el-button circle size="small" icon="el-icon-plus" @click="addToQueue(scope.row)" v-if="scope.row.status != 'in queue'" />
                  <el-button circle size="small" icon="fa fa-cloud-download-alt" @click="check(scope.row.url)" />
                  <el-button circle size="small" icon="fab fa-playstation" @click="isInstalled(scope.row)" />
              </template>
          </el-table-column>
      </el-table>

      <el-pagination layout="prev, pager, next" background
                  :current-page.sync="page" :total="total"
                  :page-size="perPage" />
  </div>

  <el-row :gutter="20" v-if="view == 'box'">
      <el-col :span="4" v-for="(file,i) in packages" :key="'_package_'+i">
        <div class='file border'>
            <div class='title'>{{ file.name }} </div>
            <div class='image' :style="{ backgroundImage: 'url('+file.data.image+')' }" />
        </div>
      </el-col>
  </el-row>


  <template v-if="debug">
      <pre>{{ packages }}</pre>
      <pre>{{ data }}</pre>
      <pre>{{ config }}</pre>
  </template>

</div>
</template>

<script>
import { get } from 'vuex-pathify'

export default {
    name: 'HBStoreLegacy',

    data(){ return {
        debug: false,
        view: 'table',
        page: 1,
        total: 0,
        perPage: 15,
        data: null,
    }},

    watch: {
        page(p){
            this.load(p)
        },
    },

    computed: {
        config: get('app/config'),
        packages(){
            let p = this.data ? this.data.packages : []
            let a = []

            // map hb-store package to item object
            p.map(i => a.push(this.$fs.createItemFromHBLegacy(i, this.config.useHBRoot)) )

            // check if item is in queue
            a.map(file => {
                let fileInQueue = this.$store.getters['queue/isInQueue'](file)
                if(fileInQueue)
                  file.status = fileInQueue.status
            })

            return a
        },

        pages(){
            return this.total ? this.total / this.perPage : 1
        }
    },

    mounted(){
        this.getCount()
        this.load()
    },

    methods: {
        getCount(){
            this.$axios.get(this.config.useHBRoot + 'api.php?count=true')
                .then( ({ data }) => {
                    this.total = parseInt(data.number_rows)
                })
                .catch( e => console.log(e) )
        },

        load(page=1){
            this.$axios.get(this.config.useHBRoot + 'api.php?page='+this.page)
                .then( ({ data }) => {
                    console.log(data)
                    this.data = data
                })
                .catch( e => console.log(e) )
        },

        addToQueue(file){
            let find = this.$store.getters['queue/isInQueue'](file)

            if(!find){
                file.status = 'in queue'
                this.$store.dispatch('queue/addToQueue', file)
            }
            else{
                if(file.status == 'remote')
                  file.status = 'in queue'

                this.$message({
                    message: this.$t('hbstore.messages.alreadyInQueue', { filename: file.name }),
                    type: 'warning'
                })
            }
        },

        removeFromQueue(file){
            if(file.status == 'in queue'){
                this.$store.dispatch('queue/removeFromQueue', file)
            }
            else {
                this.$message({
                    message: this.$t('hbstore.messages.cannotRemove', { filename: file.name }),
                    type: 'warning'
                })
            }
        },

        isInstalled(file){
            const detectionTarget = this.$helper.getInstalledDetectionTarget(this.$store.getters['app/getPS4TargetApp'])

            if(detectionTarget == 'ps5')
                return this.$ps5.isInstalled(file)
                    .then(data => {
                        if(!data || data.res !== 0)
                            throw new Error(data && data.error ? data.error : this.$t('errors.invalidSingleDpiResponse'))

                        const exists = this.$helper.isInstalledDetected(data.exists)
                        if(exists)
                          file.status = 'installed'

                        const message = exists
                            ? this.$t('hbstore.messages.installed')
                            : this.$t('hbstore.messages.notInstalled')
                        const type = exists ? 'warning' : 'success'
                        this.log(message, data)
                        this.$message({ message, type })
                    })
                    .catch( e => {
                        console.log(e)
                        this.$message({ message: e.message || String(e), type: 'error' })
                    })

            if(detectionTarget == 'unsupported')
                return this.$message({ message: this.$t('messages.install.notImplementedPs5'), type: "info" })

            this.$ps4.isInstalled(file)
                    .then( ({ data }) => {
                        const installed = this.$helper.isInstalledDetected(data.exists)
                        if(installed)
                          file.status = 'installed'

                        let { exists, size, type } = data
                        this.log(data.message, { exists, size, type })
                        this.$message({ message: data.message, type: data.type })
                    })
                    .catch( e => {
                        console.log(e)
                    })
        },

        check(url){
            this.$root.openWithAutoclose(url)
        },

    },
}
</script>
