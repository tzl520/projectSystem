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
    </avue-crud>
  </basic-container>
</template>

<script>
  import {getList, getDetail, getProductListUpdate} from "@/api/inventory/productlist";
  import {getOutDetailsList} from  "@/api/inventory/productlistrecords"

  import {mapGetters} from "vuex";

  export default {
    data() {
      return {
        form: {
          projectPresetId: '',
          code: '',
          productListOddNumber: ''
        },
        query: {
          inOrOut: '0'
        },
        loading: true,
        page: {
          pageSize: 10,
          currentPage: 1,
          total: 0
        },
        selectionList: [],
        oddNumberData: [],
        categoryNameData: [],
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
              label: '单号',
              prop: 'oddNumber',
              addDisplay: false,
              search: true,
              searchLabelWidth: 50,
              width: 145
            },
            {
              label: '单据日期',
              prop: 'oddDate',
              addDisplay: false,
              readonly: true,
              width: 140
            },
            {
              label: '项目名称',
              prop: 'projectName',
              rules: [{
                required: true,
                message: "请输入项目名称",
                trigger: "blur"
              }],
              search: true,
              width: 140
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
              label: '货品编号',
              prop: 'productCode',
              placeholder: '自动填充',
              readonly: true
            },
            {
              label: '规格',
              prop: 'norms',
              search: true,
              searchLabelWidth: 50,
            },
            {
              label: '单位',
              prop: 'unit',
              rules: [{
                required: true,
                message: '请输入单位',
                trigger: 'blur'
              }],
              search: true
            },
            {
              label: '入库数量',
              prop: 'quantity',
              type: 'number',
              value: 1
            },
            {
              label: '单价',
              prop: 'unitPrice',
              rules: [{
                required: true,
                message: '请输入单价',
                trigger: 'blur'
              }]
            },
            {
              label: '金额',
              prop: 'money',
              rules: [{
                required: true,
                message: '请输入小计',
                trigger: 'blur'
              }]
            },
            {
              label: '备注',
              prop: 'remark',
              cell: true
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
    created() {
      this.initData()
    },
    methods: {
      // 初始化数据
      initData() {
        getOutDetailsList().then(res => {
          this.oddNumberData = res.data.data
        })
      },
      rowUpdate(row, index, done, loading) {
        getProductListUpdate(row).then(() => {
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
        this.query.inOrOut = '0'
        getList(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
          const data = res.data.data;
          this.page.total = data.total;
          this.data = data.records;
          if (this.oddNumberData.length > 0) {
            this.data.map(temp => {
              for (const odd of this.oddNumberData) {
                if (odd.id === temp.productRecordsId) {
                  temp['oddNumber'] = odd.productListOddNumber || ''
                  temp['oddDate'] = odd.documentDate || ''
                  break
                }
              }
              return temp
            })
          }
          this.loading = false;
          this.selectionClear();
        });
      }
    }
  };
</script>

<style>
</style>
