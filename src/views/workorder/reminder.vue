<template>
  <basic-container>
    <avue-crud :option="option"
               :table-loading="loading"
               :data="data"
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
      <template slot="priority" slot-scope="scope">
        <el-tag v-show="scope.row.give.priority === '1'" type="danger" :size="scope.size">{{scope.row.$priority}}</el-tag>
        <el-tag v-show="scope.row.give.priority === '4'" type="primary" :size="scope.size">{{scope.row.$priority}}</el-tag>
        <el-tag v-show="scope.row.give.priority === '3'" type="success" :size="scope.size">{{scope.row.$priority}}</el-tag>
        <el-tag v-show="scope.row.give.priority === '2'" type="warning" :size="scope.size">{{scope.row.$priority}}</el-tag>
      </template>
      <template slot-scope="{type,size}" slot="menu">
        <el-button icon="el-icon-check" :size="size" :type="type" @click="dialogVisible = true">催办</el-button>
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
    <el-button @click="dialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="distribution">确 定</el-button>
  </span>
    </el-dialog>
  </basic-container>
</template>


<script>
import {getList, getDetail, add, update, remove, commit} from "@/api/workorder/give";
import {mapGetters} from "vuex";


export default {
  data() {
    return {
      form: {},
      dialogForm: {},
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
        size: "mini",
        labelWidth: 100,
        height:'auto',
        calcHeight: 30,
        tip: false,
        searchShow: true,
        searchMenuSpan: 6,
        border: true,
        index: true,
        addBtn:false,
        delBtn: false,
        viewBtn: true,
        viewBtnText: "详情",
        selection: true,
        dialogClickModal: false,
        column: [
          {
            label: "工单编号",
            prop: "workOrderNumber",
            type: "select",
            search: true,
            searchFilterable: true
          },
          {
            label: "工单名称",
            prop: "workOrderName",
            type: "select",
            search: true,
            searchFilterable: true
          }, {
            label: "工单类型",
            prop: "workOrderType",
            type: "select",
            search: true,
            searchFilterable: true,
          },
          {
            label: "优先级",
            prop: "priority",
            type: "select",
            search: true,
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=priority",
            props: {
              label: "dictValue",
              value: "dictKey"
            },
          },
          {
            label: "状态",
            prop: "workOrderState",
            type: "select",
            search: true,
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=work_order_state",
            props: {
              label: "dictValue",
              value: "dictKey"
            },
          },
          {
            label: "工单完成时间",
            prop: "finishEndTime",
            type: 'date',
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd',
          },
          {
            label: "接收人",
            prop: "relationPeople",

          }]
      },
      // 这是对话框里面的小表单
      dialogFormOption: {
        emptyBtn:false,
        submitBtn:false,
        column: [{
          label: "接收人",
          prop: "receivePeople",
          filterable: true,
          dicUrl: "/api/blade-system/role/list",
          props: {
            label: "roleName",
            value: "id"
          },
          type: "select",
          rules: [{
            required: true,
            message: "请选择接收人",
            trigger: "blur",
          }],
          span: 24,
        },{
          label: "接收说明",
          prop: "receiveExplain",
          type: "textarea",
          rules: [{
            message: "请填写接收说明",
            trigger: "blur"
          }],
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
    // 这是派发工单确认的按钮
    distribution(){
      console.log(this.$refs.dialogForm)
      this.$refs.dialogForm.validate(isvalidate => {
        if (!isvalidate) {
          console.log('验证不通过')
          return
        }else {
          console.log(this.dialogForm)
          // 这是将整个表单中的数据合并在一个object中
          const subBtn = Object.assign(this.dialogForm)
          commit(subBtn).then( res => {
            console.log(res.data)
            const type = res.data.success ? "success" : "error"
            console.log(type)
            this.$confirm(res.data.msg,{
              confirmButtonText: "确定",
              showCancelButton: false,
              closeOnClickModal: false,
              closeOnPressEscape: false,
              showClose: false,
              type: type
            }).then(() =>{
              //这是将表单中的所有数据全部清空
              this.$refs.dialogForm.resetForm()
              // 这是取消组件自带的所有元素禁用按钮
              this.$refs.dialogForm.allDisabled = false
              // 对话框窗口关闭
              this.dialogVisible = false
            })
          })
        }
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
          this.$refs.crud.toggleSelection();
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

