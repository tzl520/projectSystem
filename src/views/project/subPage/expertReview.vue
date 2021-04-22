<template>
  <basic-container>
    <el-row>
      <avue-crud :data="data"
                 :option="expertReviewOption"
                 :page.sync="page"
                 :before-open="beforeOpenDialog"
                 v-model="form"
                 ref="crud"
                 @search-change="searchChange"
                 @search-reset="searchReset"
                 @selection-change="selectionChange"
                 @refresh-change="refreshChange"
                 @row-update="rowUpdate"
                 @row-save="rowSave"
                 @row-del="rowDel"
                 @on-load="onLoad">
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
        <template slot="menuLeft">
          <el-button type="danger"
                     size="mini"
                     icon="el-icon-delete"
                     plain
                     @click="handleDelete">删 除
          </el-button>
        </template>
      </avue-crud>
    </el-row>
  </basic-container>
</template>

<script>
import {getConceptualList} from '@/api/project/conceptual'
  import { getexpertReviewPage,add,update,remove,getExpertDetail} from "@/api/project/expertReview"
  import {mapGetters} from "vuex";
  import projectUpload from "@/components/file-upload/project-upload";
export default {
  components:{ projectUpload},
  name: "ExpertReview",
  props: {
    projectId: {
      type: String,
      default: '0'
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
    return {
      linkType: 'expertReview',
      attachOnly: true,
      form: {
        projectId:'',
        programmeId: '',
        programmeCode: ''
      },
      query: {projectId:''},
      loading:true,
      page:{
        pageSize: 10,
        currentPage: 1,
        total: 0
      },
      projectAttachList: [],//附件集合
      selectionList:[],
      data: [],
      programmeList: [], // 方案设计列表
      expertReviewOption:{
        updateBtn: true,
        index: true,
        indexLabel:'序号',
        addTitle:'添加专家评审',
        searchLabelWidth:100,
        menuWidth:140,
        border:true,
        size: 'mini',
        page:true,
        viewBtn:true,
        delBtn:false,
        selection: true,
        columnBtn:false,
        align:'center',
        tip: false,
        showColumn:false,
        labelWidth:100,
        dialogWidth:'50%',
        dialogHeight:600,
        dialogTop:20,
        column:[
          {
            label:"方案设计名称",
            prop:"programmeId",
            search: true,
            type: 'select',
            dicData: [],
            hide: true,
            editDisabled:true
          },
          {
            label:"方案设计编码",
            prop:"programmeCode",
            search:true,
            placeholder:"自动读取",
            hide: true,
            editDisabled:true
          },
          {
            label:"专家评审编码",
            prop:"expertReviewCode",
            labelWidth:110,
            rules: [{
              required: true,
              validator:inputContentReg,
              trigger: "change",
            }]
          },
          {
            label:"专家姓名",
            prop:"reviewExperts",
            rules: [{
              required: true,
              validator:inputContentReg,
              trigger: "change",
            }],
            hide:true
          },
          {
            label:"专家单位",
            prop:"reviewUnit",
            rules: [{
              required: true,
              validator:inputContentReg,
              trigger: "change",
            }],
            hide:true
          },
          {
            label:"评审身份",
            prop:"reviewIdentity",
            rules: [{
              required: true,
              validator:inputContentReg,
              trigger: "change",
            }],
            hide:true
          },
          {
            label:"联系电话",
            prop:"reviewPhone",
            rules: [{
              required: true,
              validator:constReg,
              trigger: "change",
            }],
            hide:true
          },
          {
            label:"评审时间",
            prop:"reviewDate",
            type: 'date',
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd',
            search: true
          },
          {
            label:"评审内容",
            prop:"expertReviewContent",
            type:'textarea',
            rules: [{
              validator:inputContentReg,
              trigger: "change",
            }]
          },
          {
            label:"评审意见",
            prop:"reviewComments",
            type:'textarea',
            rules: [{
              validator:inputContentReg,
              trigger: "change",
            }]
          },
          {
            label:"评审结果",
            prop:"reviewResult",
            type: 'select',
            dicData: [
              {value: "通过"},
              {value: "不通过"}
            ],
          },
          {
            label:'',
            prop: 'file',
            formslot:true,
            hide:true,
            labelWidth: 0,
            span:24
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
    'form.programmeId': {
      handler(newVal, oldVal) {
        if (newVal !== undefined && newVal !== oldVal) {
          for (const tempData of this.programmeList) {
            if (tempData.id === newVal) {
              this.form.programmeCode = tempData.programmeCode
            }
          }
        }
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    ...mapGetters(["permission"]),
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
  },
  methods: {
    attach(attachList){
      this.projectAttachList = attachList
    },
    initData() {
      getConceptualList(this.projectId).then(res => {
        this.programmeList = res.data.data
        const dicData = []
        this.programmeList.forEach(programme => {
          dicData.push({ value: programme.id, label: programme.programmeName })
        })
        this.expertReviewOption.column[0].dicData = dicData
      })
    },
    rowSave(row, done, loading) {
      row['projectId'] = this.projectId
      row['projectAttachList'] = this.projectAttachList
      row['projectAttachList'].forEach(attach => {
        attach['createTime'] = ''
        attach['linkType'] = this.linkType
      })
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
    rowDel(row) {
      this.$confirm("确定将选择数据删除?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          return remove(row.id);
        })
        .then(() => {
          this.onLoad(this.page);
          this.$message({
            type: "success",
            message: "操作成功!"
          });
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
    beforeOpenDialog(done,type) {
      // 表单打开前方法
      if (["view"].includes(type)) {
        this.attachOnly = true
        getExpertDetail(this.form.id).then(res => {
          this.form = res.data.data;
        });
      } else {
        this.attachOnly = false
      }
      if (["edit"].includes(type)) {
        this.attachOnly = false
        getExpertDetail(this.form.id).then(res => {
          this.form = res.data.data;
          const sysUserId = JSON.parse(localStorage.getItem('saber-userInfo')).content.user_id
          this.userIdList = this.form
          console.log(this.userIdList)
          if(this.userIdList.createUser !== sysUserId){
            this.$message.error('您没有权限修改')
            this.expertReviewOption.updateBtn = false
          }else{
            this.expertReviewOption.updateBtn = true
            console.log('成功匹配')
          }
        });
      }
      done()
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
    onLoad(page, params = {}) {
      this.loading = true;
      this.query.projectId = this.projectId
      getexpertReviewPage(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        this.data = data.records;
        console.log(this.data)
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
    }
  }
}
</script>

<style scoped>

</style>
