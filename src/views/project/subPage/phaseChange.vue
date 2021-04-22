<template>
  <basic-container>
    <el-row>
      <avue-crud :data="data.map(item=>{item.nodePersonLiable==='-1'|| item.nodePersonLiable===-1 ? item.nodePersonLiable = '': item.nodePersonLiable;return item})"
                 :option="nodePlanOption"
                 :page.sync="page"
                 :before-open="beforeOpenDialog"
                 v-model="nodePlanForm"
                 ref="crud"
                 @search-change="searchChange"
                 @search-reset="searchReset"
                 @selection-change="selectionChange"
                 @current-change="currentChange"
                 @size-change="sizeChange"
                 @refresh-change="refreshChange"
                 @row-save="nodeSave"
                 @row-update="nodeUpdate"
                 @on-load="onLoad">
<!--        <template slot="nodeStatus" slot-scope="scope">-->
<!--          <el-select v-model="statusChange" placeholder="请选择节点状态" @change="styleChange">-->
<!--            <el-option v-for="item in selectList" :key="item.dictKey" :label="item.dictValue" :disabled="item.disabled" :value="item.dictKey"/>-->
<!--          </el-select>-->
<!--        </template>-->
        <template slot-scope="scope" slot="fileForm">
          <project-upload
            :project-id="projectId"
            :link-id="scope.row.id"
            :link-type="linkType"
            :attach-only.sync="attachOnly"
            :crud-height="240"
            @uploadFileSuccess="uploadFileSuccess"
            @delFileSuccess="delFileSuccess"
            @empowerFile="empowerFile"
          ></project-upload>
        </template>
        <template slot="menuLeft">
          <el-button type="danger"
                     size="mini"
                     icon="el-icon-delete"
                     plain
                     @click="handleDelete">删 除
          </el-button>
        </template>
<!--  accept默认只能上传excel表格；limitUpload = 1限制只能上传1个文件  -->
        <template slot="menuLeft">
          <el-button type="success"
                     size="mini"
                     icon="el-icon-upload"
                     plain
                     @click="uploadNodeStage">导入
          </el-button>
          <el-dialog :visible.sync="nodeStageDialogVisible" width="30%" center :modal-append-to-body="false" top="15%" :close-on-click-modal="false">
            <avue-form ref="nodeStageForm"
                       v-model="nodeStageForm"
                       :option="nodeStageOption"
                       >
            </avue-form>
            <el-upload
              class="upload-demo"
              action="/api/project-manager/projectPhase/import"
              :on-change="handleChange"
              :on-success="successFile"
              :before-upload="beforeUploadFile"
              :file-list="fileList"
              :show-file-list="true"
              ref="upload"
              list-type="text"
              :headers="uploadHeaders"
              :data="uploadData"
              :limit="1"
              style="float: left"
              accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              :auto-upload="false">
              <el-button type="success"
                         size="mini"
                         slot="trigger"
                         plain
                         >上传文件
              </el-button>
            </el-upload>
            <template slot="footer">
              <el-button type="primary" @click="handleNodeSubmit" size="mini">确定</el-button>
              <el-button @click="nodeStageDialogVisible = false" size="mini">取消</el-button>
            </template>
          </el-dialog>
        </template>

        <template slot="menuLeft">
          <el-button type="info"
                     size="mini"
                     icon="el-icon-s-custom"
                     plain
                     @click="handleLiable">发布工作
          </el-button>
          <el-dialog :visible.sync="liableDialogVisible" width="30%" center :modal-append-to-body="false" top="15%" :close-on-click-modal="false">
            <avue-form ref="liableForm" v-model="liableForm"
                       :option="liableOption">
              <template slot="menuForm">
                <el-button type="primary" @click="handleLiableSubmit">确定</el-button>
                <el-button @click="liableDialogVisible = false">取消</el-button>
              </template>
            </avue-form>
          </el-dialog>
        </template>
      </avue-crud>

    </el-row>
  </basic-container>
</template>

<script>
import {getNodeList,getNodeDetail,add,remove,update} from "@/api/project/nodePlan";
import projectUpload from "@/components/file-upload/project-upload";
import {mapGetters} from "vuex";
import { choicePeopleImport, getWorkPeopleList} from "@/api/project/workSituation";
import website from '@/config/website';
import {Base64} from 'js-base64';
import {getDictionary} from "@/api/system/dictbiz";

export default {
  components: { projectUpload },
  name: "phaseChange",
  props: {
    projectId: {
      type: String,
      default: '0'
    },
    projectData: {
      type: Object,
      default: undefined
    }
  },
  data() {
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
    // 校验完成日期必须在开工日期之后 方法规则
    const checkPlannedCompletionDate = (rule, value, callback) =>  {
      setTimeout(() => {
        // 只有当竣工日期选择了之后才进行校验
        if (value !== undefined && value !== '') {
          // 获取开工日期
          const { plannedStartDate } = this.nodePlanForm
          // 判断是否已经选择了开工日期，没有则提示请先选择开工日期
          if (plannedStartDate !== undefined && plannedStartDate !== '') {
            const begin = new Date(plannedStartDate);
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
    const checkPlannedCompletionDates = (rule, value, callback) =>  {
      setTimeout(() => {
        // 只有当竣工日期选择了之后才进行校验
        if (value !== undefined && value !== '') {
          // 获取开工日期
          const { actualStartDate } = this.nodePlanForm
          // 判断是否已经选择了开工日期，没有则提示请先选择开工日期
          if (actualStartDate !== undefined && actualStartDate !== '') {
            const begin = new Date(actualStartDate);
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
    return{
      size:'mini',
      fileList:[],
      userIdList:[],
      loading: false,
      statusChange:{},
      //下拉框禁用的数组
      selectList: [],
      linkType: 'planList',
      page:{
        pageSize: 10,
        currentPage: 1,
        total: 0
      },
      formData: {},
      query: {
        isWorkConditon: '1',
        projectId: ''
      },
      uploadHeaders: {},
      uploadData: {
        projectId: '',
        nodeStage: '' // this.nodeStageMsgList
      },
      projectList: [],
      //这是节点阶段的对话框
      nodeStageDialogVisible: false,
      nodeStageForm:{},
      nodeStageMsgList:'',
      nodeStageOption:{
        labelWidth:100,
        size:'mini',
        emptyBtn: false,
        submitBtn:false,
        column:[
          {
            label:'节点阶段',
            prop:'nodeStage',
            type: 'select',
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=stage",
            props: {
              label: "dictValue",
              value: "dictKey"
            },
            span: 18,
            rules: [{
              message: '请选择节点阶段',
              required: true,
              trigger: "blur"
            }],
            filterable: true
          }
        ]
      },
      projectAttachList: [],//附件集合
      data: [],
      userList: [],
      nodePlanForm: {
        projectId: '',
        nodePersonLiable:'',
        projectAttachList: []
      },
      liableDialogVisible :false,
      liableForm:{
        userId: ''
      },
      liableOption:{
        labelWidth:100,
        size:'mini',
        emptyBtn: false,
        submitBtn:false,
        column:[
          {
            label:'责任人',
            prop:'userId',
            type: 'select',
            span: 24,
            dicData:[],
            rules: [{
              message: '请选择责任人',
              required: true,
              trigger: "blur"
            }],
            filterable: true
          },
        ]
      },
      selectionList:[],
      nodePlanOption:{
        index: true,
        selectionWidth:40,
        indexLabel:'序号',
        updateBtn: true,
        addTitle:'添加节点计划',
        dialogWidth:'50%',
        dialogHeight:600,
        dialogTop:15,
        columnBtn:false,
        align:'center',
        menuWidth:150,
        border:true,
        page:true,
        size: 'mini',
        delBtn:false,
        viewBtnText:'详情',
        viewBtn: true,
        selection: true,
        tip: false,
        labelWidth:120,
        column:[
          {
            label: "项目id",
            prop: "projectId",
            hide: true,
            addDisplay:false,
            viewDisplay:false,
            editDisplay:false
          },
          {
            label: "项目名称",
            prop: "projectName",
            hide: true,
            readonly: true,
            addDisabled: true,
            editDisabled:true
          },
          {
            label: "项目代码",
            prop: "code",
            placeholder: '自动填充',
            hide:true,
            readonly: true,
            addDisabled: true,
            editDisabled:true
          },
          {
            label: "项目阶段",
            prop: "projectStage",
            hide: false,
            type: "select",
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=stage",
            props: {
              label: "dictValue",
              value: "dictKey"
            },
            searchFilterable:true,
            addDisabled:true,
            editDisabled:true
          },
          {
            label: "项目分类",
            prop: "classification",
            type: "select",
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=project_classification",
            props: {
              label: "dictValue",
              value: "dictKey"
            },
            filterable: true,
            hide: true,
            width: 80,
            addDisabled: true,
            editDisabled:true
          },
          {
            label:'节点名称',
            prop:'nodeName',
            search: true,
            searchLabelWidth:100,
            rules: [{
              required: true,
              validator:inputContentReg,
              trigger: "change",
            }]
          },
          {
            label: "节点阶段",
            prop: "nodeStage",
            type: "select",
            search: true,
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=stage",
            props: {
              label: "dictValue",
              value: "dictKey"
            },
            width: 120,
            searchFilterable:true,
            editDisabled:true
          },
          {
            label:'节点责任人',
            prop: 'nodePersonLiable',
            dicUrl: '/api/blade-user/userNameList',
            props: {
              label: "name",
              value: "id"
            },
            type: 'select',
            readonly: true,
            addDisplay: false,
            editDisabled: true,
            search: true,
            width: 120,
            searchLabelWidth:100,
          },
          {
            label:'节点状态',
            prop:'nodeStatus',
            search: true,
            addDisabled: true,
            type: 'select',
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=planning_node",
            props: {
              label: "dictValue",
              value: "dictKey"
            },
          },
          {
            label:'工作类型',
            prop:'jobType',
            search: true,
          },
          {
            label:'工作内容',
            prop:'jobContent',
            type: 'textarea',
            rules: [{
              validator:inputContentReg,
              trigger: "change",
            }],
            span:24,
            hide: true
          },
          {
            label: '',
            labelWidth:10,
            prop: 'divider',
            component: 'elDivider',//ele分割线
            hide: true,
            span:24,
            editDisplay: false,
            addDisplay: false,
          },
          {
            label:'计划开始时间',
            prop:'plannedStartDate',
            type: 'date',
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd',
            hide: true
          },
          {
            label:'计划完成时间',
            prop:'plannedCompletionDate',
            rules: [
              {
                validator: checkPlannedCompletionDate,
                trigger: "change"
              }
            ],
            type: 'date',
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd',
            width: 100
          },
          {
            label:'实际开始时间',
            prop:'actualStartDate',
            type: 'date',
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd',
            hide: true
          },
          {
            label:'实际结束时间',
            prop:'actualFinishingDate',
            validator: checkPlannedCompletionDates,
            trigger: "change",
            type: 'date',
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd',
            width: 100
          },
          {
            label:'实施预算',
            prop:'implementationBudget',
            rules: [
              {
                required: true,
                message: "请输入数字",
                trigger: "blur"
              },
              {
                validator: checkNumber,
                trigger: "blur"
              }
            ],
            append: '万元',
          },
          {
            label:'实际使用费用',
            prop:'actualCost',
            rules: [
              {
                required: true,
                message: "请输入数字",
                trigger: "blur"
              },
              {
                validator: checkNumber,
                trigger: "blur"
              }
            ],
            append: '万元',
            width: 100
          },
          {
            label:'费用使用比例',
            prop:'actualProportion',
            rules: [{
              validator:inputContentReg,
              trigger: "change",
            }],
            width: 100
          },
          {
            label:'录入时间',
            prop:'updateTime',
            placeholder:"自动获取",
            type: "datetime",
            valueFormat: 'yyyy-MM-dd HH:mm:ss',
            format: 'yyyy-MM-dd HH:mm:ss',
            addDisplay: false,
            editDisplay: false,
            hide: true
          },
          {
            label:'计划工期',
            prop:'actualDay',
            placeholder:"自动计算",
            addDisplay: false,
            editDisplay: false,
            append: '天'
          },
          {
            label:'实际工期',
            prop:'realityDay',
            placeholder:"自动计算",
            addDisplay: false,
            editDisplay: false,
            append: '天'
          },
          {
            label:'疑难问题',
            prop: 'difficultProblems',
            type: 'textarea',
            rules: [{
              validator:inputContentReg,
              trigger: "change",
            }],
            hide:true,
            span:24
          },
          {
            label:'',
            prop: 'file',
            formslot:true,
            labelWidth: 0,
            hide:true,
            span:24,
          }
        ]
      },
      attachOnly: true
    }
  },
  watch:{
    'projectId': function (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.onLoad(this.page)
      }
    }
  },
  computed: {
    ...mapGetters(["permission","token"]),
    permissionList() {
      return {
        addBtn: this.vaildData(this.permission.projectname_add, false),
        viewBtn: this.vaildData(this.permission.projectname_view, false),
        delBtn: this.vaildData(this.permission.projectname_delete, false),
        editBtn: this.vaildData(this.permission.projectname_edit, false)
      };
    },
    ids() {
      let ids = [];
      this.selectionList.forEach(ele => {
        ids.push(ele.id);
      });
      return ids.join(",");
    }
  },
  mounted() {
    if (this.projectId === undefined || this.projectId.trim() === ''){
      this.projectId = this.$route.params.projectId
    }
    this.initData()
    getDictionary({ 'code': 'planning_node'}).then(res => {
      this.selectList = res.data.data
      console.log(this.selectList)
    })
    getWorkPeopleList(this.projectId).then(res =>{
      this.userList = res.data.data
    })
  },
  methods:{
    initData(){
      getWorkPeopleList(this.projectId).then(res =>{
        this.projectList = res.data.data
        const dicData = []
        this.projectList.forEach(contract => {
          dicData.push({ value: contract.userId, label: contract.userName })
        })
        this.liableOption.column[0].dicData = dicData
      })
    },
    beforeOpenDialog(done, type) {
      // 表单打开前方法
      if (this.projectData !== undefined) {
        this.nodePlanForm['projectName'] = this.projectData['name']
        this.nodePlanForm['projectId'] = this.projectId
        this.nodePlanForm['projectStage'] = this.projectData['stage']
        this.nodePlanForm['classification'] = this.projectData['classification']
        this.nodePlanForm['code'] = this.projectData['code']
        console.log(this.projectData)
      }
      if (type === 'add') {
        this.projectAttachList = []
      }
      if (["view"].includes(type)) {
        this.attachOnly = true
        getNodeDetail(this.nodePlanForm.id).then(res => {
          this.nodePlanForm = Object.assign(this.nodePlanForm, res.data.data);
          })
      } else {
        this.attachOnly = false
      }
      if (["edit"].includes(type)) {
        getNodeDetail(this.nodePlanForm.id).then(res => {
          this.nodePlanForm = Object.assign(this.nodePlanForm, res.data.data);
          const sysUserId = JSON.parse(localStorage.getItem('saber-userInfo')).content.user_id
          this.userIdList = this.nodePlanForm
            if(this.userIdList.createUser !== sysUserId){
              this.$message.error('您没有权限修改')
              this.nodePlanOption.updateBtn = false
            }else{
              this.nodePlanOption.updateBtn = true
            }
        });
      }
      done()
    },
    nodeSave(row, done, loading) {
      row['projectAttachList'] = this.projectAttachList
      row['nodeStatus'] = '3'
      row['projectAttachList'].forEach(attach => {
        attach['createTime'] = ''
        attach['linkType'] = this.linkType
      })
      row['isWorkConditon'] = 1
      add(row).then(() => {
        this.onLoad(this.page);
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
    handleDelete() {
      if (this.selectionList.length === 0) {
        this.$message.warning("请至少选择一条数据");
        return;
      }
      this.$confirm("确定将选择数据删除?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          return remove(this.ids);
        })
        .then(() => {
          this.onLoad(this.page);
          this.$message({
            type: "success",
            message: "操作成功!"
          });
        });
    },
    nodeUpdate(row, index, done, loading) {
      update(row).then(() => {
        this.onLoad(this.page);
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
    searchReset() {
      this.query = {};
      this.onLoad(this.page);
    },
    searchChange(params, done) {
      this.query = params;
      this.page.currentPage = 1;
      this.onLoad(this.page, params);
      done();
    },
    selectionChange(list) {
      this.selectionList = list;
    },
    selectionClear() {
      this.selectionList = [];
      this.$refs.crud.toggleSelection();
    },
    currentChange(currentPage){
      this.page.currentPage = currentPage;
    },
    sizeChange(pageSize){
      this.page.pageSize = pageSize;
    },
    refreshChange() {
      this.onLoad(this.page, this.query);
    },
    handleLiable(){
      if (this.selectionList.length === 0) {
        this.$message.warning("请至少选择一条数据");
        return;
      }
      //没有确定的时候，打开一次对话框就清空一次
      if (this.$refs.liableForm !== undefined) {
        this.$refs.liableForm.resetForm()
        this.$refs.liableForm.clearValidate()
      }
      window.sessionStorage.setItem('ids',this.ids)
      //查看责任人列表
      this.liableDialogVisible = true
    },
    handleLiableSubmit(){
      this.$refs.liableForm.validate(isvalidate => {
        if (!isvalidate) {
          this.$message.warning('请选择责任人')
          return
        } else {
          const ids = window.sessionStorage.getItem('ids')
          choicePeopleImport(ids, this.liableForm.userId).then(res => {
            console.log(this.liableForm.userId,res.data)
            this.nodePlanForm.nodePersonLiable = this.liableForm.$userId
            this.onLoad(this.page)
            this.$refs.liableForm.allDisabled = false
            this.$message.success('发布成功')
          })
          //修改责任人按钮
          this.liableDialogVisible = false
          this.$refs.liableForm.allDisabled = false
        }
      })
    },
    uploadNodeStage(){
      if (this.$refs.nodeStageForm !== undefined) {
        this.$refs.nodeStageForm.resetForm()
        this.$refs.nodeStageForm.clearValidate()
        this.$refs.nodeStageForm.allDisabeld = false
      }
      this.nodeStageDialogVisible = true
    },
    //确定节点阶段的方法
    handleNodeSubmit(){
      this.$refs.nodeStageForm.validate(isvalidate => {
        if (!isvalidate) {
          this.$message.warning('请选择节点阶段')
          return
        } else {
          this.$refs.upload.submit();
          if (this.$refs.nodeStageForm !== undefined) {
            this.$refs.nodeStageForm.resetForm()
            this.$refs.nodeStageForm.clearValidate()
            this.$refs.nodeStageForm.allDisabeld = false
          }
          this.nodeStageDialogVisible = false
        }
      })
      window.localStorage.setItem("nodeStageMsg",JSON.stringify(this.nodeStageForm.nodeStage));
      this.nodeStageMsgList = JSON.parse(window.localStorage.getItem('nodeStageMsg'))
    },
    handleChange(file, fileList) {
      console.log(fileList)
      this.fileList = fileList.slice(-3);
      this.formData = this.fileList
    },
    successFile(response, file, fileList){
      console.log(response,file,fileList)
      if(response.code === 200){
        this.$message.success('上传文件成功')
        this.onLoad(this.page)
      }else{
        this.$message.error(response.msg)
      }
    },
    upError(){
      this.$message({
        type: 'error',
        message: "上传失败!"
      })
    },
    onLoad(page, params = {}) {
      this.loading = true;
      this.query.projectId = this.projectId
      getNodeList(page.currentPage, page.pageSize, Object.assign(params, this.query = {isWorkConditon: "1"}),this.projectId,).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        this.data = data.records;
        this.loading = false;
      });
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
    },
    showDialog(row){
      this.workDialogVisible = true
      console.log(row)
    },
    beforeUploadFile() {
      this.uploadData.projectId = this.projectId
      this.uploadData.nodeStage = this.nodeStageMsgList
      this.uploadHeaders['Authorization'] = `Basic ${Base64.encode(`${website.clientId}:${website.clientSecret}`)}`;
      this.uploadHeaders[website.tokenHeader] = 'bearer ' + this.token
    },
    styleChange(value){
      console.log(value)
    }
  }}
</script>

<style scoped>
/* 解决 上传下载按钮 不能再一行显示 */
.inline-block {
  display: inline-block;
}
</style>
