<template>
  <basic-container>
    <avue-crud :option="option"
               :table-loading="loading"
               :data="data.map(item=>{item.give.receiver==='-1'|| item.give.receiver===-1 ? item.give.receiver = '': item.give.receiver;return item})"
               :page.sync="page"
               :permission="permissionList"
               :before-open="beforeOpen"
               v-model="form"
               ref="crud"
               @row-update="rowUpdate"
               @row-save="rowSave"
               @row-del="rowDel"
               @search-change="searchChange"
               @search-reset="searchReset"
               @selection-change="selectionChange"
               @current-change="currentChange"
               @size-change="sizeChange"
               @refresh-change="refreshChange"
               @on-load="onLoad">
      <template slot-scope="{type,size,row}" slot="menu">
        <el-button icon="el-icon-view" :size="size" :type="type" @click="statuView(row)">详情</el-button>
      </template>
    </avue-crud>
    <el-dialog
      :visible.sync="dialogVisible"
      width="30%"
      :modal="false"
    >
      <avue-form :option="dialogFormOption" v-model="dialogForm" @row-del="rowDel" ref="dialogForm">
      </avue-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false" size="mini">关闭</el-button>
  </span>
    </el-dialog>
  </basic-container>
</template>


<script>
import {getList, getDetail, add, update, remove} from "@/api/workorder/close";
import {mapGetters} from "vuex";


export default {
  data() {
    return {
      form: {},
      dialogForm: {
        giveId:'',
        data: {}
      },
      query: {},
      loading: true,
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0
      },
      dialogVisible : false,
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
        searchMenuSpan: 4,
        border: true,
        index: true,
        addBtn:false,
        delBtn: false,
        editBtn: false,
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
      // 这是对话框里面的小表单
      dialogFormOption: {
        emptyBtn:false,
        submitBtn:false,
        column: [
          {
          label: "关闭原因",
          disabled: true,
            placeholder: false,
          prop: 'closeCause',
          span: 24,
        },{
          label: "关闭时间",
          prop: 'closeTime',
          placeholder: false,
          disabled: true,
          valueFormat: 'yyyy-MM-dd HH:mm:ss',
          format: 'yyyy-MM-dd HH:mm:ss',
          span: 24,
        }
        ]
      },
      data: []
    };
  },
  computed: {
    ...mapGetters(["permission"]),
    permissionList() {
      return {
        addBtn: this.vaildData(this.permission.give_add, false),
        viewBtn: this.vaildData(this.permission.give_view, false),
        delBtn: this.vaildData(this.permission.give_delete, false),
        editBtn: this.vaildData(this.permission.give_edit, false)
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
  methods: {
    statuView(row){
      getDetail(row.id).then((res) => {
        this.dialogVisible = true
        // this.dialogForm.id = row.giveId
         this.dialogForm = Object.assign({}, res.data.data || {})
      })
    },
    rowSave(row, done, loading) {
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
        });
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

