<template>
  <basic-container>
    <el-row>
      <avue-crud :data="data"
                 :option="option"
                 :page.sync="page"
                 :before-open="beforeOpenDialog"
                 v-model="form"
                 ref="crud"
                 @search-change="searchChange"
                 @search-reset="searchReset"
                 @selection-change="selectionChange"
                 @current-change="currentChange"
                 @size-change="sizeChange"
                 @refresh-change="refreshChange"
                 @row-update="rowUpdate"
                 @row-save="rowSave"
                 @on-load="onLoad">
        <template slot="infoForm" slot-scope="scope">
          <avue-crud :option="memberOption"
                     v-model="memberForm"
                     ref="memberForm"
                     :data="memberData"
                     :page.sync="pageDetail"
                     @row-update="memberUpdate"
                     @row-del="memberRemove"
                     @row-save="memberSave"
                     @current-change="currentChangeBidding"
                     @size-change="sizeChangeBidding"
                     @refresh-change="memberOnload">
          </avue-crud>
        </template>
        <template slot="menuLeft">
          <el-button type="danger"
                     size="mini"
                     icon="el-icon-delete"
                     plain
                     @click="handleDelete">删 除
          </el-button>
        </template>
        <template slot-scope="scope" slot="fileForm">
          <project-upload
            :project-id="projectId"
            :link-id="scope.row.id"
            :link-type="linkType"
            :attach-only.sync="attachOnly"
            :crud-height="240"
            :data.sync="projectAttachList"
            @uploadFileSuccess="uploadFileSuccess"
            @delFileSuccess="delFileSuccess"
            @empowerFile="empowerFile"
          ></project-upload>
        </template>
      </avue-crud>
    </el-row>

  </basic-container>
</template>

<script>
  import { getContractList } from '@/api/project/contract'
  import { getMemberPage,addMember,updateMember,removeMember} from "@/api/project/finalMember";
  import {getList,getDetail,add,update,remove} from '@/api/project/acceptance'
  import projectUpload from "@/components/file-upload/project-upload";

export default {
  components: { projectUpload },
  name: "FinalAcceptance",
  props: {
    projectId: {
      type: String,
      default: '0'
    },
    projectData: {
      type: Object,
      default: undefined
    },
    attachList:{
      type: Object,
      default: undefined
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
    return{
      test:'竣工验收',
      loading:true,
      page:{
        pageSize: 10,
        currentPage: 1,
        total: 0
      },
      pageDetail:{
        pageSize: 10,
        currentPage: 1,
        total: 0,
        layout: ' total, prev, pager, next'
      },
      query: {
        projectId: ''
      },
      queryPeople:{completionAcceptanceId: ''},
      form: {
        projectId: '',
        contractId:'',
        contractCode:'',
        acceptancePeopleList: []
      },
      completionAcceptanceId:'',
      memberForm:{
        completionAcceptanceId:'',
        userName:'',
        unit:'',
        telephone:''
      },
      projectAttachList: [],//附件集合
      memberData:[],
      selectionList:[],
      contractList:[],//合同列表
      data:[],
      option:{
        height:'auto',
        align:'center',
        calcHeight: 30,
        tip: false,
        searchShow: true,
        searchMenuSpan: 6,
        index: true,
        indexLabel:'序号',
        addTitle:'竣工验收',
        border:true,
        page:true,
        size: 'mini',
        delBtn:false,
        viewBtn:true,
        dialogWidth:'50%',
        columnBtn:false,
        dialogHeight:600,
        dialogTop:15,
        selection: true,
        labelWidth:100,
        updateBtn: true,
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
            readonly: true,
            addDisabled: true,
            editDisabled:true,
            hide: true,
          },
          {
            label: "项目代码",
            prop: "code",
            readonly: true,
            hide: true,
            addDisabled: true,
            editDisabled:true
          },
          {
            label: "项目阶段",
            prop: "stage",
            type: "select",
            hide: true,
            addDisabled: true,
            editDisabled:true,
            rules: [{
              message: "请选择项目阶段",
              trigger: "change"
            }],
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=stage",
            props: {
              label: "dictValue",
              value: "dictKey"
            }
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
            label: "关联合同",
            prop: "contractId",
            type: 'select',
            search: true,
            filterable:true,
            searchFilterable:true,
            searchLabelWidth: 80,
            dicData:[]
          },
          {
            label: "合同码",
            prop: "contractCode",
            editDisabled:true,
            hide: true
          },
          {
            label:'验收日期',
            prop:'acceptanceDate',
            type: 'date',
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd'
          },
          {
            label:'主持单位',
            prop:'hostUnitId',
            type: "select",
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=unit",
            props: {
              label: "dictValue",
              value: "dictKey"
            },
            filterable: true,
            searchFilterable:true,
            search: true
          },
          {
            label:'参与单位',
            prop:'participatoryUnitId',
            type: "select",
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=unit",
            props: {
              label: "dictValue",
              value: "dictKey"
            },
            filterable: true,
            // multiple:true,
            searchFilterable:true,
            search: true
          },
          {
            label:'验收结论',
            prop:'acceptanceConclusion',
            rules: [{
              required: true,
              validator:inputContentReg,
              trigger: "change",
            }],
          },
          {
            label:'存在问题',
            prop:'issues',
            type: 'textarea',
            overHidden:true,
            rules: [{
              validator:inputContentReg,
              trigger: "change",
            }],
            span:24,
          },
          {
            label: '',
            labelWidth:10,
            prop: 'divider',
            component: 'elDivider',//ele分割线
            params: {
              html: '<p style="font-size: 18px">验收组成员</p>',
              contentPosition: "left",
            },
            hide:true,
            span:24,
            editDisplay: false,
            addDisplay: false
          },
          {
            labelWidth:0,
            label: '',
            prop: 'info',
            span:24,
            hide:true,
            formslot:true
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
      memberOption:{
        addBtn:false,
        editBtn:false,
        addRowBtn:true,
        addBtnText:'添加验收成员',
        cellBtn:true,
        viewDisabled:true,
        border:true,
        column: [
          {
            label: '竣工验收成员',
            prop: 'acceptancePeopleList',
            addDisplay:false,
            addDisabled:true,
            hide:true,
          },
          {
            label: '成员姓名',
            prop: 'userName',
            rules: [{
              required: true,
              validator:inputContentReg,
              trigger: "change",
            }],
            cell:true
          },
          {
            label: '单位',
            prop: 'unit',
            rules: [{
              required: true,
              validator:inputContentReg,
              trigger: "change",
            }],
            cell:true
          },
          {
            label: '联系电话',
            prop: 'telephone',
            rules: [{
              required: true,
              validator:constReg,
              trigger: "change",
            }],
            cell:true
          }
        ]
      }
    }
  },
  watch:{
    'projectId': function (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.onLoad(this.page)
        this.initData()
      }
    },
    'form.contractId': {
      handler(newVal, oldVal) {
        if (newVal !== undefined && newVal !== oldVal) {
          for (const tempData of this.contractList) {
            if (tempData.id === newVal) {
              this.form.contractCode = tempData.contractCode
            }
          }
        }
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    if (this.projectId === undefined || this.projectId.trim() === ''){
      this.projectId = this.$route.params.projectId
    }
    this.initData()
  },
  methods:{
    attach(attachList){
      this.projectAttachList = attachList
    },
    initData() {
      getContractList(this.projectId).then(res => {
        this.contractList = res.data.data
        const dicData = []
        this.contractList.forEach(contract => {
          dicData.push({ value: contract.id, label: contract.contractName })
        })
        this.option.column[5].dicData = dicData
      })
    },
    memberSave(row, done, loading) {
      row['completionAcceptanceId'] = this.form.id
      addMember(row).then(() => {
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
    memberUpdate(row, index, done, loading){
      if (row.isTrusted === undefined){
        updateMember(row).then(() => {
          this.memberOnload(this.pageDetail);
          this.$message({
            type: "success",
            message: "操作成功!"
          });
          done();
        }, error => {
          loading();
          console.log(error);
        });
      }else {
        row['completionAcceptanceId'] = this.form.id
        addMember(row).then(() => {
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
      }
    },
    memberRemove(row) {
      this.$confirm("确定将选择数据删除?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          return removeMember(row.id);
        })
        .then(() => {
          this.$message({
            type: "success",
            message: "操作成功!"
          });
          this.memberOnload(this.pageDetail);
        });
    },
    //投标人加载
    memberOnload() {
      this.loading = true;
      this.queryPeople.completionAcceptanceId = this.form.id
      getMemberPage(this.pageDetail.currentPage,this.pageDetail.pageSize,Object.assign({}, this.queryPeople)).then(res => {
        const data = res.data.data;
        this.pageDetail.total = data.total;
        this.memberData = data.records;
        this.loading = false;
      });
    },
    beforeOpenDialog(done,type) {
      // 表单打开前方法
      this.attachOnly = false
      if (this.projectData !== undefined) {
        this.form['projectName'] = this.projectData['name']
        this.form['projectId'] = this.projectData['id']
        this.form['stage'] = this.projectData['stage']
        this.form['classification'] = this.projectData['classification']
        this.form['code'] = this.projectData['code']
      }
      this.memberOption.menu = false
      this.memberOption.columnBtn = false
      this.memberOption.refreshBtn = false
      this.memberOption.header = true
      this.memberOption.addRowBtn = true
      if (["view"].includes(type)) {
        this.memberOnload()
        this.memberOption.header = false
        this.attachOnly = true
        this.memberOption.addRowBtn = false
        getDetail(this.form.id).then(res => {
          this.form = res.data.data;
          this.onLoad(this.page)
        });
      }
      if (type === 'add') {
        this.projectAttachList = []
      }
      if (["edit"].includes(type)) {
        this.memberOnload()
        this.memberOption.menu = true
        this.memberOption.refreshBtn = true
        getDetail(this.form.id).then(res => {
          this.form = res.data.data;
          const sysUserId = JSON.parse(localStorage.getItem('saber-userInfo')).content.user_id
          if( this.form.createUser !== sysUserId){
            this.option.updateBtn = false
            this.attachOnly = true
            this.memberOption.addRowBtn = false
            this.$message.error('您没有权限修改')
          }else{
            this.option.updateBtn = true
            this.attachOnly = false
            this.memberOption.addRowBtn = true
          }
        });
      }
      if (["add"].includes(type)) {
        this.pageDetail.total = 0;
        this.memberData = [];
      }
      done()
    },
    rowSave(row, done, loading) {
      row['projectId'] = this.projectId
      row['acceptancePeopleList'] = this.memberData
      row['projectAttachList'] = this.projectAttachList
      add(row).then(() => {
        console.log("=====新增===",row)
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
    rowUpdate(row, index, done, loading) {
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
    handleDelete() {
      if (this.selectionList.length === 0) {
        this.$message.warning("请选择至少一条数据");
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
          this.$refs.crud.toggleSelection();
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
    currentChangeBidding(currentPage){
      this.pageDetail.currentPage = currentPage;
    },
    sizeChangeBidding(pageSize){
      this.pageDetail.pageSize = pageSize;
    },
    refreshChange() {
      this.onLoad(this.page, this.query);
    },
    onLoad(page, params = {}) {
      this.loading = true;
      this.query.projectId = this.projectId
      getList(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        this.data = data.records;
        console.log(this.data)
        this.loading = false;
      });
    }
  }
}
</script>

<style scoped>

</style>
