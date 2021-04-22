<template>
    <!-- 这是发布工单页面   -->
    <el-row :gutter="30">
      <el-col>
        <avue-form :option="option"
                   v-model="projectInfoForm"
                   ref="giveForm">
          <template slot="menuForm">
              <project-upload
                :project-id="projectInfoForm.projectId"
                :link-id="projectInfoForm.id"
                :link-type="linkType"
                :random-number="randomNumber"
                :attach-only.sync="isReadOnly"
                :crud-height="240"
                :data.sync="projectAttachList"
                @uploadFileSuccess="uploadFileSuccess"
                @delFileSuccess="delFileSuccess"
                @empowerFile="empowerFile"
              ></project-upload>
            <template v-if="showBtn">
              <el-button v-if="isReadOnly"
                         size="small"
                         @click="handleClose"
                         style="display: block;margin: 0 auto"
                         class="btnShow">关闭</el-button>
              <el-button v-else
                         type="primary"
                         size="small"
                         @click="handleReserve"
                         :loading="submitLoading"
                         style="display: block;
                       margin: 0 auto;">
                保存</el-button>
            </template>
          </template>
          <template slot-scope="scope" slot="position">
            <template v-if="scope.disabled">
              <div>
                <el-input placeholder="请选择位置" v-model="projectInfoForm['position']" :disabled="scope.disabled" suffix-icon="el-icon-map-location"></el-input>
              </div>
            </template>
            <template v-else>
              <div @click="siteClick">
                <el-input placeholder="请选择位置" v-model="projectInfoForm['position']" :disabled="scope.disabled" readonly suffix-icon="el-icon-map-location"></el-input>
              </div>
            </template>
          </template>
        </avue-form>
        <el-dialog
        :title="mapComponent.dialogTitle"
        :visible.sync="mapComponent.dialogVisible"
        width="80%"
        :modal="false"
        top="5vh">
        <map-component @clickMap="clickMap">
        </map-component>
        <div slot="footer" class="dialog-footer">
          <el-button @click="mapComponent.dialogVisible = false">关 闭</el-button>
        </div>
      </el-dialog>
      </el-col>
    </el-row>
</template>

<script>
import mapComponent from '@/components/map-component/mapComponent';
import { getMyProjectList } from '@/api/workorder/give'
import projectUpload from "@/components/file-upload/project-upload";
export default {
  components: { mapComponent,projectUpload },
  name: 'GiveForm',
  props: {
    submitLoading: { // 提交加载动画
      type: Boolean,
      default: false
    },
    giveFormData: { // 工单表单数据对象
      type: Object,
      default: undefined
    },
    isReadOnly: {  // 是否只读描述
      type: Boolean,
      default: false
    },
    showBtn: {
      type: Boolean,
      default: true
    },
    linkType: {
      type: String,
      default: 'workOrder'
    }
  },
  data() {
    //校验联系电话
    const constReg= (rule, value, callback) =>{
      const phoneExp = /^((0\d{2,3}-\d{7,8})|(1[3567984]\d{9}))$/;
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
      //校验服务地址
    let addressReg = (rule, value, callback) => {
      let regExp = /^[\\s\u4e00-\u9fa5A-Za-z0-9]{0,}$/;
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
    //校验工单描述describeReg
    let describeReg = (rule, value, callback) => {
      let regExp = /^[\\s\u4e00-\u9fa5A-Za-z0-9]{0,}$/;
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
    //校验工单名称不能为非法字符和空格
    let workNameCheck = (rule, value, callback) => {
      let regExp = /^[\\s\u4e00-\u9fa5A-Za-z0-9]{0,}$/;
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
    //校验联系人不能为非法字符和空格
    let peopleCheck = (rule, value, callback) => {
      let regExp = /^[\\s\u4e00-\u9fa5A-Za-z0-9]{0,}$/;
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
    // 校验结束日期必须在开始日期之后 方法规则
    const checkCompletionDate = (rule, value, callback) => {
      setTimeout(() => {
        // 只有当结束日期选择了之后才进行校验
        if (value !== undefined && value !== '') {
          // 获取开始日期
          const { finishStartTime } = this.projectInfoForm
          // 判断是否已经选择了开始日期，没有则提示请先选择开始日期
          if (finishStartTime !== undefined && finishStartTime !== '') {
            const begin = new Date(finishStartTime);
            const end = new Date(value);
            if (end - begin <= 0) {
              callback(new Error('结束日期必须在开始日期之后'))
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
    return {
      randomNumber: 0,
      mapComponent :{
        dialogVisible: false
      },
      map: undefined,
      projectInput: {
        position: ''
      },
      projectAttachList: [],
      projectPosition: '',
      projectNameData: [],
      projectInfoForm: {
        id: undefined,
        projectId: undefined,
        projectName: '',
        projectCode: '',
        classification: ''
      },
      form: {
        receivePeople: '',
        receiveExplain: ''
      },
      dialogVisible: false,
      size: 'mini',
      page: {
        pageSize: 10,
        currentPage: 1,
      },
      option: {
        enter: true,
        labelWidth: 100,
        size: 'mini',
        emptyBtn: false,
        submitBtn: false,
        column: [{
          label: "项目名称",
          prop: "projectId",
          rules: [{
            required: true,
            message: "请选择项目",
            trigger: "change"
          }],
          type: 'select',
          dicData: [],
          filterable: true,
          span: 8
        },
          {
            label: "项目代码",
            prop: "projectCode",
            span: 8,
            placeholder: '自动填充',
            disabled: true
          },
          {
            label: "项目分类",
            prop: "classification",
            placeholder: '自动填充',
            span: 8,
            type: 'select',
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=project_classification",
            props: {
              label: "dictValue",
              value: "dictKey"
            },
            disabled: true
          },
          {
            label: "工单类型",
            prop: "workOrderType",
            span: 8,
            type: 'select',
            rules: [{
              required: true,
              message: "请输入工单类型",
              trigger:"change"
            }],
            dicUrl: '/api/workorder/worktype/list',
            props: {
              label: "typeName",
              value: "id"
            }
          },
          {
            label: "工单名称",
            prop: "workOrderName",
            rules: [{
              required: true,
              validator: workNameCheck,
              trigger: "change"
            }],
            span: 8
          },
          {
            label: "开始日期",
            prop: "finishStartTime",
            rules: [{
              required: true,
              message: "请选择开始日期",
              trigger: "change"
            }],
            span: 8,
            type: 'date',
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd'
          },
          {
            label: "结束日期",
            prop: "finishEndTime",
            type: "date",
            rules: [
              {
                required: true,
                validator: checkCompletionDate,
                trigger: "change",
              }
            ],
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd',
            span: 8
          },
          {
            label: "优先级",
            prop: "priority",
            type: "select",
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=priority",
            props: {
              label: "dictValue",
              value: "dictKey"
            }, rules: [{
              required: true,
              message: "请选择优先级",
              trigger: "change"
            }],
            span: 8
          }, {
            label: "联系人",
            prop: "relationPeople",
            span: 8,
            rules: [{
              required: true,
              validator: peopleCheck,
              trigger: "change"
            }]
          }, {
            label: "联系电话",
            placeholder: "请填写联系电话",
            prop: "relationPhone",
            rules: [{
              required: true,
              validator: constReg,
              trigger: "change"
            }],
            span: 8
          },
          {
            label: "来源",
            type: "select",
            prop: "source",
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=source",
            props: {
              label: "dictValue",
              value: "dictKey"
            },
            span: 8
          },{
            label: "服务详细地址",
            prop: "serviceAddress",
            placeholder: "请填写详细地址",
            rules: [{
              validator: addressReg,
              trigger: "change"
            }],
            span:8
          },
          {
            label: "工单描述",
            placeholder: "请填写工单描述",
            prop: "workOrderDescribe",
            span: 8,
            rules: [{
              validator: describeReg,
              trigger: "change"
            }],
          },
          {
            label: "位置",
            placeholder: "请选择位置",
            prop: "position",
            type: "input",
            span: 16,
            formslot: true,
            rules: [{
              required: true,
              message: '请选择位置',
              // validator: constReg,
              trigger: "change"
            }],
          }
        ]
      }
    }
  },
  watch: {
    giveFormData: function (newVal) {
      if (newVal !== undefined) {
        this.randomNumber = Math.round(Math.random() * 1000)
        this.projectInfoForm = Object.assign({}, newVal)
      }
    },
    isReadOnly: function (newVal) {
      if (this.$refs.giveForm !== undefined) {
        this.$refs.giveForm.allDisabled = newVal
      }
    },
    submitLoading: function (newVal, oldVal) {
      if (oldVal && !newVal) {
        if (this.$refs.giveForm !== undefined) {
          this.$refs.giveForm.resetForm()
          this.$refs.giveForm.allDisabled = false
        }
      }
    },
    'projectInfoForm.projectId': {
      handler(newVal, oldVal) {
        if (newVal !== undefined && newVal !== oldVal) {
          for (const tempData of this.projectNameData) {
            if (tempData.id === newVal) {
              this.projectInfoForm.projectCode = tempData.code
              this.projectInfoForm.projectName = tempData.name
              this.projectInfoForm.classification = tempData.classification
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
    if (this.giveFormData !== undefined) {
      this.projectInfoForm = Object.assign({}, this.giveFormData)
    }
    if (this.$refs.giveForm !== undefined && this.isReadOnly) {
      this.$refs.giveForm.allDisabled = true
    }
  },
  methods: {
    attach(attachList){
      this.projectAttachList = attachList
    },
    handleClose() {
      this.$emit('close')
    },
    // 这是表单进行保存的方法
    handleReserve() {
      if (this.$refs.giveForm !== undefined) {
        this.$refs.giveForm.validate(isvalidate => {
          if (!isvalidate) {
            return
          } else {
            const submitData = Object.assign({},this.projectInfoForm)
            submitData['projectAttachList'] = this.projectAttachList
            this.$emit('submit', submitData)
          }
        })
      }
    },
    initData() {
      getMyProjectList().then(res => {
        this.option.column[0].dicData = []
        this.projectNameData = res.data.data
        for (const data of this.projectNameData) {
          this.option.column[0].dicData.push({value: data.id, label: data.name})
        }
      })
    },
    siteClick(){
      this.mapComponent.dialogVisible = true
    },
    clickMap(mapData) {
      this.projectInfoForm['lonLat'] = mapData.lonLat || '' // => (mapData.lonLat === undefined) ? '' : mapData.lonLat
      this.projectInfoForm['position'] = mapData.position || ''
    },
    uploadFileSuccess(data) {
      this.projectAttachList.push(data)
    },
    delFileSuccess(index) {
      if (this.projectAttachList.length > index) {
        this.projectAttachList.splice(index,1)
      }
    },
    empowerFile(data) {
      const index = data.index
      if (index >= 0 && this.projectAttachList.length > index) {
        this.projectAttachList[index]['accessPermissions'] = data.accessPermissions
        this.projectAttachList[index]['permissionsPerson'] = data.permissionsPerson
      }
    }
  }
}
</script>

<style scoped>

</style>
