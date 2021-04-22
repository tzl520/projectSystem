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
               @on-load="onLoad"
               :upload-preview="uploadPreview"
               :upload-error="uploadError"
               :upload-exceed="uploadExceed"
               :upload-delete="uploadDelete"
               :upload-before="uploadBefore"
               :upload-after="uploadAfter">
      <template slot="menuLeft">
        <el-button type="danger"
                   size="mini"
                   icon="el-icon-delete"
                   plain
                   v-if="permission.product_delete"
                   @click="handleDelete">删 除
        </el-button>
      </template>
      <template slot="image" slot-scope="{ row }">
        <template v-if="row.image !== ''">
          <div><img :src="row.image" class="product-img"/></div>
        </template>
        <template v-else>
          <div><img src="/img/product/productImg.png" class="product-img"/></div>
        </template>
      </template>
    </avue-crud>
  </basic-container>
</template>

<script>
  import {getList, getDetail, add, update, remove} from "@/api/inventory/product";
  import {getProductCategoryList} from '@/api/inventory/productcategory'
  import {mapGetters} from "vuex";

  export default {
    data() {
      return {
        query: {},
        loading: true,
        page: {
          pageSize: 10,
          currentPage: 1,
          total: 0
        },
        selectionList: [],
        categoryNameData: [],
        form: {
          categoryId: '',
          unit: '',
        },
        option: {
          height: 'auto',
          calcHeight: 30,
          tip: false,
          searchShow: true,
          searchMenuSpan: 6,
          border: true,
          index: true,
          viewBtn: true,
          selection: true,
          dialogClickModal: false,
          align: 'center',
          size: 'mini',
          dialogWidth: '45%',
          column: [
            {
              label: "分类名称",
              prop: "categoryId",
              rules: [{
                required: true,
                message: "请输入分类名称",
                trigger: "blur"
              }],
              type: 'select',
              dicData: [],
              filterable: true,
              searchFilterable: true,
              search: true
            },
            {
              label: "单位",
              prop: "unit",
              placeholder: '自动读取',
              readonly: true
            },
            {
              label: "货品编码",
              prop: "productCode",
              rules: [{
                required: true,
                message: "请输入商品编码",
                trigger: "blur"
              }]
            },
            {
              label: "货品名称",
              prop: "productName",
              rules: [{
                required: true,
                message: "请输入商品名称",
                trigger: "blur"
              }],
              search: true
            },
            {
              label: "标准成本",
              prop: "standardCost",
              rules: [{
                required: true,
                message: "请输入标准成本",
                trigger: "blur"
              }]
            },
            {
              label: "供货单位",
              prop: "supplier",
              rules: [{
                required: true,
                message: "请输入供货单位",
                trigger: "blur"
              }],
              search: true
            },
            {
              label: "规格",
              prop: "norms",
              rules: [{
                required: true,
                message: "请输入规格",
                trigger: "blur"
              }]
            },
            {
              label: "采购价",
              prop: "purchasePrice",
              rules: [{
                required: true,
                message: "请输入采购价",
                trigger: "blur"
              }]
            },
            {
              label: '图片',
              prop: 'image',
              type: 'upload',
              loadText: '附件上传中，请稍等',
              propsHttp: {
                res: 'data',
                url: 'link'
              },
              listType: 'picture-img',
              tip: '只能上传jpg/png文件，且不超过500kb',
              action: '/api/blade-resource/oss/endpoint/put-file',
              limit: 1,
              multiple: false,
              slot: true
            },
            {
              label: "备注",
              prop: "remark",
            }]
        },
        data: []
      };
    },
    computed: {
      ...mapGetters(["permission"]),
      permissionList() {
        return {
          addBtn: this.vaildData(this.permission.product_add, false),
          viewBtn: this.vaildData(this.permission.product_view, false),
          delBtn: this.vaildData(this.permission.product_delete, false),
          editBtn: this.vaildData(this.permission.product_edit, false)
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
      'form.categoryId': {
        handler(newVal, oldVal) {
          if (newVal !== undefined && newVal !== oldVal) {
            for (const tempData of this.categoryNameData) {
              if (tempData.id === newVal) {
                this.form.unit = tempData.unit // {} this.projectInfoForm['code']
                break
              }
            }
          }
        }
      }
    },
    mounted() {
      this.initData()
    },
    methods: {
      initData() {
        getProductCategoryList().then(res => {
          this.option.column[0].dicData = []
          this.categoryNameData = res.data.data.records
          for (const data of this.categoryNameData) {
            this.option.column[0].dicData.push({value: data.id, label: data.categoryName})
          }
        })
      },
      rowSave(row, done, loading) {
        if (row['image'] !== undefined && row['image'] instanceof Array && row['image'].length > 0) {
          const temp = row['image'][0]
          row['image'] = temp.label || ''
        }
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
        if (row['image'] !== undefined && row['image'] instanceof Array && row['image'].length > 0) {
          const temp = row['image'][0]
          row['image'] = temp.label || ''
        }
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
      currentChange(currentPage) {
        this.page.currentPage = currentPage;
      },
      sizeChange(pageSize) {
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
          console.log(this.data )
          this.loading = false;
          this.selectionClear();
        });
      },
      //上传方法
      uploadDelete(column, file) {
        console.log(column, file)
        return this.$confirm(`是否确定移除该选项？`);
      },
      //上传前方法
      uploadBefore(file, done, loading, column) {
        console.log(file, column)
        done()
      },
      uploadError(error, column) {
        this.$message.success('上传失败')
        console.log(error, column)
      },
      uploadAfter(res, done, loading, column) {
        console.log(res, column)
        done()
        // this.$message.success('上传后的方法')
      },
      uploadPreview(file, column, done) {
        console.log(file, column)
        done()//默认执行打开方法
      },
      uploadExceed(limit, files, fileList, column) {
        console.log(limit, files, fileList, column)
      }
    }
  };
</script>

<style>
  .product-img {
    width: 80%;
    height: 80%;
  }
</style>
