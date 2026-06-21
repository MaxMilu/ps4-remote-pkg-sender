<template>
<div>
    <div class="mb-md">
        {{ $t('debug.filesFound', { count: serverFiles.length }) }} <br>
        {{ $t('debug.filesServing', { count: servingFiles.length }) }} <br>
    </div>

    {{ $t('debug.serverIs') }} <el-tag size="mini" :type="$helper.getServerStatusType(running)">{{ $t('config.server.statusValues.' + running) || running }}</el-tag> {{ $t('debug.on') }} {{ ip }}:{{ port }}<br>

    <br>
    <el-button size="mini" @click="$emit('hearthbeat')"> {{ $t('debug.checkHeartbeat') }} </el-button> {{ hb }} <br>
    <br>
    <el-button size="mini" @click="startServer">{{ $t('debug.startServer') }} </el-button>
    <el-button size="mini" @click="$emit('stopServer')"> {{ $t('debug.stopServer') }} </el-button>
    <el-button size="mini" @click="$emit('restartServer')"> {{ $t('debug.restartServer') }} </el-button>

</div>
</template>

<script>
import { get } from 'vuex-pathify'

export default {
  name: 'Debug',

  computed: {
      ip: get('app/server.ip'),
      port: get('app/server.port'),
      serverFiles: get('server/serverFiles'),
      servingFiles: get('server/servingFiles'),
      running: get('server/status'),
      hb(){
          return 'http://' + this.ip + ':' + this.port + '/hb'
      }
  },

  methods: {
      startServer(){
          if(this.ip.length == 0 || this.port.length == 0){
              let error = "Server cannot start. Please configure IP and Port"
              console.error(error)
              this.$message({ message: error, type: 'error' })
              return
          }

          this.$root.sendServer('start')
      },
  },

}
</script>

<style lang="css" scoped>
</style>
