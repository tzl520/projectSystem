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
      <!--<template slot-scope="scope" slot="menuLeft">-->
        <!--<el-button type="info"-->
                   <!--size="mini"-->
                   <!--icon="el-icon-takeaway-box"-->
                   <!--plain>导出-->
        <!--</el-button>-->
      <!--</template>-->
      <template slot="img" slot-scope="{ row }">
        <template v-if="row.img !== ''">
          <div><img :src="row.img" class="product-img"/></div>
        </template>
        <template v-else>
          <div><img src="/img/product/productImg.png" class="product-img"/></div>
        </template>
      </template>
    </avue-crud>
  </basic-container>
</template>

<script>
  import {getList, getDetail, add, update, remove} from "@/api/inventory/projectdetails";
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
        projectNameData: [],
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
              label: '项目名称',
              prop: 'projectName',
              rules: [{
                required: true,
                message: "请输入项目名称",
                trigger: "blur"
              }],
              search: true,
            },
            {
              label: '项目代码',
              prop: 'projectCode',
              placeholder: '自动读取',
              readonly: true
            },
            {
              label: '货品分类',
              prop: 'categoryName',
              rules: [{
                required: true,
                message: '请选择货品类别',
                trigger: 'blur'
              }],
              search: true
            },
            {
              label: '货品编号',
              prop: 'productCode',
              placeholder: '自动填充',
              readonly: true
            },
            {
              label: '货品名称',
              prop: 'productName',
              rules: [{
                required: true,
                message: '请选择货品名称',
                trigger: 'blur'
              }],
              filterable: true,
              searchFilterable: true,
              search: true
            },
            {
              label: '库存量',
              prop: 'stockNum'
            },
            {
              label: '可用库存量',
              prop: 'availableStockNum',
              width: '100'
            },
            {
              label: '规格',
              prop: 'norms',
              rules: [{
                required: true,
                message: '请输入规格',
                trigger: 'blur'
              }]
            },
            {
              label: '图片',
              prop: 'img',
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
              label: '单位',
              prop: 'unit',
              rules: [{
                required: true,
                message: '请输入单位',
                trigger: 'blur'
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
          this.loading = false;
          this.selectionClear();
        });
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
