<template>
  <basic-container>
    <el-collapse v-model="activeNames">
      <el-collapse-item title="项目基本信息" name="1">
        <template slot="title">
          <div class="item3">项目基本信息<i class="header-icon el-icon-info"></i></div>
        </template>
        <div class="table1">
          <table border="1px">
            <tr>
              <td align="right" colspan="4">
                <el-button type="primary" plain  size="mini" @click="dialogVisible = true">编辑</el-button>
                <el-dialog :visible.sync="dialogVisible" :modal-append-to-body="false"
                  width="45%" dialogTop=15>
                  <avue-form ref="projectForm" v-model="projectForm"
                             :option="projectOption">
                    <template slot="menuForm">
                      <el-button type="primary" @click="projectEdit">修改</el-button>
                      <el-button @click="dialogVisible = false">取消</el-button>
                    </template>
                  </avue-form>
                </el-dialog>
              </td>
            </tr>
            <tr>
              <th class="td1">项目名称：</th>
              <td>{{ projectData.name }}</td>
              <th>项目代码：</th>
              <td>{{ projectData.code }}</td>
            </tr>
            <tr>
              <th>建设性质：</th>
              <td> {{ getDictValueByKey(projectData.constructionNature, constructionNatureDictList)}}</td>
              <th>项目阶段：</th>
              <td>{{getDictValueByKey(projectData.stage,stageDictList)}}</td>
            </tr>
            <tr>
              <th>项目性质：</th>
              <td>{{ getMultipleDictValueByKey(projectData.projectNature, projectNatureDictList)}}</td>
              <th>项目分类：</th>
              <td>{{getDictValueByKey(projectData.classification,classificationDictList)}}</td>
            </tr>
            <tr>
              <th>总投资：</th>
              <td>{{projectData.totalInvestment}}      万元</td>
              <th>项目概算：</th>
              <td>{{projectData.budgetEstimate}}       万元</td>
            </tr>
            <tr>
              <th width="120px">建设规模及描述：</th>
              <td>{{projectData.content}}</td>
              <th>位置信息：</th>
              <td>{{projectData.address}}
              <el-button type="primary" size="mini" plain @click="mapClick(projectData.lonLat)">查看位置</el-button>
              </td>
            </tr>
            <tr>
              <th>建设工期：</th>
              <td>{{ projectData.constructionPeriod }}       天</td>
              <th width="80px">资金来源：</th>
              <td>{{ projectData.sourceFunds }}</td>
            </tr>
            <tr>
              <th>立项日期：</th>
              <td>{{projectData.commencementDate}}</td>
              <th width="120px">计划完工日期：</th>
              <td>{{projectData.completionDate}}</td>
            </tr>
          </table>
        </div>
      </el-collapse-item>
      <el-collapse-item title="项目小组" name="2">
        <template slot="title">
          <div class="item3">项目小组<i class="header-icon el-icon-info"></i></div>
        </template>
        <template>
          <avue-crud ref="projectGroupData"
                     :option="projectGroupOption"
                     :data="projectGroupData"
                     @refresh-change="reloadGroupUserData"
                     @row-save="groupUserSave"
                     @row-update="groupUserUpdate">
            <template slot="userId" slot-scope="scope">
              {{scope.row.$userId}}
              <!--这是变更历史的dialog-->
                <el-button type="primary" size="mini" @click="historyClick(scope.row.projectId)" v-show="scope.row.isProjectPersonLiable===1">变更历史</el-button>
              <el-dialog :visible.sync="historyDialogVisible" width="50%" center :modal-append-to-body="false"  :close-on-click-modal="false">
                <avue-crud ref="form"
                           v-model="historyForm"
                           :option="historyFormOption"
                           :data="historyGroupData"
                >
                </avue-crud>
              </el-dialog>
            </template>
            <template slot="menuLeft">
              <el-button type="success" plain size="mini" @click="centerDialogVisible = true">修改负责人</el-button>
              <el-dialog :visible.sync="centerDialogVisible" width="30%" center :modal-append-to-body="false" top="15%">
                <avue-form ref="form" v-model="responsibleForm"
                           :option="responsibleOption">
                  <template slot="menuForm">
                    <el-button type="primary" @click="handleSubmit">修改</el-button>
                    <el-button @click="centerDialogVisible = false">取消</el-button>
                  </template>
                </avue-form>
              </el-dialog>
            </template>
            <template slot="groupPosition" slot-scope="{ row }">
              <template v-if="row.isProjectPersonLiable === 1">
                <span><el-tag>项目负责人</el-tag></span>
              </template>
              <template v-else>
                <span><el-tag >{{ getMultipleDictValueByKey(row.groupPosition, personnelTypeDictList) }}</el-tag></span>
             </template>
            </template>
            <template slot-scope="{type, size, row, index}" slot="menu">
              <el-button :size="size" :type="type" :disabled="row.isProjectPersonLiable === 1" @click="$refs.projectGroupData.rowEdit(row,index)">编辑</el-button>
              <el-button :size="size" :type="type" :disabled="row.isProjectPersonLiable === 1" @click="handleDelGroupUser(row)">删除</el-button>
            </template>
          </avue-crud>
        </template>
      </el-collapse-item>
      <el-collapse-item title="项目单位" name="3">
        <template slot="title">
          <div class="item3">项目单位<i class="header-icon el-icon-info"></i></div>
        </template>
        <template>
          <avue-crud ref="projectUnitData"
                     :option="projectUnitOption"
                     :data="projectUnitData"
                     @refresh-change="reloadProjectUnitData"
                     @row-save="projectUnitSave"
                     @row-del="projectUnitDel"
                     @row-update="projectUnitUpdate">
          </avue-crud>
        </template>
      </el-collapse-item>
    </el-collapse>
    <el-dialog :visible.sync="mapDialogVisible" width="70%" height="80%" :close-on-click-modal="false" center :modal-append-to-body="false">
      <div style="height: 350px;">
      <div id="container" style="height: 380px;width: 90%;margin-top: 20px;margin-left: 50px"></div>
      </div>
      <span slot="footer">
        <el-button size="mini" @click="mapDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </basic-container>
</template>

<script>
  import { getProjectDetail,projectUpdate } from  '@/api/project/project'
  import { getDictionary } from '@/api/system/dictbiz'
  import { getAllUserList} from "@/api/project/common"
  import {
    removeProjectGroupUser,
    getProjectGroupUserList,
    addGroupUser,
    updateGroupUser,
    getProjectGroupLeaderUserList
  } from '@/api/project/groupUser'
  import { removeProjectUnit, getProjectUnitList, addProjectUnit, updateProjectUnit } from '@/api/project/projectUnit'
  import MapComponent from "@/components/map-component/mapComponent";

export default {
  name: "ProjectInfo",
  components: {MapComponent},
  props: {
    projectId: {
      type: String,
      default: '0'
    }
  },
  data() {
    //校验联系电话
    const constReg= (rule, value, callback) =>{
      const phoneExp = /^((0\d{2,3}-\d{7,8})|(1[3584]\d{9}))$/;
      setTimeout(()=>{
        if(value !== undefined && value !==''){
          if ((!phoneExp.test(value)) && value !== '') {
            callback(new Error('请输入正确的格式！'));
          } else {
            callback();
          }
        }else{
          callback()
        }
      },100)
    }
    //校验输入内容
    let inputContentReg = (rule, value, callback) => {
      let regExp = /^[\\s，。、（）：；/:,;\u4e00-\u9fa5A-Za-z0-9]{0,}$/;
      setTimeout(()=>{
        if(value !== undefined && value !== ''){
          if (!regExp.test(value)) {
            callback(new Error('您输入了非法字符，请重新输入!'));
          } else {
            callback();
          }
        }else{
          callback()
        }

      },100)

    }
    // 校验数字框 方法规则
    const checkNumber = (rule, value, callback) => {
      setTimeout(() => {
        // 判断值是否为数字或小数
        if (!Number.isFinite(Number(value))) {
          callback(new Error('请输入数字值'))
        } else {
          callback()
        }
      }, 100)
    }
    return {
      dialogVisible: false,
      historyDialogVisible: false,
      centerDialogVisible: false,
      formLabelWidth: '100px',
      activeNames: ['1'],
      projectMapMarker: undefined,
      size:'mini',
      mapLocal:undefined,
      projectData: {
        id: '',
        name: '',
        code: '',
        constructionPeriod:'',
        constructionNature: '',
        projectNature: '',
        stage:'',
        classification:'',
        totalInvestment:'',
        budgetEstimate:'',
        content:'',
        sourceFunds:'',
        commencementDate:'',
        completionDate:''
      },
      projectGroupData:[],
      historyGroupData:[],
      mapDialogVisible: false,
      projectUnitData:[],
      personnelTypeDictList: [],
      constructionNatureDictList: [],
      projectNatureDictList: [],
      stageDictList:[],
      classificationDictList:[],
      projectForm:{},
      responsibleForm:{},
      historyForm: {},
      historyFormOption:{
        size: 'mini',
        addBtn: false,
        // dialogClickModal: false,
        // 表格上方的显隐按钮
        columnBtn: false,
        menu:false,
        refreshBtn:false,
        align:'center',
        column:[
          {
            label:'原负责人',
            prop:'originalData',
            dicUrl: "/api/blade-user/userNameList",
            props: {
              label: "name",
              value: "id"
            },
          },
          {
            label: "添加时间",
            prop: 'originalCreateTime',
            type: 'date',
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd'
          },
          {
            label: "现负责人",
            dicUrl: "/api/blade-user/userNameList",
            props: {
              label: "name",
              value: "id"
            },
            prop: 'changeData',
          },
          {
            label: "更改时间",
            type: 'date',
            prop: 'updateTime',
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd'
          },
          {
            label: "修改人",
            prop: 'updateUser',
            dicUrl: "/api/blade-user/userNameList",
            props: {
              label: "name",
              value: "id"
            },
          },
        ]
      },
      projectGroupOption:{
        index: true,
        indexLabel:'序号',
        border:true,
        delBtn: false,
        editBtn:false,
        columnBtn:false,
        size: 'mini',
        align:'center',
        menuWidth: 140,
        dialogWidth: '35%',
        column:[
          {
            label:'成员',
            prop:'userId',
            slot: true,
            type: 'select',
            dicData: [],
            span: 24,
            props: {
              label: "memberInfo",
              value: "userId"
            },
            rules: [{
              required: true,
              trigger: "blur"
            }],
            filterable: true
          },
          {
            label:'职务',
            prop:'groupPosition',
            multiple:true,
            slot: true,
            span: 24,
            type: 'select',
            filterable: true,
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=personnel_type",
            props: {
              label: "dictValue",
              value: "dictKey"
            },
            rules: [{
              required: true,
              trigger: "blur"
            }],
          }
        ]
      },
      projectUnitOption:{
        index: true,
        indexLabel:'序号',
        border:true,
        size:'mini',
        searchShow: true,
        columnBtn:false,
        menuWidth:150,
        labelWidth:120,
        align:'center',
        dialogWidth: '40%',
        column:[
          {
            label:'单位名称',
            prop:'unitName',
            rules: [{
              required: true,
              validator:inputContentReg,
              trigger: "change",
            }]
          },
          {
            label:'单位联系人',
            prop:'unitContact',
            rules: [{
              required: true,
              validator:inputContentReg,
              trigger: "change",
            }]
          },
          {
            label:'联系方式',
            prop:'contactMobile',
            rules: [{
              required: true,
              validator:constReg,
              trigger: "change",
            }]
          },
          {
            label:'单位类型',
            prop:'unitType',
            type: "select",
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=project_unit_type",
            props: {
              label: "dictValue",
              value: "dictKey"
            }
          },
          {
            label:'备注',
            prop:'remarks',
            rules: [{
              validator:inputContentReg,
              trigger: "change",
            }],
            span:24
          }
        ]
      },
      responsibleOption:{
        labelWidth:100,
        size:'mini',
        emptyBtn: false,
        submitBtn:false,
        column:[
          {
            label:'项目负责人',
            prop:'userId',
            type: 'select',
            dicData: [],
            span: 24,
            props: {
              label: "memberInfo",
              value: "userId"
            },
            rules: [{
              required: true,
              trigger: "blur"
            }],
            filterable: true
          }
        ]
      },
      projectOption:{
        size:'mini',
        emptyBtn: false,
        submitBtn:false,
        column:[
          {
            label: "项目名称",
            prop: "name",
            rules: [{
              required: true,
              message: "请选择预设项目",
              trigger: "change"
            }],
            dicData: [],
            filterable: true
          },
          {
            label: "项目代码",
            prop: "code",
            placeholder: '自动填充',
            readonly: true,
          },
          {
            label: "建设性质",
            prop: "constructionNature",
            rules: [{
              required: true,
              message: "请选择建设性质",
              trigger: "change"
            }],
            type: "select",
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=construction_nature",
            props: {
              label: "dictValue",
              value: "dictKey"
            }
          },
          {
            label: "项目阶段",
            prop: "stage",
            rules: [{
              required: true,
              message: "请选择项目阶段",
              trigger: "change"
            }],
            type: "select",
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=stage",
            props: {
              label: "dictValue",
              value: "dictKey"
            }
          },
          {
            label: "项目性质",
            prop: "projectNature",
            rules: [{
              required: true,
              message: "请选择项目性质",
              trigger: "change"
            }],
            type: "select",
            multiple: true,
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=project_nature",
            props: {
              label: "dictValue",
              value: "dictKey"
            }
          },
          {
            label: "项目分类",
            prop: "classification",
            rules: [
              {
                required: true,
                message: "请选择项目分类",
                trigger: "change"
              }
            ],
            type: "select",
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=project_classification",
            props: {
              label: "dictValue",
              value: "dictKey"
            }
          },
          {
            label: "总投资",
            prop: "totalInvestment",
            rules: [
              {
                required: true,
                message: "请输入总投资",
                trigger: "blur"
              },
              {
                validator: checkNumber,
                trigger: "blur"
              }
            ],
            append: '万元'
          },
          {
            label: "项目概算",
            prop: "budgetEstimate",
            rules: [
              {
                required: true,
                message: "项目概算只能是数字",
                trigger: "blur"
              },
              {
                validator: checkNumber,
                trigger: "blur"
              }
            ],
            append: '万元'
          },
          {
            label: "建设规模及描述",
            prop: "content",
            rules: [{
              required: true,
              validator:inputContentReg,
              trigger: "change",
            }],
            // labelWidth: 130,
            type: 'textarea',
            span: 24
          },
          {
            label: "开工日期",
            prop: "commencementDate",
            rules: [{
              required: true,
              message: "请选择开工日期",
              trigger: "change"
            }],
            type: 'date',
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd'
          },
          {
            label: "竣工日期",
            prop: "completionDate",
            rules: [
              {
                // validator: checkCompletionDate,
                trigger: "change"
              }
            ],
            type: 'date',
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd'
          },
          {
            label:'资金来源',
            prop:'sourceFunds',
            rules: [{
              validator:inputContentReg,
              trigger: "change",
            }]
          },
        ]
      }
    }
  },
  watch: {
    projectId(newVal, oldVal) {
      if (newVal != oldVal) {
        this.initData()
        this.initDictionary()
      }
    }
  },
  mounted() {
    if (this.projectId === undefined || this.projectId.trim() === ''){
      this.projectId = this.$route.params.projectId
    }
    this.initData()
    this.initDictionary()
  },
  methods: {
    initMap(lng,lat) {
      this.mapLocal = new AMap.Map("container", {
        resizeEnable: true,
        //禁止拖动地图
        // dragEnable: false,
        //禁止放大地图
        // zoomEnable:false,
        center: [lng,lat],
        zoom: 16,//地图显示的缩放级别
      })
      const projectMapMarker =  new AMap.Marker({
        position: [lng, lat],
        icon: 'https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
      })
      // 添加点标记在地图上
      projectMapMarker.setMap(this.mapLocal)
    },
    // 变更历史的方法
    historyClick(pid){
      this.projectId = pid
      this.historyDialogVisible = true
      getProjectGroupLeaderUserList(this.projectId).then(res =>{
        this.historyGroupData = res.data.data
        console.log(this.historyGroupData)
      })
    },
    initData() {
      getProjectDetail(this.projectId).then(res => {
        const data = res.data.data
        this.projectData = Object.assign(this.projectData,data.project)
        this.projectData.totalInvestment = Number(this.projectData.totalInvestment) / 100 / 10000
        this.projectData.budgetEstimate = Number(this.projectData.budgetEstimate) / 100 / 10000
        this.projectForm = Object.assign({},this.projectData)
        this.projectGroupData = data.projectCoordinationGroupVOList
        if (this.projectGroupData.length > 0) {
          this.responsibleForm = Object.assign({},this.projectGroupData[0])
        }
        this.projectUnitData = data.projectUnitInfoList
      })
      getAllUserList().then(res => {
        this.projectGroupOption.column[0].dicData = res.data.data
        this.responsibleOption.column[0].dicData = res.data.data
      })
    },
    initDictionary() {
      // 获取人员类型业务字典数据
      getDictionary({ 'code': 'personnel_type'}).then(res => {
        this.personnelTypeDictList = res.data.data
      })
      // 获取建设类型业务字典数据
      getDictionary({ 'code': 'construction_nature'}).then(res => {
        this.constructionNatureDictList = res.data.data
      })
      // 获取项目性质业务字典数据
      getDictionary({ 'code': 'project_nature'}).then(res => {
        this.projectNatureDictList = res.data.data
      })
      // 获取项目阶段业务字典数据
      getDictionary({ 'code': 'stage'}).then(res => {
        this.stageDictList = res.data.data
      })
      // 获取项目分类业务字典数据
      getDictionary({ 'code': 'project_classification'}).then(res => {
        this.classificationDictList = res.data.data
      })
    },
    getDictValueByKey(key, dictData) {
      if (!(dictData instanceof Array)) {
        return ''
      }
      for(const dict of dictData) {
        if ((key + '') === dict.dictKey) {
          return dict.dictValue
        }
      }
      return ''
    },
    //多选
    getMultipleDictValueByKey(key, dictData) {
      if (!(dictData instanceof Array)) {
        return ''
      }
      if (key === undefined || key === '') {
        return ''
      }
      let value = ''
      const keys = key.split(',') // [ '2', '3','4']
      for (const k of keys) {
        // console.log('keys循环当前key是',k)
        dictDataFor:for(const dict of dictData) {
          // console.log('dictData循环当前dictKey是',dict.dictKey)
          if (k === dict.dictKey) {
            if (value !== '') {
              value += '|'
            }
            value += dict.dictValue
            break dictDataFor
          }
        }
      }
      return value
    },
    handleDelGroupUser(row) {
      // 删除项目协调小组成员
      if (row.isProjectPersonLiable === 1) {
        this.$message({
          type: "warning",
          message: "不能删除项目负责人"
        })
      } else {
        this.$confirm("确定将【" + row.userName + "】从当前小组删除吗?", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          return removeProjectGroupUser(row.id)
        }).then(res => {
          if (res.data.success) {
            this.$message({
              type: "success",
              message: "操作成功!"
            })
            this.reloadGroupUserData()
          } else {
            this.$message({
              type: "error",
              message: res.data.msg
            })
          }
        })
      }
    },
    reloadGroupUserData() {
      // 刷新项目协调小组数据
      getProjectGroupUserList(this.projectData.id).then(res => {
        this.projectGroupData = res.data.data
        console.log('8888',this.projectGroupData)
      })
    },
    reloadProjectUnitData() {
      // 刷新项目单位数据
      getProjectUnitList(this.projectData.id).then(res => {
        this.projectUnitData = res.data.data
      })
    },
    groupUserSave(row, done, loading) {
      row['projectId'] = this.projectData.id
      row['isProjectPersonLiable'] = 0
      row.groupPosition = row.groupPosition.join(',')
      addGroupUser(row).then(() => {
        this.reloadGroupUserData();
        this.$message({
          type: "success",
          message: "操作成功!"
        });
        done();
      }, error => {
        loading();
        window.console.log(error);
      });
    },
    groupUserUpdate(row, index, done, loading) {
      console.log("小组成员修改=======",row);
      updateGroupUser(row).then(() => {
        this.reloadGroupUserData();
        this.$message({
          type: "success",
          message: "操作成功!"
        });
        done();
      }, error => {
        loading();
        console.log(error);
      });
    },
    projectUnitDel(row) {
      this.$confirm("确定将选择数据删除?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        return removeProjectUnit(row.id);
      }).then(() => {
        this.reloadProjectUnitData();
        this.$message({
          type: "success",
          message: "操作成功!"
        });
      });
    },
    projectUnitSave(row, done, loading) {
      row['projectId'] = this.projectData.id
      addProjectUnit(row).then(() => {
        this.reloadProjectUnitData();
        this.$message({
          type: "success",
          message: "操作成功!"
        });
        done();
      }, error => {
        loading();
        window.console.log(error);
      });
    },
    projectUnitUpdate(row, index, done, loading) {
      updateProjectUnit(row).then(() => {
        this.reloadProjectUnitData();
        this.$message({
          type: "success",
          message: "操作成功!"
        });
        done();
      }, error => {
        loading();
        console.log(error);
      });
    },
    handleSubmit(){
      updateGroupUser(this.responsibleForm).then(res => {
        this.reloadGroupUserData();
        if(res.data.success){
          this.$message({
            type: "success",
            message: res.data.msg
          });
          this.centerDialogVisible = false
        }else{
          this.$message({
            type: "error",
            message: res.data.msg
          });
        }
      })
    },
    projectEdit(row){
      this.projectForm['totalInvestment'] = Number(this.projectForm['totalInvestment']) * 100 * 10000
      this.projectForm['budgetEstimate'] = Number(this.projectForm['budgetEstimate']) * 100 * 10000
      projectUpdate(this.projectForm).then(res => {
        row['projectPersonLiable'] = undefined
        this.initData();
        if(res.data.success){
          this.$message({
            type: "success",
            message: res.data.msg
          });
          this.dialogVisible = false
        }else{
          this.$message({
            type: "error",
            message: res.data.msg
          });
        }
      })
    },
    mapClick(lonLat){
      let num1 = new Array()
      num1 = lonLat.split(',')
      this.mapDialogVisible = true
      //打印出来的黑色数字是字符串，蓝色的才是数字
      const longitude = Number(num1[0])//经度
      const latitude = Number(num1[1])//纬度
      // 定义点标记对象
      this.$nextTick(() => {
        this.initMap(longitude,latitude)
      })
    }
  }
}
</script>

<style scoped>
  .table1 table{
    width: 100%;
    height: 250px;
    border: 1px;
    border-color: #e1e3e5;
  }
  .table1 table th{
    text-align: right;
    background-color: rgba(225, 227, 229, 0.2);
  }
  .item3{
    font-size: 18px;
    font-weight: bold;
  }

</style>
