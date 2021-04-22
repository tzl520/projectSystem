<template>
  <basic-container>
    <avue-crud :option="option"
               :table-loading="loading"
               :data="data.map(item=>{item.give.receiver==='-1'|| item.give.receiver===-1 ? item.give.receiver = '': item.give.receiver;return item})"
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
        <el-button :size="size" :type="type" @click="noClick(row)">详情</el-button>
        <el-button :size="size" :type="type" @click="endHang(row)">恢复</el-button>
      </template>
    </avue-crud>
    <el-dialog
      :visible.sync="giveForm.dialogVisible"
      :title="giveForm.dialogTitle"
      width="60%"
      :modal="false"
    >
      <give-form :submit-loading.sync="giveForm.submitLoading" :give-form-data="giveForm.data" :is-read-only="giveForm.isReadOnly" @close="giveForm.dialogVisible = false"></give-form>
    </el-dialog>
    <el-dialog :visible.sync="dialogFormVisible" :modal="false" width="30%">
      <avue-form :option="dialogFormOption" v-model="dialogForm"  ref="dialogForm">
      </avue-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false" size="mini">关闭</el-button>
      </div>
    </el-dialog>

  </basic-container>
</template>


<script>
import {getDetail, getList, hangRecovery} from "@/api/workorder/hangup";
import {mapGetters} from "vuex";
import GiveForm from "@/views/workorder/form/giveForm";
// import {sign} from "@/api/workorder/backe";

export default {
  components: {GiveForm},
  data() {
    return {
      form: {},
      dialogForm:{
        id:'',
        giveId: ''
      },
      giveForm:{
        dialogTitle: '查看',
        dialogVisible: false,
        submitLoading: false,
        isReadOnly: false,
        data: {}
      },
      query: {
        hangUpBackeStatus: "4"
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
            hide: true,
            type: 'select',
            dicUrl: "/api/blade-user/userNameList",
            props: {
              label: "name",
              value: "id"
            },
            showColumn: false
          }]
      },
      dialogFormOption: {
        emptyBtn: false,
        submitBtn: false,
        labelWidth: 100,
        column: [
          {
            label: "工单挂起原因",
            prop: "hangUpReson",
            span:24,
            disabled :true
          },
          {
            label: "挂起开始时间",
            prop: "hangUpStartTime",
            type: 'date',
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd',
            disabled :true,
            span:24
          },
          {
            label: "挂起结束时间",
            prop: "hangUpEndTime",
            type: 'date',
            disabled :true,
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd',
            span:24
          }
        ]
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
  methods: {
    // 这里是恢复挂起的按钮
    endHang(row){
      console.log(row)
        this.$confirm( '确定恢复该工单?', '提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          hangRecovery(row.id,row.giveId).then( res => {
            const type = res.data.success ? "success" : "error"
            this.$message({
              message: '恢复成功!',
              type: type
            })
            this.onLoad(this.page)
          })
        }).catch((error)=>{
          console.log(error)
        })
    },
    noClick(row){
      getDetail(row.id).then((res) => {
        this.dialogFormVisible = true
        //res.data.data || {}为了防止当这一行数据为空值的时候不报错
        this.dialogForm = Object.assign({},res.data.data || {})
        // this.$refs.dialogForm.allDisabeld = true
      })
      this.dialogForm.id = row.id
      this.dialogForm.giveid=row.giveId
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
      this.query = {hangUpBackeStatus: "4"};
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

<style>
</style>

