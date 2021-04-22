<template>
  <basic-container>
    <el-steps :active="stepsIndex" finish-status="success" simple>
      <el-step title="基本信息"></el-step>
      <el-step title="位置信息"></el-step>
      <el-step title="协调小组"></el-step>
      <el-step title="项目单位"></el-step>
    </el-steps>
    <el-row style="margin-top: 20px;">
      <el-col :span="18" :offset="3">
        <template v-if="stepsIndex === 0">
          <avue-form :option="projectInfoOption"
                     v-model="projectInfoForm"
                     ref="projectInfoForm"
          >
          </avue-form>
        </template>
        <template v-if="stepsIndex === 1">
          <avue-form :option="projectPositionOption"
                     v-model="projectPositionForm"
                     ref="projectPositionForm"
          >
            <template slot="position" slot-scope="scope">
              <el-row>
                <el-col :span="24">
                  <el-radio-group v-model="projectMapRadio" @change="projectMapRadioChange">
                    <el-radio label="marker">设置点</el-radio>
                    <el-radio label="polygon">设置区域</el-radio>
                  </el-radio-group>
                </el-col>
                <el-col :span="8" >
                  <el-select
                    v-model="tipInput"
                    class="tipInput"
                    filterable
                    remote
                    reserve-keyword
                    clearable
                    placeholder="搜地点"
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
                <div id="projectMap" style="width: 100%;height: 360px;"></div>
              </el-row>
            </template>
          </avue-form>
        </template>
        <template v-if="stepsIndex === 2">
          <avue-crud ref="projectGroupData"
                     :option="projectGroupDataOption"
                     :data="projectGroupData">
            <template slot="isProjectPersonLiable" slot-scope="scope">
              <div style="padding-left: 20px">
                <el-checkbox :true-label="'1'" :false-label="'0'" v-model="scope.row.isProjectPersonLiable" @change="changeProjectPersonLiable(scope.row)"></el-checkbox>
              </div>
            </template>
            <template slot-scope="{index}" slot="menu">
              <el-button type="text" size="mini" @click="removeGroup(index)">删除</el-button>
            </template>
          </avue-crud>
        </template>
        <template v-if="stepsIndex === 3">
          <avue-crud ref="projectUnitData"
                     :option="projectUnitOption"
                     :data="projectUnitData">
            <template slot-scope="{index}" slot="menu">
              <el-button type="text" size="mini" @click="removeUnit(index)">删除</el-button>
            </template>
          </avue-crud>
        </template>
      </el-col>
      <el-col>
        <div style="width: 1200px;text-align: center">
          <el-button v-show="stepsIndex > 0" :size="size" @click="prevStep">上一步</el-button>
          <el-button v-show="stepsIndex === 1" :size="size" @click="clearPositionForm">清空</el-button>
          <el-button :size="size" @click="clearAllForm">全部清空</el-button>
          <el-button v-show="stepsIndex < 3" :size="size" type="primary" @click="nextStep">下一步</el-button>
          <el-button v-show="stepsIndex === 3" :size="size" :loading="submitLoading" type="primary" @click="submitAll">提交</el-button>
        </div>
      </el-col>
    </el-row>
  </basic-container>
</template>

<script>
  import { getPresuppositionList } from '@/api/project/presupposition'
  import { getDictionary } from '@/api/system/dictbiz'
  import { projectApproval } from '@/api/project/project'
  import axios from 'axios';

  export default {
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
      // 校验竣工日期必须在开工日期之后 方法规则
      const checkCompletionDate = (rule, value, callback) => {
        setTimeout(() => {
          // 只有当竣工日期选择了之后才进行校验
          if (value !== undefined && value !== '') {
            // 获取开工日期
            const { commencementDate } = this.projectInfoForm
            // 判断是否已经选择了开工日期，没有则提示请先选择开工日期
            if (commencementDate !== undefined && commencementDate !== '') {
              const begin = new Date(commencementDate);
              const end = new Date(value);
              if (end - begin < 0) {
                callback(new Error('竣工日期必须在开工日期之后'))
              } else {
                callback()
              }
            } else {
              callback(new Error('请先选择开工日期'))
            }
          } else {
            callback()
          }
        }, 100)
      }
      return {
        size: 'mini',
        stepsIndex: 0,
        clearAll: false,
        submitLoading: false, // 提交按钮加载中状态
        tipInput : '',
        map: undefined,
        tips: [],
        projectMap: undefined,
        projectMapMarker: undefined, // 地图标点组件
        projectMapPolygon: undefined, // 地图多边形数据
        projectMapPolyEditor: undefined, // 地图多边形编辑绘制组件
        projectMapRadio: 'marker',
        projectNameData: [],
        projectInfoForm: {
          parentId: '',
          name: '',
          code: ''
        },
        projectPersonLiable: '',
        projectPositionForm: {
          address: '',
          lonLat: '',
          lonLatRange: '',
          lonLatRangeList: []
        },
        projectGroupForm: {},
        projectUnitData: [],
        projectGroupData: [],
        projectInfoOption: {
          menuBtn: false,
          labelWidth: 130,
          size: 'mini',
          column: [
            {
              label: "项目名称",
              prop: "parentId",
              rules: [{
                required: true,
                message: "请选择预设项目",
                trigger: "change"
              }],
              type: 'select',
              dicData: [],
              filterable: true
            },
            {
              label: "项目代码",
              prop: "code",
              placeholder: '自动填充',
              readonly: true
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
                message: "请输入建设规模及描述",
                validator:inputContentReg,
                trigger: "blur"
              }],
              span: 24
            },
            {
              label: "立项日期",
              prop: "commencementDate",
              rules: [{
                required: true,
                message: "请选择立项日期",
                trigger: "change"
              }],
              type: 'date',
              valueFormat: 'yyyy-MM-dd',
              format: 'yyyy-MM-dd'
            },
            {
              label: "计划完工日期",
              prop: "completionDate",
              rules: [
                {
                  required: true,
                  message: "请选择计划日期",
                  trigger: "change"
                },
                {
                  validator: checkCompletionDate,
                  trigger: "change"
                }
              ],
              type: 'date',
              valueFormat: 'yyyy-MM-dd',
              format: 'yyyy-MM-dd'
            },
            {
              label: "资金来源",
              prop: "sourceFunds",
              rules: [{
                validator:inputContentReg,
                trigger: "change"
              }]
            },
            {
              label: "批复金额",
              prop: "approveDamount",
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
            }
          ]
        },
        projectPositionOption: {
          menuBtn: false,
          column: [
            {
              label: "项目地点",
              prop: "address",
              readonly: true,
              placeholder: '请选择项目位置',
              span: 24
            },
            {
              label: "项目位置",
              prop: "position",
              formslot: true,
              span: 24
            }
          ]
        },
        projectUnitOption: {
          addBtn:false,
          editBtn:false,
          delBtn: false,
          addRowBtn:true,
          cellBtn:false,
          cancelBtn:false,
          refreshBtn: false,
          menuWidth: 80,
          size: 'mini',
          column: [
            {
              label:'单位名称',
              prop: 'unitName',
              cell: true
            },{
              label:'单位联系人',
              prop: 'unitContact',
              cell: true
            },{
              label:'联系人手机号码',
              prop: 'contactMobile',
              rules: [{
                required: true,
                validator:constReg,
                trigger: "change",
              }],
              cell: true
            },{
              label:'单位类型',
              prop: 'unitType',
              cell: true,
              type: 'select',
              dicData: [],
              props: {
                label: "dictValue",
                value: "dictKey"
              }
            },{
              label:'备注',
              prop: 'remarks',
              cell: true
            }
          ]
        },
        projectGroupDataOption: {
          addBtn:false,
          editBtn:false,
          delBtn: false,
          addRowBtn: true,
          cellBtn: false,
          cancelBtn:false,
          refreshBtn: false,
          menuWidth: 80,
          size: 'mini',
          column: [
            {
              label:'成员',
              prop: 'userId',
              type: "select",
              filterable: true,
              cell: true,
              dicUrl: "/api/project-manager/project/common/getUserList",
              props: {
                label: "memberInfo",
                value: "userId"
              }
            },{
              label:'项目负责人',
              prop: 'isProjectPersonLiable',
              width: 80,
              slot: true
            },{
              label:'职务',
              prop: 'groupPosition',
              cell: true,
              type: 'select',
              width: 200,
              filterable: true,
              dicUrl: "/api/blade-system/dict-biz/dictionary?code=personnel_type",
              props: {
                label: "dictValue",
                value: "dictKey"
              }
            }
          ]
        }
      };
    },
    watch: {
      'projectInfoForm.parentId': {
        handler(newVal, oldVal) {
          if (newVal !== undefined && newVal !== oldVal) {
            for (const tempData of this.projectNameData) {
              if (tempData.id === newVal) {
                this.projectInfoForm.code = tempData.code
                this.projectInfoForm.name = tempData.title
                break
              }
            }
          }
        },
        deep: true,
        immediate: true
      }
    },
    mounted() {
      this.initData()
    },
    updated() {
      if (this.$refs.projectInfoForm !== undefined && this.clearAll) {
        this.resetProjectInfoForm()
      }
      if (this.$refs.projectPositionForm !== undefined) {
        this.projectMap = new AMap.Map('projectMap', {
          viewMode: '2D', // 默认使用 2D 模式，如果希望使用带有俯仰角的 3D 模式，请设置 viewMode: '3D',
          zoom: 12, //初始化地图层级
          center: [112.946308, 27.832394] //初始化地图中心点 湘潭市委
        })
        this.projectMapRadioChange(this.projectMapRadio)
        if (this.projectMapMarker !== undefined) {
          this.projectMap.add(this.projectMapMarker)
        }
        if (this.projectPositionForm.lonLatRangeList.length > 0) {
          this.projectMapPolygon = new AMap.Polygon({
            path: this.projectPositionForm.lonLatRangeList,
            strokeColor: "#FF33FF",
            strokeWeight: 6,
            strokeOpacity: 0.2,
            fillOpacity: 0.4,
            fillColor: '#1791fc',
            zIndex: 50,
          })
          // 将多边形添加到地图中
          this.projectMap.add(this.projectMapPolygon)
        }
      }
    },
    methods: {
      // 初始化数据
      initData() {
        // 获取预设项目列表数据
        getPresuppositionList().then(res => {
          this.projectInfoOption.column[0].dicData = []
          this.projectNameData = res.data.data
          for (const data of this.projectNameData) {
            this.projectInfoOption.column[0].dicData.push({ value: data.id, label: data.title})
          }
        })
        // 获取项目单位字典数据
        getDictionary({ code: 'project_unit_type'}).then(res => {
          this.projectUnitOption.column[3].dicData = res.data.data
        })
      },
      resetAllForm() {
        // 清空所有表单数据
        this.projectGroupData = []
        this.projectUnitData = []
        this.stepsIndex = 0
        this.clearAll = true
        this.projectPersonLiable = ''
        this.resetPositionForm()
      },
      clearAllForm() {
        // 全部清空按钮点击事件
        this.$confirm("确定将已填写的数据清空?", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          this.resetAllForm()
        })
      },
      // 清空基本信息表单
      resetProjectInfoForm() {
        if (this.$refs.projectInfoForm !== undefined) {
          this.$refs.projectInfoForm.resetForm()
        }
      },
      clearPositionForm() {
        // 清空位置信息数据
        this.$confirm("确定清除位置数据吗?", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          this.resetPositionForm()
        })
      },
      resetPositionForm() {
        // 重置位置信息数据
        if (this.projectMap !== undefined) {
          if (this.projectMapMarker !== undefined)
            this.projectMap.remove(this.projectMapMarker)
          if (this.projectMapPolygon !== undefined)
            this.projectMap.remove(this.projectMapPolygon)
        }
        this.projectMapMarker = undefined
        this.projectMapPolygon = undefined
        this.projectMapPolyEditor = undefined
        this.projectPositionForm.lonLatRangeList = []
        this.projectPositionForm.lonLat = ''
        this.projectPositionForm.address = ''
        this.projectPositionForm.lonLatRange = ''
      },
      nextStep() {
        // 校验步骤条 下一步事件正常执行逻辑，只有小于3的时候才能进行“下一步”操作
        if (this.stepsIndex < 3) {

          if (this.stepsIndex === 1) {
            // 如果当前步骤在位置信息时，点击下一步操作需要将地图组件清除
            if (this.projectMapRadio === 'polygon') {
              this.projectMapRadio = 'marker'
              this.projectMapRadioChange(this.projectMapRadio)
            }
            this.clearMapAssembly()
          }
          if (this.stepsIndex === 0 && this.$refs.projectInfoForm !== undefined) {
            // 校验基本信息表单数据处理逻辑
            this.$refs.projectInfoForm.validate(isValidate => {
              if (isValidate) {
                this.$refs.projectInfoForm.allDisabled = false
                this.stepsIndex += 1
              }
            })
          } else if (this.stepsIndex === 2) {
            // 校验协调小组表单数据处理逻辑
            if (this.projectGroupData.length > 0) {
              // 定义校验是否拥有项目负责人初始值
              let validateHasProjectPersonLiable = false
              const set = new Set();
              for (const group of this.projectGroupData) {
                if (group['userId'] === undefined || (group['userId'] + '').trim() === '') {
                  this.$confirm("您还未选择项目成员！", {
                    confirmButtonText: "确定",
                    showCancelButton: false,
                    closeOnClickModal: false,
                    closeOnPressEscape: false,
                    showClose: false,
                    type: "warning"
                  })
                  return false
                }
                set.add(group.userId)
                if (group['isProjectPersonLiable'] === '1') {
                  this.projectPersonLiable = group.userId
                  validateHasProjectPersonLiable = true
                }
                if (!(group['isProjectPersonLiable'] === '1') && (group['groupPosition'] === undefined || (group['groupPosition'] + '').trim() === '')) {
                  this.$confirm("您还未完善项目成员职务！", {
                    confirmButtonText: "确定",
                    showCancelButton: false,
                    closeOnClickModal: false,
                    closeOnPressEscape: false,
                    showClose: false,
                    type: "warning"
                  })
                  return false
                }
              }
              if (!validateHasProjectPersonLiable) {
                this.$confirm("请确定一个项目负责人！", {
                  confirmButtonText: "确定",
                  showCancelButton: false,
                  closeOnClickModal: false,
                  closeOnPressEscape: false,
                  showClose: false,
                  type: "warning"
                })
                return false
              }
              if (set.size !== this.projectGroupData.length) {
                this.$confirm("请不要重复添加项目成员！", {
                  confirmButtonText: "确定",
                  showCancelButton: false,
                  closeOnClickModal: false,
                  closeOnPressEscape: false,
                  showClose: false,
                  type: "warning"
                })
                return false
              }
              this.stepsIndex += 1
            } else {
              this.$confirm("请添加项目负责人！", {
                confirmButtonText: "确定",
                showCancelButton: false,
                closeOnClickModal: false,
                closeOnPressEscape: false,
                showClose: false,
                type: "warning"
              })
              return false
            }

          } else {
            this.stepsIndex += 1
          }
        }
      },
      prevStep() {
        // 校验步骤条 上一步事件正常执行逻辑，只有大于0的时候才能进行 “上一步” 操作
        if (this.stepsIndex > 0) {
          if (this.stepsIndex === 1) {
            // 如果当前步骤在位置信息时，点击下一步操作需要将地图组件清除
            if (this.projectMapRadio === 'polygon') {
              this.projectMapRadio = 'marker'
              this.projectMapRadioChange(this.projectMapRadio)
            }
            this.clearMapAssembly()
          }
          this.stepsIndex -= 1
        }
      },
      projectMapRadioChange(value) {
        // 位置信息 单选框切换事件
        if (value === 'marker') {
          this.projectMap.on('click', this.mapClick)
          this.mapClosePolygon()
        }
        if (value === 'polygon') {
          this.projectMap.off('click', this.mapClick)
          if (this.projectPositionForm.lonLatRangeList.length === 0) {
            if (this.projectPositionForm.lonLat !== undefined && this.projectPositionForm.lonLat !== '') {
              const lonLatList = this.projectPositionForm.lonLat.split(',')
              const lon = Number(lonLatList[0])
              const lat = Number(lonLatList[1])
              // 根据所选坐标初始化区域边界
              this.projectPositionForm.lonLatRangeList.push([lon-0.001,lat+0.001])
              this.projectPositionForm.lonLatRangeList.push([lon+0.001,lat+0.001])
              this.projectPositionForm.lonLatRangeList.push([lon+0.001,lat-0.001])
              this.projectPositionForm.lonLatRangeList.push([lon-0.001,lat-0.001])
              this.mapOpenPolygon()
            } else {
              this.$confirm("请先选择项目位置再设置区域！", {
                confirmButtonText: "确定",
                showCancelButton: false,
                closeOnClickModal: false,
                closeOnPressEscape: false,
                showClose: false,
                type: "warning"
              }).then(() => {
                this.projectMapRadio = 'marker'
                this.projectMapRadioChange(this.projectMapRadio)
              })
            }
          } else {
            this.mapOpenPolygon()
          }
        }
      },
      mapClick(e) {
        // 地图点击事件
        if (this.projectMap !== undefined) {
          if (this.projectMapMarker !== undefined) {
            // 如果点标记已存在则先移除原点
            this.projectMap.remove(this.projectMapMarker);
            this.projectPositionForm.lonLat = ''
            this.projectPositionForm.address = ''
          }
          // 定义点标记对象
          this.projectMapMarker =  new AMap.Marker({
            position: new AMap.LngLat(e.lnglat.lng, e.lnglat.lat)
          })
          this.projectPositionForm.lonLat = e.lnglat.lng+','+e.lnglat.lat
          // 添加点标记在地图上
          this.projectMap.add(this.projectMapMarker)
          // 逆地址解析
          axios.get('/maprestapi/v3/geocode/regeo', {
            params: {
              key: '6bfac3160868f2eacbde16c6f99f6522',
              location: this.projectPositionForm.lonLat
            }
          }).then(res => {
            if (res.status === 200) {
              this.projectPositionForm.address = res.data.regeocode.formatted_address
            }
          })
        }
      },
      mapOpenPolygon() {
        // 地图绘制和编辑多边形组件
        if (this.projectMap !== undefined) {
          if (this.projectMapPolygon === undefined) {
            this.projectMapPolygon = new AMap.Polygon({
              path: this.projectPositionForm.lonLatRangeList,
              strokeColor: "#FF33FF",
              strokeWeight: 6,
              strokeOpacity: 0.2,
              fillOpacity: 0.4,
              fillColor: '#1791fc',
              zIndex: 50,
            })
            // 将多边形添加到地图中
            this.projectMap.add(this.projectMapPolygon)
          }
          // 缩放地图到合适的视野级别
          this.projectMap.setFitView([ this.projectMapPolygon ])
          if (this.projectMapPolyEditor === undefined) {
            this.projectMapPolyEditor = new AMap.PolyEditor(this.projectMap, this.projectMapPolygon)
          }
          this.projectMapPolyEditor.open()
          this.projectMapPolyEditor.on('end', this.mapEndPolygon)
        }
      },
      mapClosePolygon() {
        if (this.projectMapPolyEditor !== undefined) {
          this.projectMapPolyEditor.close()
        }
      },
      mapEndPolygon(e) {
        // 地图结束多边形区域编辑事件
        this.projectPositionForm.lonLatRangeList = []
        for (const path of e.target.getPath()) {
          this.projectPositionForm.lonLatRangeList.push([path.lng,path.lat])
        }
      },
      clearMapAssembly() {
        // 清除地图多边形相关组件
        this.projectMapPolygon = undefined
        this.projectMapPolyEditor = undefined
      },
      changeProjectPersonLiable(row) {
        // 项目负责人改变事件
        // 每个项目的项目负责人有且只有一个！所以需要将其他成员强制改成非项目负责人
        for (const index in this.projectGroupData) {
          if (parseInt(index) !== parseInt(row.$index)) {
            // 非当前行数据 则打开行内编辑、项目负责人改为false
            this.projectGroupData[index].$cellEdit = true
            this.projectGroupData[index].isProjectPersonLiable = false
          } else {
            // 当前行数据 根据是否选择来判断是否打开行内编辑、职务重置
            this.projectGroupData[index].$cellEdit = !this.projectGroupData[index].isProjectPersonLiable
            if (this.projectGroupData[index].isProjectPersonLiable) {
              this.projectGroupData[index].groupPosition = ''
            }
          }
        }
      },
      validateUnitData() {
        // 校验项目单位数据
        if (this.projectUnitData.length > 0) {
          for (const unitData of this.projectUnitData) {
            if (unitData['contactMobile'] === undefined || unitData['contactMobile'].trim() === ''){
              return false
            }
            if (unitData['unitContact'] === undefined || unitData['unitContact'].trim() === ''){
              return false
            }
            if (unitData['unitName'] === undefined || unitData['unitName'].trim() === ''){
              return false
            }
            if (unitData['unitType'] === undefined || unitData['unitType'].trim() === ''){
              return false
            }
          }
        }
        return true
      },
      removeGroup(index) {
        // 移除项目协调小组数据
        this.projectGroupData.splice(index, 1)
      },
      removeUnit(index) {
        // 移除项目单位数据
        this.projectUnitData.splice(index, 1)
      },
      submitAll() {
        this.submitLoading = true
        if (!this.validateUnitData()) {
          this.$confirm("请先完善好相关项目单位数据！", {
            confirmButtonText: "确定",
            showCancelButton: false,
            closeOnClickModal: false,
            closeOnPressEscape: false,
            showClose: false,
            type: "warning"
          })
          this.submitLoading = false
          return false
        }
        const submitData = Object.assign(this.projectInfoForm, this.projectPositionForm)
        // 提交数据 格式化
        submitData['lonLatRange'] = JSON.stringify(submitData.lonLatRangeList)
        submitData['projectNature'] = submitData.projectNature.join(',')
        // 格式化金额单位按分算 （数据填充时是万）
        submitData['totalInvestment'] = Number(submitData['totalInvestment']) * 10000 * 100
        submitData['budgetEstimate'] = Number(submitData['budgetEstimate']) * 10000 * 100
        // 添加项目负责人
        submitData['projectPersonLiable'] = this.projectPersonLiable
        // 添加项目协调小组数据
        submitData['projectCoordinationGroupList'] = this.projectGroupData
        // 添加项目单位数据
        submitData['projectUnitInfoList'] = this.projectUnitData
        projectApproval(submitData).then(res => {
          console.log("===新增项目立项*******==========",res);
          const type = res.data.success ? 'success' : 'error'
          this.$confirm(res.data.msg, {
            confirmButtonText: "确定",
            showCancelButton: false,
            closeOnClickModal: false,
            closeOnPressEscape: false,
            showClose: false,
            type: type
          }).then(() => {
            this.submitLoading = false
            this.resetAllForm()
          })
        })
      },
      tipChange(value) {
        for (const tip of this.tips) {
          if (value === tip.id) {
            this.projectMap.setZoom(15)
            console.log("+++++++++地点++++++++",this.projectMap)
            this.projectMap.setCenter(tip.location)
            break
          }
        }
      },
      remoteMethod(query) {
        if (query !== '') {
          this.loading = true;
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
  };
</script>

<style scoped>
  /*.tipInput {*/
  /*  position: fixed;*/
  /*  z-index: 999;*/
  /*  margin-top: 20px;*/
  /*  margin-left: 20px;*/
  /*  width: 300px;*/
  /*}*/
</style>
