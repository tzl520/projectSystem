<template>
  <el-form :inline="true">
    <el-input placeholder="请选择地点" v-model="projectInput.position"></el-input>
    <el-row :gutter="20">
      <el-col :span="8" >
        <el-select
          v-model="tipInput"
          class="tipInput"
          filterable
          remote
          reserve-keyword
          clearable
          placeholder="搜索地点"
          :remote-method="remoteMethod"
          :loading="loading"
          @change="tipChange">
          <el-option
            v-for="item in tips"
            :key="item.id"
            :label="item.name"
            :value="item.id">
            <span style="float: left">{{ item.name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.district }}</span>
          </el-option>
        </el-select>
      </el-col>
    </el-row>
    <!--    高德地图自带的，是获取id的值不是获取class -->
    <div id="a-map" style="height: 450px;width: 100%">
    </div>
  </el-form>
</template>

<script>
import axios from "axios";

export default {
  name: "mapComponent",
  data () {
    return {
      tipInput : '',
      loading: false,
      map: undefined,
      tips: [],
      projectMap: undefined,
      projectMapMarker: undefined, // 地图标点组件
      projectInput: {
        position: '',
        lonLat: ''
      },
    }
  },
  mounted () {
    this.initMap()
  },
  methods: {
    initMap() {
      this.map = new AMap.Map("a-map", {
        resizeEnable: true,
        zoom: 13,//地图显示的缩放级别
        keyboardEnable: false
      });
        this.map.on('click', this.mapClick)
    },
    mapClick(e) {
      // 地图点击事件
      if (this.map !== undefined) {
        if (this.projectMapMarker !== undefined) {
          // 如果点标记已存在则先移除原点
          this.map.remove(this.projectMapMarker);
          this.projectInput.lonLat = ''
          this.projectInput.position = ''
        }
        // 定义点标记对象
        this.projectMapMarker =  new AMap.Marker({
          position: new AMap.LngLat(e.lnglat.lng, e.lnglat.lat)
        })
        this.projectInput.lonLat = e.lnglat.lng+','+e.lnglat.lat
        // 添加点标记在地图上
        this.map.add(this.projectMapMarker)
        // 逆地址解析
        axios.get('/maprestapi/v3/geocode/regeo', {
          params: {
            key: '6bfac3160868f2eacbde16c6f99f6522',
            location: this.projectInput.lonLat
          }
        }).then(res => {
          if (res.status === 200) {
            //将res.data......赋值给this.projectInput.position
            this.projectInput.position = res.data.regeocode.formatted_address
            this.$emit('clickMap',this.projectInput)
          }
          // const dataPosition = Object.assign(this.projectInput.position,this.projectInput.lonLat)
        })
      }
    },
    tipChange(value) {
      //打印出来搜索的十条数据并且定位跳转到搜索的地点
      for (const tip of this.tips) {
        if (value === tip.id) {
          this.map.setZoom(18)
          this.map.setCenter(tip.location)
          break
        }
      }
    },
    //远程搜索
    remoteMethod(query) {
      if (query !== '') {
        this.loading = true;
        //this指代的是window所以需要解决指代不明的问题
        console.log(window)
        console.log(this)
        const that = this
        AMap.plugin('AMap.Autocomplete', function(){
          // 实例化Autocomplete
          const autoOptions = {
            city: '长沙'
          }
          const autoComplete = new AMap.Autocomplete(autoOptions);
          autoComplete.search(query, function(status, result) {
            // 搜索成功时，result即是对应的匹配数据
            that.tips = result.tips || []
            that.loading = false;
          })
        })
      } else {
        this.tips = [];
      }
    }
  }
}
</script>

<style scoped>

.tipInput {
  position: fixed;
  z-index: 999;
  margin-top: 20px;
  margin-left: 20px;
  width: 300px;
}
</style>
