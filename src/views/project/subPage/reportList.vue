<template>
  <basic-container>
    <el-row>
      <avue-crud :data="data"
                 :option="option"
                 :page.sync="page"
                 :before-open="beforeOpenDialog"
                 v-model="form"
                 ref="crud"
                 :show-column.sync="showColumn"
                 @search-change="searchChange"
                 @search-reset="searchReset"
                 @selection-change="selectionChange"
                 @current-change="currentChange"
                 @size-change="sizeChange"
                 @row-update="rowUpdate"
                 @refresh-change="refreshChange"
                 @row-save="rowSave"
                 @on-load="onLoad">
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
  import {getReportList,getReportDetail,add,update,remove} from "@/api/project/reportList";
  import projectUpload from "@/components/file-upload/project-upload";
  import {mapGetters} from "vuex";

export default {
  components: {projectUpload},
  name: "ReportList",
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
    // 校验完成日期必须在开始日期之后 方法规则
    const checkWeekEndDate = (rule, value, callback) =>  {
      setTimeout(() => {
        // 只有当竣工日期选择了之后才进行校验
        if (value !== undefined && value !== '') {
          // 获取开始日期
          const { weekStartDate } = this.form
          // 判断是否已经选择了开始日期，没有则提示请先选择开始日期
          if (weekStartDate !== undefined && weekStartDate !== '') {
            const begin = new Date(weekStartDate);
            const end = new Date(value);
            if (end - begin < 0) {
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
      test: '报告列表',
      loading:true,
      page:{
        pageSize: 10,
        currentPage: 1,
        total: 0
      },
      form: {
        projectId:'',
      },
      query: {
        projectId: ''
      },
      projectAttachList: [],//附件集合
      selectionList: [],
      data: [],
      option:{
        index: true,
        indexLabel:'序号',
        size:'mini',
        menuWidth:140,
        border:true,
        viewBtn:true,
        delBtn: false,
        dialogDrag:true,
        dialogWidth:'45%',
        dialogTop:15,
        align:'center',
        columnBtn:false,
        searchLabelWidth:100,
        selection:true,
        tip:false,
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
            hide: true,
            editDisabled:true
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
            addDisabled: true,
            editDisabled:true,
            rules: [{
              required: true,
              message: "请选择项目阶段",
              trigger: "change"
            }],
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=stage",
            props: {
              label: "dictValue",
              value: "dictKey"
            },
            hide: true,
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
            addDisabled: true,
            editDisabled:true,
            hide: true,
          },
          {
            label: "报告开始时间",
            prop: "weekStartDate",
            type:'date',
            search: true,
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd',
            hide:true
          },
          {
            label: "报告结束时间",
            prop: "weekEndDate",
            rules: [
              {
                validator: checkWeekEndDate,
                trigger: "change"
              }
            ],
            type: 'date',
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd',
            search: true,
            hide:true
          },
          {
            label:"报告人",
            prop:"createUser",
            type: 'select',
            dicUrl: "/api/blade-user/userNameList",
            props: {
              label: "name",
              value: "id"
            },
            addDisplay: false,
            editDisabled: true,
          },
          {
            label:"进展情况",
            prop:"progressContent",
            overHidden:true,
            rules: [{
              required: true,
              validator:inputContentReg,
              trigger: "change",
            }],
            type: 'textarea',
            span:24
          },
          {
            label: "下步计划",
            prop: "nextStepPlan",
            overHidden:true,
            rules: [{
              required: true,
              validator:inputContentReg,
              trigger: "change",
            }],
            type: 'textarea',
            span:24,
          },
          {
            label:"存在问题",
            prop:"issues",
            overHidden:true,
            rules: [{
              validator:inputContentReg,
              trigger: "change",
            }],
            type: 'textarea',
            span:24,
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
      },
      attachOnly: false
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
  },
  methods:{
    attach(attachList){
      this.projectAttachList = attachList
    },
    beforeOpenDialog(done,type) {
      // 表单打开前方法
      if (this.projectData !== undefined) {
        this.attachOnly = false
        this.form['projectName'] = this.projectData['name']
        this.form['projectId'] = this.projectData['id']
        this.form['stage'] = this.projectData['stage']
        this.form['classification'] = this.projectData['classification']
        this.form['code'] = this.projectData['code']
      }
      if (type === 'add') {
        this.projectAttachList = []
      }
      if (["view"].includes(type)) {
        this.attachOnly = true
        getReportDetail(this.form.id).then(res => {
          this.form = res.data.data;
        });
      }
      if (["edit"].includes(type)) {
        getReportDetail(this.form.id).then(res => {
          this.form = res.data.data;
          const sysUserId = JSON.parse(localStorage.getItem('saber-userInfo')).content.user_id
          if( this.form.createUser !== sysUserId){
            this.option.updateBtn = false
            this.attachOnly = true
            this.$message.error('您没有权限修改')
          }else{
            this.option.updateBtn = true
            this.attachOnly = false
          }
        });
      }
      done()
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
    refreshChange() {
      this.onLoad(this.page, this.query);
    },
    onLoad(page, params = {}) {
      this.loading = true;
      this.query.projectId = this.projectId
      getReportList(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
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
    }
  }
}
</script>

<style scoped>

</style>
