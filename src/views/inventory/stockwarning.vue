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
      <template slot="menuLeft">
        <el-button type="danger"
                   size="mini"
                   icon="el-icon-delete"
                   plain
                   v-if="permission.stockwarning_delete"
                   @click="handleDelete">删 除
        </el-button>
      </template>
    </avue-crud>
  </basic-container>
</template>

<script>
  import {getList, getDetail, add, update, remove} from "@/api/inventory/stockwarning";
  import {getProductList} from '@/api/inventory/product';
  import {mapGetters} from "vuex";

  export default {
    data() {
      return {
        form: {
          productId: '',
          productCode: '',
          norms: ''
        },
        query: {},
        loading: true,
        page: {
          pageSize: 10,
          currentPage: 1,
          total: 0
        },
        selectionList: [],
        productData: [],
        option: {
          height:'auto',
          calcHeight: 30,
          tip: false,
          searchShow: true,
          searchMenuSpan: 6,
          border: true,
          index: true,
          indexLabel: '序号',
          viewBtn: true,
          selection: true,
          dialogClickModal: false,
          dialogWidth: '45%',
          size: 'mini',
          addTitle: '库存预警',
          labelWidth: 110,
          column: [
            {
              label: "货品名称",
              prop: "productId",
              rules: [{
                required: true,
                message: "请输入货品名称",
                trigger: "blur"
              }],
              dicData: [],
              type: 'select',
              search: true
            },
            {
              label: "货品编号",
              prop: "productCode",
              rules: [{
                required: true,
                message: "请输入货品编号",
                trigger: "blur"
              }],
              readonly: true,
              search: true
            },
            {
              label: "规格",
              prop: "norms",
              rules: [{
                required: true,
                message: "请输入规格",
                trigger: "blur"
              }],
              readonly: true,
              search: true
            },
            {
              label: "最大库存",
              prop: "maxStock",
              rules: [{
                required: true,
                message: "请输入最大库存",
                trigger: "blur"
              }]
            },
            {
              label: "最小库存",
              prop: "minStock",
              rules: [{
                required: true,
                message: "请输入最小库存",
                trigger: "blur"
              }]
            },
          ]
        },
        data: []
      };
    },
    computed: {
      ...mapGetters(["permission"]),
      permissionList() {
        return {
          addBtn: this.vaildData(this.permission.stockwarning_add, false),
          viewBtn: this.vaildData(this.permission.stockwarning_view, false),
          delBtn: this.vaildData(this.permission.stockwarning_delete, false),
          editBtn: this.vaildData(this.permission.stockwarning_edit, false)
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
    watch: {
      'form.productId': {
        handler(newVal, oldVal) {
          if (newVal !== undefined && oldVal !== undefined) {
            for (const tempData of this.productData) {
              this.form.productCode = tempData.productCode
              this.form.norms = tempData.norms
            }
          }
        }
      }
    },
    mounted() {
      this.initData()
    },
    methods: {
      // 初始化数据
      initData() {
        this.option.column[0].dicData = []
        getProductList().then(res => {
          console.log(res);
          this.productData = res.data.data
          for (const data of this.productData) {
            this.option.column[0].dicData.push({value: data.id, label: data.productName})
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
