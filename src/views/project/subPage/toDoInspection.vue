<template>
  <basic-container>
    <el-row>
      <avue-crud :data="data"
                 :option="option"
                 :page.sync="page"
                 v-model="form"
                 ref="crud"
                 :before-open="beforeOpenDialog"
                 @search-change="searchChange"
                 @search-reset="searchReset"
                 @selection-change="selectionChange"
                 @current-change="currentChange"
                 @size-change="sizeChange"
                 @refresh-change="refreshChange"
                 @on-load="onLoad">
        <template slot-scope="{type,size,row}" slot="menu">
          <el-button :size="size" :type="type" class="el-icon-check" @click="feedBackClick(row)">办理</el-button>
        </template>
      </avue-crud>
      <el-dialog title="添加反馈" :visible.sync="dialogVisible" :modal-append-to-body="false" width="50%">
        <avue-form ref="backForm"
                   size="mini"
                   v-model="backForm"
                   :option="backOption"
                   label-width="80px">
        </avue-form>
        <div slot="footer" class="dialog-footer" align="center">
          <el-button @click="dialogVisible = false" size="mini">取 消</el-button>
          <el-button type="primary" @click="saveFeedBack" size="mini">确 定</el-button>
        </div>
      </el-dialog>
    </el-row>
  </basic-container>
</template>

<script>
  import {getWaitInspectionPage,getInspectionDetail} from "@/api/project/waitInspection";
  import {addFeedBack} from "@/api/project/feedBack";

  export default {
    name: "ToDoInspection",
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
      return {
        test: '待办巡检',
        dialogVisible: false,
        page:{
          pageSize: 10,
          currentPage: 1,
          total: 0
        },
        query: {
          projectId: '',
          inspectionId:'',
          inspectStatus:'1'
        },
        form: {
          projectId: '',
        },
        backForm:{
          inspectName:'',
          number:'',
          createUser:'',
          inspectionId:'',//巡检id
          projectId: '',
        },
        data:[],
        option:{
          size:'mini',
          border:true,
          menuWidth:130,
          align:'center',
          addBtn:false,
          columnBtn:false,
          viewBtn:true,
          editBtn: false,
          delBtn: false,
          index:true,
          indexLabel:'序号',
          dialogWidth:'50%',
          dialogTop:15,
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
              hide: true
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
              editDisplay: false,
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
              editDisabled:true,
              editDisplay: false
            },
            {
              label:"巡检名称",
              prop:"inspectName",
              editDisabled:true,
              search: true
            },
            {
              label: "巡检编号",
              prop: "number",
              editDisabled:true,
              hide:true
            },
            {
              label: "施工单位",
              prop: "constructionUnitId",
              type: "select",
              dicUrl: "/api/blade-system/dict-biz/dictionary?code=unit",
              props: {
                label: "dictValue",
                value: "dictKey"
              },
              editDisplay: false
            },
            {
              label: "监理单位",
              prop: "supervisorUnitId",
              type: "select",
              dicUrl: "/api/blade-system/dict-biz/dictionary?code=unit",
              props: {
                label: "dictValue",
                value: "dictKey"
              },
              editDisplay: false
            },
            {
              label: "建设单位",
              prop: "buildUnitId",
              type: "select",
              dicUrl: "/api/blade-system/dict-biz/dictionary?code=unit",
              props: {
                label: "dictValue",
                value: "dictKey"
              },
              editDisplay: false
            },
            {
              label: '',
              labelWidth:10,
              prop: 'divider',
              component: 'elDivider',//ele分割线
              hide:true,
              span:24,
              editDisplay: false
            },
            {
              label: "发起人",
              prop: "createUser",
              type: 'select',
              dicUrl: "/api/blade-user/userNameList",
              props: {
                label: "name",
                value: "id"
              },
              editDisabled:true,
              search:true
            },
            {
              label: "发起时间",
              prop: "createTime",
              type: 'date',
              valueFormat: 'yyyy-MM-dd',
              format: 'yyyy-MM-dd',
              editDisabled:true,
            },
            {
              label: "巡检人员",
              prop: "userId",
              type: 'select',
              dicUrl: "/api/blade-user/userNameList",
              props: {
                label: "name",
                value: "id"
              },
              editDisabled:true,
              hide: true
            },
            {
              label: "检查日期",
              prop: "inspectDate",
              type:'date',
              format: "yyyy-MM-dd",
              valueFormat: "yyyy-MM-dd",
              editDisabled:true,
            },
            {
              label: "巡检事项",
              prop: "matter",
              type: 'textarea',
              editDisplay: false,
              span:24
            },
            {
              label: "巡检状态",
              prop: "inspectStatus",
              type: 'select',
              dicUrl: "/api/blade-system/dict-biz/dictionary?code=inspect_status",
              props: {
                label: "dictValue",
                value: "dictKey"
              },
              addDisplay: false,
              viewDisplay: false,
              editDisplay: false
            }
          ]
        },
        backOption:{
          emptyBtn:false,
          submitBtn:false,
          labelWidth:100,
          size:'mini',
          column: [
            {
              label:"巡检名称",
              prop:"inspectName",
              disabled:true,
              search: true
            },
            {
              label: "巡检编号",
              prop: "number",
              disabled:true,
              hide:true
            },
            {
              label: "发起人",
              prop: "createUser",
              type: 'select',
              dicUrl: "/api/blade-user/userNameList",
              props: {
                label: "name",
                value: "id"
              },
              disabled:true,
              search:true
            },
            {
              label:"巡检时间",
              prop:"inspectionDate",
              type: 'date',
              format: "yyyy-MM-dd",
              valueFormat: "yyyy-MM-dd"
            },
            {
              label:"是否整改",
              prop: "isRectification",
              rules:[{
                required: true,
                trigger:"change",
                message: "请选择是否整改"
              }],
              type: 'select',
              dicData: [
                {value: "是"},
                {value: "否"}
              ]
            },
            {
              label:"限期整改日期",
              prop: "lastDate",
              type: "date",
              format: "yyyy-MM-dd",
              valueFormat: "yyyy-MM-dd"
            },
            {
              label:"整改内容",
              prop: "content",
              rules: [{
                validator:inputContentReg,
                trigger: "change",
              }],
              type: 'textarea',
              overHidden:true,
              span:24
            }
          ]
        }
      }
    },
    mounted() {
      if (this.projectId === undefined || this.projectId.trim() === ''){
        this.projectId = this.$route.params.projectId
      }
    },
    methods:{
      beforeOpenDialog(done,type) {
        // 表单打开前方法
        if (this.projectData !== undefined) {
          this.form['projectName'] = this.projectData['name']
          this.form['projectId'] = this.projectData['id']
          this.form['stage'] = this.projectData['stage']
          this.form['classification'] = this.projectData['classification']
          this.form['code'] = this.projectData['code']
        }
        // this.feedBackOption.header = false
        if (["view"].includes(type)) {

          getInspectionDetail(this.form.id).then(res => {
            this.form = res.data.data;
          });
        }
        done()
      },
      //点击办理
      feedBackClick(row){
        this.backForm.inspectName = row.inspectName
        this.backForm.number = row.number
        this.backForm.createUser = row.createUser
        this.backForm.inspectionId = row.id
        this.backForm.projectId = row.projectId
        this.dialogVisible = true
      },
      //提交巡检反馈
      saveFeedBack() {
        console.log("=====巡检反馈==",this.backForm)
        addFeedBack(this.backForm).then(() => {
          this.$message({
            type: "success",
            message: "操作成功!",
          });
          this.onLoad(this.page);
          this.dialogVisible = false
        }, error => {
          window.console.log(error);
        });
      },
      searchReset() {
        this.query = { inspectStatus: "1"};
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
        this.query.inspectStatus = '1'
        getWaitInspectionPage(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
          const data = res.data.data;
          console.log("获取待办巡检++======",res)
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
