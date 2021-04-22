<template>
<div>
  <el-row :gutter="20" style="margin-left: 10px">
    <div style="height: 50px">
    <ul class="rightTip">
      <li class="leftTip">项目进度完成百分比:{{ (workConditon.finishPercentage*100).toFixed(2)+'%' }}</li>
      <li class="leftTip">任务总数:{{ workConditon.workTotal }}</li>
      <li class="leftTip">已完成:{{ workConditon.finishTotal }}</li>
      <li class="leftTip">未完成:{{ workConditon.notFinishTotal }}</li>
    </ul>
    </div>
    <el-col v-for="item in workConditonList" :key="item" :span="8">
      <el-card shadow="hover"
               class="box-card"
               :body-style="{ padding: '0px' }"
               >
        <div slot="header" >
          <span style="font-size: 18px;color: black;font-weight: bold">{{ item.stageName}}</span>
          <el-button size="mini" type="text" style="float: right;" @click="timeSetting(item.stageName)">时间设置</el-button>
        </div>
        <div class="text item">
          <div style="height: 40px;width: 250px;float: left;">
          <span>工作项共计：</span><span>{{item.workTotal}}</span>
            <span style="float: right">未完成：{{ item.notFinishTotal }}</span>
          </div>
          <div style="height: 40px;width: 250px;float: left;">
            <span style="float: left">{{'完 成 工 作：' + item.finishTotal}}</span>
          </div>
          <div style="height: 40px;width: 250px;float: left;">
            <span>{{'计划时间：'+ item.planStartDate}}</span>
            <span>&nbsp;{{'至 '+item.planEndDate}}</span><br>
          </div>
          <div style="height: 30px;width: 250px;float: left;">
            <span style="float: left">{{'实际时间：'+ item.realityStartDate}}</span>
            <span>&nbsp;{{'至 '+item.realityEndDate}}</span>
          </div>
        </div>
      </el-card>
      <el-dialog
        :visible.sync="dialogVisible"
        width="50%"
        top="10%"
        :close-on-click-modal="false"
        :modal="false"
      >
        <avue-form :option="dialogFormOption" v-model="dialogForm" ref="dialogForm"></avue-form>
        <span slot="footer" class="dialog-footer">
        <el-button @click="timeUpdate" type="primary" size="mini">修改</el-button>
        <el-button @click="dialogVisible = false" size="mini">取 消</el-button>
      </span>
      </el-dialog>
    </el-col>
  </el-row>
</div>
</template>

<script>
import {getWorkList, getWorkTimeDetail, getWorkTimeUpdate} from "@/api/project/workSituation";
import {getStageNameList} from "@/api/workorder/common";

export default {
  name: "WorkSituation",
  props: {
    projectId: {
      type: String,
      default: '0'
    }
  },
  data() {
    const checkPlannedCompletionDates = (rule, value, callback) => {
      setTimeout(() => {
        // 只有当竣工日期选择了之后才进行校验
        if (value !== undefined && value !== '') {
          // 获取开工日期
          const {planStartDate} = this.dialogForm
          // 判断是否已经选择了开工日期，没有则提示请先选择开工日期
          if (planStartDate !== undefined && planStartDate !== '') {
            const begin = new Date(planStartDate);
            const end = new Date(value);
            if (end - begin <= 0) {
              callback(new Error('完成日期必须在开始日期之后'))
            } else {
              callback()
            }
          } else {
            callback(new Error('请先选择开始日期'))
          }
        } else {
          callback()
        }
      }, 100)
    }
    // const checkPlannedCompletionDate = (rule, value, callback) => {
    //   setTimeout(() => {
    //     // 只有当竣工日期选择了之后才进行校验
    //     if (value !== undefined && value !== '') {
    //       // 获取开工日期
    //       const {realityStartDate} = this.dialogForm
    //       // 判断是否已经选择了开工日期，没有则提示请先选择开工日期
    //       if (realityStartDate !== undefined && realityStartDate !== '') {
    //         const begin = new Date(realityStartDate);
    //         const end = new Date(value);
    //         if (end - begin <= 0) {
    //           callback(new Error('完成日期必须在开始日期之后'))
    //         } else {
    //           callback()
    //         }
    //       } else {
    //         callback(new Error('请先选择开始日期'))
    //       }
    //     } else {
    //       callback()
    //     }
    //   }, 100)
    // }
    return {
      nodeStage: '',
      dialogForm: {
        planStartDate: '',
        planEndDate: '',
        realityStartDate: '',
        realityEndDate: ''
      },
      stageNameList: [],
      dialogVisible: false,
      workConditonList: [],
      workConditon: {},
      id: '',
      dialogFormOption: {
        submitBtn: false,
        emptyBtn: false,
        column: [
          {
            label: "计划开始时间",
            prop: "planStartDate",
            placeholder: ' ',
            labelWidth: 130,
            type: 'date',
            rules: [
              {
                required: true,
                message: "请选择日期",
                trigger: "blur"
              }],
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd',
          },
          {
            label: "计划结束时间",
            prop: "planEndDate",
            placeholder: ' ',
            labelWidth: 130,
            type: 'date',
            rules: [
              {
                required: true,
                message: "请选择日期",
                trigger: "blur"
              },
              {
                validator: checkPlannedCompletionDates,
                trigger: "blur"
              }
            ],
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd',
          },
          {
            label: "实际开始时间",
            prop: "realityStartDate",
            placeholder: ' ',
            labelWidth: 130,
            type: 'date',
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd',
          },
          {
            label: "实际结束时间",
            prop: "realityEndDate",
            placeholder: ' ',
            labelWidth: 130,
            type: 'date',
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd',
          },
        ]
      }
    }
  },
  mounted() {
   this.onLoading()
  },
  methods: {
    onLoading(){
      getWorkList(this.projectId).then(res => {
        this.workConditon = res.data.data.workConditon
        this.workConditonList = res.data.data.workConditonList
      })
    },
    timeSetting(stageName) {
      this.dialogVisible = true
      if (this.$refs.dialogForm !== undefined) {
        this.$refs.dialogForm.resetForm
        this.$refs.dialogForm.resetFields
      }
      for(const workId of this.workConditonList) {
        if (workId.stageName === stageName) {
          console.log(workId.stageName, stageName)
          if (workId.id === -1) {
            this.id = ''
          } else {
            this.id = workId.id
          }
          console.log(this.id)
        }
      }
      getStageNameList().then(res=>{
        this.stageNameList = res.data.data
        for(const stage of this.stageNameList){
          if(stageName === stage.dictValue ){
            this.nodeStage = stage.dictKey
            return this.nodeStage
          }
        }
      })
      getWorkTimeDetail(this.id).then(res => {
        this.dialogForm = res.data.data
        console.log(this.dialogForm)
      })
    },
    timeUpdate() {
      getWorkTimeUpdate(this.id, this.projectId,this.nodeStage, this.dialogForm.planStartDate, this.dialogForm.planEndDate, this.dialogForm.realityStartDate, this.dialogForm.realityEndDate).then(res => {
        const type = res.data.success ? "success" : "error"
        this.$message({
          message: res.data.msg,
          type: type
        })
        //放在接口外面的话调接口的是异步，this.onLoading是同步所以无法实现刷新，放进来一起异步才可以实时刷新
        this.onLoading()
        this.dialogVisible = false
      })
     }
  }
}
</script>

<style scoped>
.text {
  font-size: 14px;
  color: #0e0e0e;
}
  .box-card{
    background-color: #FFFFFF;
    height: 250px;
  }
.rightTip{
  text-align: center;
  list-style: none;
  margin-left: 10px;
  font-size: 18px;
  font-weight: bolder;
  font-family: '微软雅黑';
  margin-bottom: 20px;
}
.leftTip{
  float: left;
  margin-left: 50px;
  margin-bottom: 30px;
}
</style>
