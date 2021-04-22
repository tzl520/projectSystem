<template>
  <el-popover placement="bottom"
              width="350"
              trigger="click"
              title="系统消息">

    <el-scrollbar style="height:300px">
        <el-card class="box-card" v-for="item in urgingForm" :key="item.id">
          工单编码&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;&nbsp;{{item.workOrderNumber}}
          <span class="tag-el">
          <el-tag type="danger">催办</el-tag>
        </span>
          <br>
          <span class="itemTime">
          {{item.createTime}}</span>
          <el-divider></el-divider>
        </el-card>
    </el-scrollbar>
    <!--    这是消息的小标记-->
    <div slot="reference"  @click="urging">
      <el-badge :value="urgingForm.length">
        <i class="el-icon-bell"></i>
      </el-badge>
    </div>
  </el-popover>
</template>

<script>
import {urgingLook} from "@/api/workorder/hangup";
export default {
  name: "top-notice",
  data () {
    return {
      urgingForm: [],
    }
  },
  created () {
    this.urging()
  },
  methods: {
    urging(){
      urgingLook(JSON.parse(localStorage.getItem('saber-userInfo')).content.user_id).then((res) =>{
        this.urgingForm = res.data.data
        console.log(JSON.parse(localStorage.getItem('saber-userInfo')).content.user_id)
      })
    }
  }
};
</script>

<style lang="scss" scoped>
.tag-el{
  float: right;
  margin-top: -6px;
}
.itemTime{
  display: block;
  margin-top: 5px;
  font-size: 11px;
}
</style>
