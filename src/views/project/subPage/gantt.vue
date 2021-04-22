<template>
  <div class="echarts">
    <div class="block">
      <el-row>
        <el-col span="6">
          <el-select v-model="nodePersonLiable"
                     filterable
                     clearable
                     placeholder="请选择节点负责人">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-col>
        <el-col span="6">
          <el-select v-model="nodeStatus"
                     filterable
                     clearable
                     style="margin-left: -50px"
                     placeholder="节点状态">
            <el-option
              v-for="item in statusList"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-col>
        <el-col span="6">
          <el-date-picker
            v-model="value"
            type="daterange"
            align="center"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions"
            @change="dataChage"
            style="margin-left: -20px">
          </el-date-picker>
        </el-col>
        <el-col span="6">
          <el-button type="primary" style="margin-left: 105px" @click="viewClick">查询</el-button>
          <el-button @click="cleanClick">清空</el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-col span="24">
          <div id="main" style="width:100%;height: 600px;"></div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
  import * as echarts from 'echarts';
  import {getNodeGanttList, getNodeSearch} from '@/api/project/nodePlan'
  import {getNodePersonLiableList, getNodeStatus} from '@/api/project/gantt'
  import { getDictionary } from '@/api/system/dictbiz'

  export default {
    name: "Gantt",
    props: {
      projectId: {
        type: String,
        default: '0'
      }
    },
    data() {
      return {
        data: [],
        yAxisData: [],
        seriesData1: [],
        seriesData2: [],
        seriesData3: [],
        seriesData4: [],
        options: [],
        nodePersonLiable: {},
        startDate: '',
        endDate: '',
        value: '',
        myChart: undefined,
        nodeStatus: {},
        statusList: [],
        planningNodeDictList: [],
        workTypeDictList: [],
        myChartOption: undefined
      }
    },
    computed: {},
    mounted() {
      if (this.projectId === undefined || this.projectId.trim() === '') {
        this.projectId = this.$route.params.projectId
      }
      this.initData()
      getDictionary({ code: 'planning_node'}).then(res => {
        this.planningNodeDictList = res.data.data
      })
      getDictionary({ code: 'work_type'}).then(res => {
        this.workTypeDictList = res.data.data
      })
    },
    methods: {
      initData() {
        const that = this
        // 基于准备好的dom，初始化echarts实例
        that.myChart = echarts.init(document.getElementById('main'));
        getNodeGanttList(this.projectId).then(res => {
          this.data = res.data.data
          // var i = 0;
          for (const data of this.data) {
            this.yAxisData.push(data.nodeName)
            this.seriesData2.push(new Date(data.plannedStartDate))
            this.seriesData1.push(new Date(data.plannedCompletionDate))
            this.seriesData4.push(new Date(data.actualStartDate))
            this.seriesData3.push(new Date(data.actualFinishingDate))
          }
          console.log(this.data)
          that.myChartOption = {
            backgroundColor: "#fff",
            title: {
              subtextStyle: {
                fontSize: 13,
                fontWeight: "bolder"
              }
            },
            legend: {
              data: ["计划时间", "实际时间"],
              align: "right",
              right: 80,
              top: 50
            },
            dataZoom: [//给x轴设置滚动条
              {
                start: 0,//默认为0
                end: 100 - 1500 / 31,//默认为100
                type: 'slider',
                maxValueSpan: 8,//窗口的大小，显示数据的条数的
                show: true,
                handleSize: 0,//滑动条的 左右2个滑动条的大小
                height: '80%',//组件高度
                // left: 1000, //左边的距离
                // right: 15,//右边的距离
                top: 50,//右边的距离
                borderColor: "rgba(43,48,67,.8)",
                fillerColor: '#33384b',
                backgroundColor: 'rgba(43,48,67,.8)',//两边未选中的滑动条区域的颜色
                showDataShadow: false,//是否显示数据阴影 默认auto
                showDetail: false,//即拖拽时候是否显示详细数值信息 默认true
                realtime: true, //是否实时更新
                filterMode: 'filter',
                yAxisIndex: [0, 1],//控制的 y轴
              },
              //下面这个属性是里面拖到
              {
                type: 'inside',
                show: false,
                yAxisIndex: [0, 1],
                start: 1,//默认为1
                end: 100 - 1500 / 31,//默认为100
              },
            ],
            grid: {
              containLabel: true,
              show: false,
              right: 130,
              left: 40,
              bottom: 40,
              top: 90
            },
            xAxis: {
              type: "time",
              axisLabel: {
                "show": true,
                "interval": 0
              }
            },
            yAxis: {
              axisLabel: {
                show: true,
                interval: 0,
                formatter: function (value) {
                  var last = ""
                  var max = 5;
                  var len = value.length;
                  var hang = Math.ceil(len / max);
                  if (hang > 1) {
                    for (var i = 0; i < hang; i++) {
                      var start = i * max;
                      var end = start + max;
                      var temp = value.substring(start, end) + "\n";
                      last += temp; //凭借最终的字符串
                    }
                    return last;
                  } else {
                    return value;
                  }
                }
              },
              data: this.yAxisData
            },
            tooltip: {
              trigger: "axis",
              formatter: function (params) {
                console.log(params,2)
                const index = params[0].dataIndex
                const tempData = that.data[index]
                var res = "";
                var name = "";
                var start0 = "";
                var start = "";
                var end0 = "";
                var end = "";
                for (var i in params) {
                  var k = i % 2;
                  if (!k) { //偶数
                    start0 = params[i].data;
                    if (isNaN(start0.getFullYear())) {
                      start = '0'
                    } else {
                      start = start0.getFullYear() + "-" + (start0.getMonth() + 1) + "-" + start0.getDate();
                    }
                  }
                  if (k) { //奇数
                    name = params[i].seriesName;
                    end0 = params[i].data;
                    if (isNaN(end0.getFullYear())) {
                      end = '0'
                    } else {
                      end = end0.getFullYear() + "-" + (end0.getMonth() + 1) + "-" + end0.getDate();
                    }
                    res += name + " : " + end + "~" + start + "</br>";
                  }
                }
                res += '节点状态：' + that.getDictValue(that.planningNodeDictList,tempData.nodeStatus) + '</br>'
                  + '工作类型: ' + that.getDictValue(that.workTypeDictList,tempData.jobType) + '</br>'
                  + '工作内容: ' + (tempData.jobContent || '');

                return res;
              }
            },
            series: [
              {
                name: "计划时间",
                type: "bar",
                stack: "总量0",
                label: {
                  normal: {
                    show: true,
                    color: "#000",
                    position: "right",
                    formatter: function (params) {
                      return params.seriesName
                    }
                  }
                },
                itemStyle: {
                  normal: {
                    color: "skyblue",
                    borderColor: "#fff",
                    borderWidth: 2
                  }
                },
                zlevel: -1,
                data: that.seriesData1
              },
              {
                name: "计划时间",
                type: "bar",
                stack: "总量0",
                itemStyle: {
                  normal: {
                    color: "white",
                  }
                },
                zlevel: -1,
                z: 3,
                data: that.seriesData2
              },
              {
                name: "实际时间",
                type: "bar",
                stack: "总量5",
                label: {
                  normal: {
                    show: true,
                    color: "#000",
                    position: "right",
                    formatter: function (params) {
                      return params.seriesName
                    }
                  }
                },
                itemStyle: {
                  normal: {
                    color: "yellow",
                    borderColor: "#fff",
                    borderWidth: 2
                  }
                },
                zlevel: -1,
                data: that.seriesData3
              },
              {
                name: "实际时间",
                type: "bar",
                stack: "总量5",
                itemStyle: {
                  normal: {
                    color: "white",
                  }
                },
                zlevel: -1,
                z: 3,
                data: that.seriesData4
              }
            ]
          }
          // 绘制图表
          that.myChart.setOption(that.myChartOption);
        })
        //选择节点负责人
        this.nodePersonLiable = ''
        getNodePersonLiableList(this.projectId).then(res => {
          let dataList = res.data.data
          for (let data of dataList) {
            this.options.push({label: data.userName, value: data.userId})
          }
        })
        this.nodeStatus = ''
        getNodeStatus().then(res => {
          let status = res.data.data
          for (let data of status) {
            this.statusList.push({label: data.dictValue, value: data.dictKey})
          }
        })
      },
      dataChage(val){
        this.startDate = val[0]
        this.endDate = val[1]
      },
      viewClick() {
        const that = this
        console.log(2,that.myChart)
        that.yAxisData = []
        that.seriesData2 = []
        that.seriesData1 = []
        that.seriesData4 = []
        that.seriesData3 = []
        getNodeSearch(this.projectId, this.nodePersonLiable, this.nodeStatus, this.startDate, this.endDate).then(res => {
          that.data = res.data.data
          console.log('nodedqw1211',that.data);
          for (const data of that.data) {
            that.yAxisData.push(data.nodeName)
            that.seriesData2.push(new Date(data.plannedStartDate))
            that.seriesData1.push(new Date(data.plannedCompletionDate))
            that.seriesData4.push(new Date(data.actualStartDate))
            that.seriesData3.push(new Date(data.actualFinishingDate))
          }
          if (that.myChartOption !== undefined) {
            that.myChartOption.yAxis.data = that.yAxisData
            that.myChartOption.series[0].data = that.seriesData1
            that.myChartOption.series[1].data = that.seriesData2
            that.myChartOption.series[2].data = that.seriesData3
            that.myChartOption.series[3].data = that.seriesData4
            that.myChart.setOption(that.myChartOption, true);
          }
        })
      },
      cleanClick() {
        this.nodePersonLiable = ''
        this.nodeStatus = ''
        this.startDate = ''
        this.endDate = ''
        this.value = ''
      },
      getDictValue(dictList, value) {
        for (const dict of dictList) {
          if (dict.dictKey === (value + '')) {
            return dict.dictValue
          }
        }
        return ''
      }
    }
  }
</script>

<style scoped>
  .echarts {
    padding: 0 auto;
  }

  .block {
    text-align: center;
    margin-bottom: 5px;
  }
</style>



