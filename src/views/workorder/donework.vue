<template>
<!--  这是已办工单页面 -->
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
      <template slot="priority" slot-scope="scope">
        <el-tag v-show="scope.row.give.priority === '1'" type="danger" :size="scope.size">{{scope.row.$priority}}</el-tag>
        <el-tag v-show="scope.row.give.priority === '2'" type="warning" :size="scope.size">{{scope.row.$priority}}</el-tag>
        <el-tag v-show="scope.row.give.priority === '3'" type="success" :size="scope.size">{{scope.row.$priority}}</el-tag>
        <el-tag v-show="scope.row.give.priority === '4'" type="primary" :size="scope.size">{{scope.row.$priority}}</el-tag>
      </template>
      <template slot-scope="{type,size,row}" slot="menu">
        <el-button icon="el-icon-view" :size="size" :type="type" @click="showMore(row)">查看</el-button>
      </template>
    </avue-crud>
    <el-dialog :visible.sync="dialogFormVisible" :modal="false" width="40%">
      <template>
        <div class="dialogDiv">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="完工信息" name="first">
            <div class="block">
              <el-timeline>
                <el-timeline-item v-for="item in dialogFormEnd" :key="item.id" :timestamp="item.createTime" placement="top" :type="item.success" :icon="item.icon">
                  <el-card>
                    <p>完成编号：{{ item.finishNumber }}</p>
                    <p>实施人员：{{ showNameById(item.implementPeople) }}</p>
                    <p>开始时间：{{ item.practicalTime }}</p>
                    <p>结束时间：{{ item.submitTime }}</p>
                  </el-card>
                </el-timeline-item>
              </el-timeline></div>
          </el-tab-pane>
          <el-tab-pane label="催办信息" name="second" v-if="this.dialogFormUrging.length !== 0">
            <div class="block">
              <el-timeline>
                <el-timeline-item v-for="item in dialogFormUrging" :key="item.id" :timestamp="item.createTime" placement="top">
                  <el-card>
                    <p>催办方式：{{ showUrging(item.reminderWay) }}</p>
                    <p>催办内容：{{ item.reminderContent }}</p>
                  </el-card>
                </el-timeline-item>
              </el-timeline></div>
          </el-tab-pane>
        </el-tabs>
        </div>
      </template>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button @click="dialogFormVisible = false" size="mini">关 闭</el-button>
      </div>
    </el-dialog>

  </basic-container>
</template>


<script>
import {getList} from "@/api/workorder/replied";
import {mapGetters} from "vuex";
import GiveForm from "@/views/workorder/form/giveForm";
import {getDetailFinish} from "@/api/workorder/finish";
import {getUserNameList, getUserUrging} from "@/api/workorder/common"
export default {
  components: {GiveForm},
  data() {
    return {
      //tab页默认显示第1页
      activeName: 'first',
      form: {},
      dialogForm:{
        giveId:''
      },
      //解决传过来的是数字不是中文的办法
      userList: [],
      urgingList:[],
      dialogFormUrging: [],
      dialogFormEnd: [],
      giveForm:{
        dialogTitle: '查看',
        dialogVisible: false,
        submitLoading: false,
        isReadOnly: false,
        data: {}
      },
      query: {
      },
      loading: true,
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0
      },
      dialogFormVisible : false,
      selectionList: [],
      dialogFormOption:{
        submitBtn: false,
        emptyBtn: false
      },
      option: {
        align: "center",
        size: "mini",
        indexLabel:'序号',
        labelWidth: 100,
        height:'auto',
        calcHeight: 30,
        tip: false,
        searchShow: true,
        editBtn: false,
        searchMenuSpan: 4,
        printBtn: true,
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
            hide: true,
            type:'select',
            dicUrl: "/api/blade-user/userNameList",
            props: {
              label: "name",
              value: "id"
            },
            showColumn: false
          }]
      },
      //完工信息
      dialogFormEndOption: {
        emptyBtn: false,
        submitBtn: false,
        column: [
          {
            label: "完成编号",
            disabled: true,
            prop: "finishNumber",
            span:20,
            placeholder: "无",
            row: true
          },
          {
            disabled: true,
            label: "实施人员",
            prop: "implementPeople",
            dicUrl: "/api/blade-user/userNameList",
            props: {
              label: "name",
              value: "id"
            },
            placeholder: "无",
            span:20,
            row: true
          },
          {
            label: "开始时间",
            disabled: true,
            prop: "practicalTime",
            type: "date",
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd',
            span:20,
            placeholder: "无",
            row: true
          },{
            label: "结束时间",disabled: true,
            prop: "submitTime",
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd',
            type: "date",
            placeholder: "无",
            span:20,
            row: true
          }]
      },
      //催办
      dialogFormOptionUrging: {
        emptyBtn:false,
        submitBtn:false,
        labelWidth: 100,
        column: [
          {
            label: "催办方式",
            type: "select",
            disabled: true,
            prop:"reminderWay",
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=reminder_way",
            props: {
              label: "name",
              value: "id"
            },
            span: 20,
            row: true
          },{
            label: "催办内容",
            prop: "reminderContent",
            type: "textarea",
            span: 20,
            disabled: true,
            row: true
          }],
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
    //自定义对话框tab页
    showMore(row){
      getDetailFinish(row.giveId).then((res) =>{
          this.dialogFormEnd = res.data.data.finishList || []
          this.dialogFormUrging =res.data.data.reminderList || []
          if (this.dialogFormUrging !== undefined) {
            this.activeName = 'first'
        }
      })
      this.dialogFormVisible = true
    },
    handleClick(){},
    beforeOpen(done, type) {
      if (["edit", "view"].includes(type)) {
        getDetailFinish(this.form.id).then(res => {
          this.form = res.data.data;
        });
      }
      done();
    },
    searchReset() {
      this.query = {backeStatus: "0"};
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
      getList(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
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
  height: 45vh;
}
</style>

