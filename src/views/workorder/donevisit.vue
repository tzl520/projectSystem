<template>
  <basic-container>
    <avue-crud :option="option"
               :table-loading="loading"
               :data="data"
               :page.sync="page"
               :before-open="beforeOpen"
               v-model="form"
               ref="crud"
               @search-change="searchChange"
               @search-reset="searchReset"
               @selection-change="selectionChange"
               @current-change="currentChange"
               @size-change="sizeChange"
               @refresh-change="refreshChange"
               @on-load="onLoad">
      <template slot-scope="{type,size,row}" slot="menu">
        <el-button :size="size" icon="el-icon-view" :type="type" @click="showMore(row,true)">查看</el-button>
      </template>
    </avue-crud>
    <el-dialog :visible.sync="dialogFormVisible" :modal="false" top="3vh" width="60%">
        <div class="dialogDiv">
        <el-tabs v-model="activeName">
          <el-tab-pane label="工单信息" name="first">
            <give-form :give-form-data="giveForm.data" :is-read-only="true"
                       :show-btn="false" @close="dialogFormVisible = false"></give-form>
<!--            <project-upload-->
<!--              :project-id="projectId"-->
<!--              :link-id="id"-->
<!--              :link-type="linkType"-->
<!--              :attach-only.sync="attachOnly"-->
<!--              :crud-height="240"-->
<!--              :data.sync="projectAttachList"-->
<!--              @uploadFileSuccess="uploadFileSuccess"-->
<!--              @delFileSuccess="delFileSuccess"-->
<!--              @empowerFile="empowerFile"-->
<!--            ></project-upload>-->
          </el-tab-pane>
          <el-tab-pane label="催办信息" name="second" v-if="this.dialogFormUrging.length !== 0">
            <div class="blockDiv">
              <el-timeline>
                <el-timeline-item v-for="item in dialogFormUrging" :key="item.id" :timestamp="item.createTime" placement="top">
                  <el-card>
                    <p>催办方式：{{ showUrging(item.reminderWay) }}</p>
                    <p>催办内容：{{ item.reminderContent }}</p>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-tab-pane>
          <el-tab-pane label="完工信息" name="third">
            <div class="block">
            <el-timeline>
              <el-timeline-item v-for="item in dialogFormEnd"
                                :key="item.id"
                                :timestamp="item.createTime"
                                placement="top"
                               >
                <el-card>
                  <p>完成编号：{{ item.finishNumber }}</p>
                  <p>实施人员：{{ showNameById(item.implementPeople) }}</p>
                  <p>开始时间：{{ item.practicalTime }}</p>
                  <p>结束时间：{{ item.submitTime }}</p>
                </el-card>
              </el-timeline-item>
            </el-timeline></div>
          </el-tab-pane>
          <el-tab-pane label="回访信息" name="fourth">
            <div class="block">
              <el-timeline>
                <el-timeline-item v-for="item in dialogAgainForm" :key="item.id" :timestamp="item.time" placement="top">
                  <el-card>
                    <p>回访人：{{ showNameById(item.returnPeople) }}</p>
                    <p>回访内容：{{item.returnContent}}</p>
                    <p>回访时间：{{item.time}}</p>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-tab-pane>
        </el-tabs> </div>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button size="mini" @click="dialogFormVisible = false">关  闭</el-button>
      </div>
    </el-dialog>
  </basic-container>
</template>


<script>
import {getList} from "@/api/workorder/returnvisit";
import {mapGetters} from "vuex";
import GiveForm from "@/views/workorder/form/giveForm";
import {getDetail} from "@/api/workorder/reminder"
import projectUpload from "@/components/file-upload/project-upload";
import {getGiveView} from "@/api/workorder/replied";
import {getUserNameList, getUserUrging} from "@/api/workorder/common"
export default {
  components: {GiveForm,projectUpload},
  data() {
    return {
      projectId: undefined,
      id: undefined,
      //tab页默认显示第1页
      activeName: 'first',
      linkType: 'finish',
      attachOnly: true,
      form: {},
      projectAttachList: [],
      dialogFormUrging: [],
      dialogFormEnd: [],
      dialogAgainForm: [],
      userList: [],
      urgingList:[],
      giveForm:{
        dialogTitle: '查看',
        dialogVisible: false,
        submitLoading: false,
        isReadOnly: false,
        data: {}
      },
      query: {
        returnStatus : "2"
      },
      loading: true,
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0
      },
      dialogFormVisible : false,
      selectionList: [],
      option: {
        align: "center",
        size: "mini",
        printBtn:true,
        indexLabel:'序号',
        labelWidth: 100,
        height:'auto',
        calcHeight: 30,
        tip: false,
        searchShow: true,
        editBtn: false,
        searchMenuSpan: 4,
        border: true,
        index: true,
        addBtn:false,
        excelBtn: false,
        delBtn: false,
        viewBtn: false,
        selection: true,
        dialogClickModal: false,
        column: [
          {
            label: "工单编号",
            prop: "giveWorkOrderNumber",
            bind: "give.workOrderNumber"
          },
          {
            label: "工单编号",
            prop: "workOrderNumber",
            search: true,
            hide: true,
            showColumn: false
          },
          {
            label: "工单名称",
            prop: "giveWorkOrderName",
            bind: "give.workOrderName",
          },
          {
            label: "工单名称",
            prop: "workOrderName",
            search: true,
            hide: true,
            showColumn: false
          },{
            label: "工单类型",
            prop: "giveWorkOrderType",
            type:'select',
            bind: "give.workOrderType",
            dicUrl: '/api/workorder/worktype/list',
            props: {
              label: "typeName",
              value: "id"
            },
          },{
            label: "工单类型",
            prop: "workOrderType",
            type:'select',
            search: true,
            dicUrl: '/api/workorder/worktype/list',
            props: {
              label: "typeName",
              value: "id"
            },
            hide: true,
            showColumn: false,
            searchFilterable: true,
          },
          {
            label: "优先级",
            prop: "priorityj",
            bind: "give.priority",
            type: "select",
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=priority",
            props: {
              label: "dictValue",
              value: "dictKey"
            },
          },{
            label: "优先级",
            prop: "priority",
            type: "select",
            search: true,
            hide: true,
            showColumn: false,
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=priority",
            props: {
              label: "dictValue",
              value: "dictKey"
            },
          },
          {
            label: "工单完成时间",
            prop: "finishStartTime",
            bind: "give.finishStartTime",
            type: 'date',
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd',
          },
          {
            label: "接收人",
            prop: "giveRelationPeople",
            bind: "give.receiver",
            dicUrl: "/api/blade-user/userNameList",
            props: {
              label: "name",
              value: "id"
            },
          },
          {
            label: "接收人",
            prop: "receiver",
            search: true,
            type:'select',
            dicUrl: "/api/blade-user/userNameList",
            props: {
              label: "name",
              value: "id"
            },
            hide: true,
            showColumn: false
          }]
      },
      data: []
    };
  },
  computed: {
    ...mapGetters(["permission"]),
    ids() {
      let ids = [];
      this.selectionList.forEach(ele => {
        ids.push(ele.id);
      });
      return ids.join(",");
    }
  },
  mounted() {
    getUserNameList().then(res => {
      this.userList = res.data.data
    })
    getUserUrging().then( res =>{
      this.urgingList = res.data.data
    })
  },
  methods: {
    showNameById(userId) {
      for (const user of this.userList) {
        if (userId === user.id) {
          return user.realName
        }
      }
      return ''
    },
    //循环展示字典中的值
    showUrging(userId) {
      for(const user of this.urgingList) {
        if(userId === user.dictKey){
          //这是催办方式dictValue
          return user.dictValue
        }
      }
      return ''
    },
    attach(attachList){
      this.projectAttachList = attachList
    },
    showMore(row,readonly = true){
      this.giveForm.isReadOnly=readonly
      this.dialogFormVisible = true
      this.giveForm.dialogVisible=true
      this.giveForm.dialogTitle="查看"
      getGiveView(row.giveId).then((res) =>{
        //dialogFormEnd这是完工信息的列表
        this.dialogFormEnd = res.data.data.finishList || []
        //dialogFormUrging这是催办信息的列表
        this.dialogFormUrging = res.data.data.reminderList || []
        //让页面的tab页永远显示第一个tab页
        if (this.dialogFormUrging !== undefined) {
          this.activeName = 'first'
        }
        //dialogAgainForm这是回访信息的列表
        this.dialogAgainForm = res.data.data.returnVisitList || []
      })
      // 浅拷贝
      this.giveForm.data = Object.assign({}, row.give || {})
      // this.$refs.giveForm.allDisabled = true
    },
    beforeOpen(done, type) {
      if (["edit", "view"].includes(type)) {
        getDetail(this.form.id).then(res => {
          this.form = res.data.data;
        });
      }
      done();
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
      getList(page.currentPage, page.pageSize, Object.assign(params, this.query = {returnStatus: "2"})).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        this.data = data.records;
        this.loading = false;
        this.selectionClear();
      });
    }
  }
};
</script>

<style scoped>
.dialogDiv {
  height: 60vh;
  overflow: auto;
}
/* /deep/ .el-timeline-item__node {*/
/*  background-color: #409EFF;*/
/*}*/
</style>

