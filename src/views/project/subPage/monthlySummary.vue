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
        <template slot="menuLeft">
          <el-button type="danger"
                     size="mini"
                     icon="el-icon-delete"
                     plain
                     @click="handleDelete">删 除
          </el-button>
        </template>
        <template slot-scope="scope" slot="fileForm">
          <fileupload @attach = "attach"></fileupload>
        </template>
      </avue-crud>
    </el-row>
  </basic-container>
</template>

<script>
  import {getMonthlyReport,getMonthlyDetail,add,update,remove} from "@/api/project/monthlyReport";
  import fileupload from "@/components/file-upload/fileupload";
  import {mapGetters} from "vuex";

  export default {
  components: { fileupload},
  name: "monthlySummary",
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
      test: '月总结',
      loading:true,
      form: {
        projectId:'',
      },
      query: {
        projectId: ''
      },
      page:{
        pageSize: 10,
        currentPage: 1,
        total: 0
      },
      projectAttachList: [],//附件集合
      selectionList: [],
      data: [],
      option:{
        index: true,
        indexLabel:'序号',
        size:'mini',
        tip:false,
        selection:true,
        viewBtn:true,
        delBtn: false,
        align:'center',
        menuWidth:140,
        labelWidth:110,
        dialogDrag:true,
        dialogWidth:'50%',
        dialogHeight:500,
        dialogTop:15,
        columnBtn:false,
        // searchShow: true,
        searchMenuSpan: 6,
        border:true,
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
            label: "报告时间",
            prop: "progressDate",
            type: 'date',
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd',
            search:true
          },
          {
            label:"计划进度内容",
            prop:"planProgressContent",
            overHidden:true,
            rules: [{
              required: true,
              validator:inputContentReg,
              trigger: "change",
            }],
            type: 'textarea'
          },
          {
            label:"完成进度内容",
            prop:"completeProgressContent",
            overHidden:true,
            rules: [{
              required: true,
              validator:inputContentReg,
              trigger: "change",
            }],
            type: 'textarea'
          },
          {
            label:"计划完成投资",
            prop:"planInvestment",
            rules: [
              {
                required: true,
                message: "请输入计划投资",
                trigger: "blur"
              },
              {
                validator: checkNumber,
                trigger: "blur"
              }
            ]
          },
          {
            label:"本月完成投资",
            prop:"completeInvestment",
            rules: [
              {
                required: true,
                message: "请输入完成投资",
                trigger: "blur"
              },
              {
                validator: checkNumber,
                trigger: "blur"
              }
            ]
          },
          {
            label: "报告人",
            prop: "createUser",
            type: 'select',
            dicUrl: "/api/blade-user/userNameList",
            props: {
              label: "name",
              value: "id"
            },
            addDisplay: false,
            editDisabled: true,
            hide: true
          },
          {
            label:"存在问题",
            prop:"issues",
            overHidden:true,
            type: 'textarea',
            rules: [{
              validator:inputContentReg,
              trigger: "change",
            }],
            span: 24
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
        this.form['projectName'] = this.projectData['name']
        this.form['projectId'] = this.projectData['id']
        this.form['stage'] = this.projectData['stage']
        this.form['code'] = this.projectData['code']
      }
      if (["view"].includes(type)) {
        getMonthlyDetail(this.form.id).then(res => {
          this.form = res.data.data;

        });
      }
      if (["edit"].includes(type)) {
        getMonthlyDetail(this.form.id).then(res => {
          this.form = res.data.data;
        });
      }
      done()
    },
    rowSave(row, done, loading) {
      row['projectId'] = this.projectId
      row['projectAttachList'] = this.projectAttachList
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
      this.page.currentPage = 1;
      console.log(params)
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
      getMonthlyReport(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        this.data = data.records;
        this.loading = false;
      });
    }
  }
}
</script>

<style scoped>

</style>
