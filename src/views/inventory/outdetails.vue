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
      <!--<template  slot-scope="scope" slot="menuLeft">-->
        <!--<el-button type="info"-->
                   <!--size="mini"-->
                   <!--icon="el-icon-takeaway-box"-->
                   <!--plain>导出-->
        <!--</el-button>-->
      <!--</template>-->
    </avue-crud>
  </basic-container>
</template>

<script>
  import {getOutDetailsList, getDetail, add, update, remove} from "@/api/inventory/productlistrecords";
  import {mapGetters} from "vuex";

  export default {
    data() {
      return {
        form: {},
        query: {},
        loading: true,
        page: {
          pageSize: 10,
          currentPage: 1,
          total: 0
        },
        selectionList: [],
        option: {
          height: 'auto',
          calcHeight: 30,
          tip: false,
          searchShow: true,
          searchMenuSpan: 6,
          border: true,
          index: true,
          indexLabel: '序号',
          viewBtn: true,
          selection: true,
          size: 'mini',
          align: 'center',
          addBtn: false,
          dialogWidth: '45%',
          viewBtnText: '详情',
          editBtn: false,
          delBtn: false,
          column: [
            {
              label: '单据日期',
              prop: 'documentDate'
            },
            {
              label: '单据类型',
              prop: 'documentType'
            },
            {
              label: '项目名称',
              prop: 'projectPresetId',
              filterable: true,
              searchFilterable: true,
              search: true,
              dicData: []
            },
            {
              label: '项目代码',
              prop: 'code'
            },
            {
              label: '货品类别',
              prop: 'categoryId',
              search: true
            },
            {
              label: '货品编号',
              prop: 'productCode'
            },
            {
              label: '货品名称',
              prop: 'productName',
              search: true
            },
            {
              label: '规格',
              prop: 'norms'
            },
            {
              label: '单位',
              prop: 'unit'
            },
            {
              label: '图片',
              prop: 'image'
            },
            {
              label: '单价',
              prop: 'unitPrice'
            },
            {
              label: '单号',
              prop: 'productListOddNumber'
            },
            {
              label: '上期数量',
              prop: 'previousBalance'
            },
            {
              label: '入库数量',
              prop: 'currentStockIn'
            },
            {
              label: '出库数量',
              prop: 'currentStockOut'
            },
            {
              label: '结存数量',
              prop: 'closingBalance'
            },
          ]},
        data: []
      };
    },
    computed: {
      ...mapGetters(["permission"]),
      permissionList() {
        return {
          addBtn: this.vaildData(this.permission.projectdetails_add, false),
          viewBtn: this.vaildData(this.permission.projectdetails_view, false),
          delBtn: this.vaildData(this.permission.projectdetails_delete, false),
          editBtn: this.vaildData(this.permission.projectdetails_edit, false)
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
        getOutDetailsList(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
          console.log('0000000000000-==-=-=-=-',res);
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
