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
        <template slot="menuLeft">
          <el-button type="danger"
                     size="mini"
                     icon="el-icon-delete"
                     plain
                     @click="handleDelete">删 除
          </el-button>
        </template>
        <template slot="projectInspectionFeedbackListForm" slot-scope="scope">
          <avue-crud :option="feedBackOption" :data="form.projectInspectionFeedbackList">
          </avue-crud>
        </template>

      </avue-crud>
    </el-row>
  </basic-container>
</template>

<script>
  import {getInspectionPage,getInspectionDetail,remove} from '@/api/project/inspection'

export default {
  name: "InspectionCompleted",
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
    return {
      test: '已完成巡检',
      page:{
        pageSize: 10,
        currentPage: 1,
        total: 0
      },
      form: {
        projectId:'',
        projectInspectionFeedbackList: []
      },
      query: {
        projectId: '',
        inspectStatus:'2'
      },
      selectionList: [],
      data:[],
      option:{
        viewBtnText:'查看反馈',
        size:'mini',
        border:true,
        menuWidth:95,
        align:'center',
        indexLabel:'序号',
        columnBtn:false,
        delBtn: false,
        addBtn:false,
        editBtn: false,
        viewBtn: true,
        index:true,
        selection: true,
        selectionWidth:40,
        tip: false,
        dialogWidth:'50%',
        dialogTop:15,
        dialogHeight:600,
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
            viewDisplay: false,
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
            viewDisplay: false,
            addDisabled: true,
            editDisabled:true
          },
          {
            label: "编号",
            prop: "number"
          },
          {
            label:"巡检名称",
            prop:"inspectName",
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
            filterable: true,
            search:true,
            hide:true
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
            filterable: true,
            search:true,
            hide:true
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
            filterable: true,
            search:true,
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
            rules: [{
              required: true,
              message: "请选择巡检人员",
              trigger: "blur"
            }]
          },
          {
            label: "检查日期",
            prop: "inspectDate",
            type: 'date'
          },
          {
            label: "巡检事项",
            prop: "matter",
            type: 'textarea',
            span:24
          },
          {
            label: "巡检状态",
            prop: "inspectStatus",
            search:true,
            width: 70,
            type: 'select',
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=inspect_status",
            props: {
              label: "dictValue",
              value: "dictKey"
            },
            viewDisplay: false,
            addDisplay: false,
            editDisabled: true,
          },
          {
            label: '',
            labelWidth:10,
            prop: 'divider',
            component: 'elDivider',//ele分割线
            params: {
              html: '<p style="font-size: 18px">巡检反馈</p>',
              contentPosition: "left",
            },
            hide:true,
            span:24,
            addDisplay: false
          },
          {
            labelWidth:0,
            label: '',
            prop: 'projectInspectionFeedbackList',
            span:24,
            hide:true,
            formslot:true,
            addDisplay: false
          },
        ]
      },
      feedBackOption:{
        header:false,
        border:true,
        editBtn: false,
        delBtn:false,
        viewBtn:true,
        menuWidth: 80,
        labelWidth:100,
        dialogWidth:'40%',
        dialogHeight:450,
        dialogTop:20,
        align:'center',
        column: [
          {
            label:"巡检时间",
            prop:"inspectionDate",
          },
          {
            label:"反馈人",
            prop: "userId",
            dicUrl: "/api/blade-user/userNameList",
            props: {
              label: "name",
              value: "id"
            }
          },
          {
            label:"是否需要整改",
            prop: "isRectification"
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
            type: 'textarea',
            overHidden:true,
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
  mounted() {
    if (this.projectId === undefined || this.projectId.trim() === ''){
      this.projectId = this.$route.params.projectId
    }
  },
  methods: {

    beforeOpenDialog(done,type) {
      // 表单打开前方法
      if (this.projectData !== undefined) {
        this.form['projectName'] = this.projectData['name']
        this.form['projectId'] = this.projectData['id']
        this.form['stage'] = this.projectData['stage']
        this.form['classification'] = this.projectData['classification']
        this.form['code'] = this.projectData['code']
      }
      if (["view"].includes(type)) {
        getInspectionDetail(this.form.id).then(res => {
          console.log("============查看反馈*******=============",res);
          this.form = res.data.data;
        });
      }
      done()
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
      this.query.inspectStatus = '2'
      getInspectionPage(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
        const data = res.data.data;
        console.log("获取巡检++======",res)
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
