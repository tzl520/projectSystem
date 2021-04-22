<template>
  <basic-container>
    <el-tabs v-model="tabName" @tab-click="tabClick">
      <el-tab-pane label="入库暂存" name="temp">
        <avue-crud :option="option"
                   :table-loading="loading"
                   :data="data"
                   :page.sync="page"
                   :permission="permissionList"
                   :before-open="beforeOpen"
                   v-model="storageForm"
                   ref="storageForm"
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
          <template slot-scope="{scope,size,row}" slot="menu">
            <el-button type="text" size="mini" @click="detailRow(row)">详 情</el-button>
            <el-button type="text" size="mini" @click="rowSubmit(row)" :disabled="(row.productList || []).length === 0">提 交
            </el-button>
            <el-button type="text" size="mini" @click="rowDel(row)">删 除</el-button>
          </template>
          <template slot-scope="scope" slot="menuLeft">
            <el-button type="primary"
                       size="mini"
                       icon="el-icon-plus"
                       @click="menuAdd">新 增
            </el-button>
            <!--<el-button type="info"-->
                       <!--size="mini"-->
                       <!--icon="el-icon-paperclip"-->
                       <!--plain>导入-->
            <!--</el-button>-->
            <!--<el-button type="info"-->
                       <!--size="mini"-->
                       <!--icon="el-icon-takeaway-box"-->
                       <!--plain>导出-->
            <!--</el-button>-->
            <el-button type="danger"
                       size="mini"
                       icon="el-icon-delete"
                       plain
                       v-if="permission.projectname_delete"
                       @click="handleDelete">删 除
            </el-button>
          </template>
        </avue-crud>
      </el-tab-pane>
      <el-tab-pane label="已提交" name="submit">
        <avue-crud :option="option"
                   :table-loading="loading"
                   :data="data"
                   :page.sync="page"
                   :permission="permissionList"
                   :before-open="beforeOpen"
                   v-model="storageForm"
                   ref="storageForm"
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
          <template slot-scope="{scope,size,row}" slot="menu">
            <el-button type="text" size="mini" @click="detailRow(row)">详 情</el-button>
          </template>
        </avue-crud>
      </el-tab-pane>
    </el-tabs>
    <el-dialog :title="warehousingTitle"
               :modal-append-to-body="false"
               :visible.sync="dialogFormVisible"
               top="10vh"
               width="70%">
      <avue-form :option="optionForm"
                 v-model="warehousingForm"
                 ref="warehousingForm"
                 :data="warehousingFormData">
        <template slot-scope="scope" slot="menuForm">
          <el-button type="warning"
                     icon="el-icon-folder"
                     size="mini"
                     @click="dialogSave"
                     plain>暂 存
          </el-button>
          <el-button type="primary"
                     icon="el-icon-edit-outline"
                     size="mini"
                     @click="warehousingSubmit"
                     plain>提 交
          </el-button>
        </template>
        <template slot-scope="{row}" slot="input">
          <el-tag>{{row}}</el-tag>
        </template>
        <template slot-scope="scope" slot="productId">
          <el-select v-model="scope.row.productId" filterable placeholder="请选择">
            <el-option
              v-for="item in productList"
              :key="item.id"
              :label="item.productName"
              :value="item.id">
            </el-option>
          </el-select>
        </template>
      </avue-form>
    </el-dialog>
    <el-dialog :title="detailTitle"
               width="68%"
               top="10vh"
               :visible.sync="dialogDetailVisible"
               :close-on-press-escape="false"
               :close-on-click-modal="false"
               :show-close="false"
               :modal-append-to-body="false">
      <el-form ref="productListRecordsFormDetail"
               size="mini"
               v-model="storageForm"
               label-width="80px">
        <el-row :gutter="10">
          <el-col span="6">
            <el-form-item label="单号">
              <el-input v-model="storageForm.productListOddNumber" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col span="6">
            <el-form-item label="单据日期">
              <el-input v-model="storageForm.documentDate" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col span="6">
            <el-form-item label="创建人">
              <el-input v-model="storageForm.createUser" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col span="6">
            <el-form-item label="创建时间">
              <el-input v-model="storageForm.createTime" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <avue-crud :option="optionDetail"
                 v-model="detailForm"
                 ref="detailForm"
                 :data="detailFormData"
                 :page.sync="pageDetail"
                 :before-open="beforeOpenDetail"
                 @refresh-change="detailOnload"
                 @row-save="rowDetailSave"
                 @row-del="rowDetailDel"
                 @row-update="rowUpdate"
                 :table-loading="loading">
      </avue-crud>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="closeDetailDialog" size="mini">关 闭</el-button>
      </span>
    </el-dialog>
  </basic-container>
</template>

<script>
  import {getList, getDetail, add, remove, save, inSubmit} from "@/api/inventory/productlistrecords";
  import {getProductList} from '@/api/inventory/product';
  import {
    getProductInventory,
    getProductListUpdate,
    getProductListRemove,
    getProductListSave
  } from '@/api/inventory/productlist';
  import {getPresuppositionList} from '@/api/project/presupposition';
  import {mapGetters} from "vuex";

  export default {
    data() {
      //校验不能为非法字符和空格
      return {
        dialogVisible: false,
        tabName: 'temp',
        form: {},
        query: {recordsStatus: "0"},
        loading: true,
        page: {
          pageSize: 10,
          currentPage: 1,
          total: 0
        },
        pageDetail: {
          pageSize: 10,
          currentPage: 1,
          total: 0,
          layout: "total,pager,prev, next,jumper",
        },
        selectionList: [],
        projectNameData: [],
        status: [],
        storageForm: {
          projectPresetId: '',
          code: '',
          productListOddNumber: '',
          documentDate: '',
          recordsStatus: '',
          createUser: '',
          createTime: ''
        },
        warehousingForm: {
          projectPresetId: '',
          code: '',
          productList: [],
        },
        detailForm: {
          projectPresetId: '',
          productRecordsId: '',
          code: '',
          productId: '',
          quantity: 0,
          unitPrice: 0,
          money: 0
        },
        productRecordsId: '',
        projectPresetId: '',
        dialogFormVisible: false,
        editVisible: false,
        warehousingFormData: [],
        detailFormData: [],
        option: {
          height: 'auto',
          calcHeight: 30,
          tip: false,
          searchShow: true,
          searchMenuSpan: 6,
          border: true,
          index: true,
          indexLabel: '序号',
          defaultSort: {prop: 'projectPresetId', order: 'descending'},
          selection: true,
          size: 'mini',
          align: 'center',
          dialogClickModal: false,
          dialogWidth: '40%',
          cancelBtn: false,
          saveBtn: false,
          addBtn: false,
          delBtn: false,
          editBtn: false,
          searchSpan: 6,
          column: [
            {
              label: '单号',
              prop: 'productListOddNumber',
              addDisplay: false,
              readonly: true,
              search: true,
              width: 145,
              searchLabelWidth: 50
            },
            {
              label: '单据日期',
              prop: 'documentDate',
              type: "datetime",
              valueFormat: 'yyyy-MM-dd HH:mm:ss',
              format: 'yyyy-MM-dd HH:mm:ss',
              addDisplay: false,
              readonly: true,
              search: true,
              width: 140
            },
            {
              label: '项目名称',
              prop: 'projectPresetId',
              type: 'select',
              searchFilterable: true,
              dicData: [],
              search: true
            },
            {
              label: '项目代码',
              prop: 'code',
              placeholder: '自动填充',
              hide: true,
              readonly: true,
            },
            {
              label: '业务状态',
              prop: 'recordsStatus',
              dicUrl: "/api/blade-system/dict-biz/dictionary?code=recordsStatus",
              props: {
                label: "dictValue",
                value: "dictKey"
              },
              rules: [{
                required: true,
                message: '请选择业务状态',
                trigger: 'blur'
              }],
              type: 'select',
              hide: true
            },
            {
              label: '创建人',
              prop: 'createUser',
              dicUrl: '/api/blade-user/userNameList',
              props: {
                label: "name",
                value: "id"
              },
              addDisplay: false,
              type: 'select',
              readonly: true,
              searchLabelWidth: 60
            },
            {
              label: '创建时间',
              prop: 'createTime',
              type: "datetime",
              valueFormat: 'yyyy-MM-dd HH:mm:ss',
              format: 'yyyy-MM-dd HH:mm:ss',
              addDisplay: false,
              readonly: true,
              width: 140
            }
          ]
        },
        productList: [],
        warehousingStatus: 0,
        warehousingTitle: '新增入库',
        categoryNameData: [],
        optionForm: {
          submitBtn: false,
          size: 'mini',
          align: 'center',
          // emptyBtn: false,
          column: [
            {
              label: '项目名称',
              prop: 'projectPresetId',
              span: 8,
              rules: [{
                required: true,
                message: '请选择项目名称',
                trigger: 'blur'
              }],
              type: 'select',
              dicData: [],
              filterable: true,
              searchFilterable: true,
              hide: true
            },
            {
              label: '项目代码',
              prop: 'code',
              span: 8,
              placeholder: '自动填充',
              readonly: true,
              hide: true
            },
            {
              labelWidth: 5,
              prop: 'productList',
              type: 'dynamic',
              span: 24,
              width: 5,
              children: {
                align: 'center',
                headerAlign: 'center',
                column: [
                  {
                    label: '货品名称',
                    prop: 'productId',
                    rules: [{
                      required: true,
                      message: '请选择货品名称',
                      trigger: 'blur'
                    }],
                    formslot: true,
                    filterable: true,
                    width: 130,
                  },
                  {
                    label: '货品编号',
                    prop: 'productCode',
                    placeholder: '自动填充',
                    readonly: true,
                    width: 130,
                  },
                  {
                    label: "分类名称",
                    prop: "categoryId",
                    placeholder: '分类名称',
                    hide: true,
                    width: 130,
                  },
                  {
                    label: '供货单位',
                    prop: 'supplier',
                    placeholder: '供货单位',
                    readonly: true,
                    width: 130,
                  },
                  {
                    label: '规格',
                    prop: 'norms',
                    placeholder: '规格',
                    readonly: true,
                    width: 130,
                  },
                  {
                    label: '入库数量',
                    prop: 'quantity',
                    placeholder: '入库数量',
                    type: 'number',
                    value: 1,
                    minRows: 1,
                    width: 130,
                  },
                  {
                    label: '单价',
                    prop: 'unitPrice',
                    placeholder: '单价',
                    type: 'number',
                    value: 1,
                    minRows: 1,
                    width: 130
                  },
                  {
                    label: '小计',
                    prop: 'money',
                    placeholder: '小计',
                    type: 'number',
                    value: 1,
                    minRows: 1,
                    width: 130
                  },
                  {
                    label: '备注',
                    prop: 'remark',
                    placeholder: '备注',
                    width: 130,
                  }]
              }
            },
          ]
        },
        detailTitle: '详情',
        dialogDetailVisible: false,
        productNameData: [],
        optionDetail: {
          dialogWidth: '45%',
          align: 'center',
          dialogModal: false,
          columnBtn: false,
          size: 'mini',
          menu: true,
          column: [
            {
              label: '项目名称',
              prop: 'projectPresetId',
              rules: [{
                required: true,
                message: '请选择项目名称',
                trigger: 'blur'
              }],
              dicData: [],
              type: 'select',
              filterable: true,
              cell: true,
              editDetail: true,
              addDetail: true
            },
            {
              label: '项目代码',
              prop: 'code',
              placeholder: '自动填充',
              readonly: true,
              cell: true,
              hide: true,
              editDetail: true,
              addDetail: true
            },
            {
              label: '货品名称',
              prop: 'productId',
              rules: [{
                required: true,
                message: '请选择货品名称',
                trigger: 'blur'
              }],
              type: 'select',
              filterable: true,
              cell: true
            },
            {
              label: '货品编号',
              prop: 'productCode',
              placeholder: '自动填充',
              readonly: true,
              cell: true
            },
            {
              label: "分类名称",
              prop: "categoryId",
              readonly: true,
              cell: true,
              hide: true,
              addDisplay: false,
              editDisplay: false,
              viewDisplay: false
            },
            {
              label: '供货单位',
              prop: 'supplier',
              readonly: true,
              hide: true,
              cell: true
            },
            {
              label: '规格',
              prop: 'norms',
              readonly: true,
              cell: true
            },
            {
              label: '入库数量',
              prop: 'quantity',
              rules: [{
                required: true,
                message: '请选择入库数量',
                trigger: 'blur'
              }],
              type: 'number',
              value: 1,
              cell: true,
            },
            {
              label: '单价',
              prop: 'unitPrice',
              rules: [{
                required: true,
                message: '请输入单价',
                trigger: 'blur'
              }],
              type: 'number',
              cell: true
            },
            {
              label: '小计',
              prop: 'money',
              type: 'number',
              cell: true
            },
            {
              label: '备注',
              prop: 'remark',
              cell: true
            },
            {
              labelWidth: 0,
              label: '',
              prop: 'info',
              span: 24,
              hide: true,
              formslot: true,
            }]
        },
        data: []
      };
    },
    computed: {
      ...mapGetters(["permission"]),
      permissionList() {
        return {
          addBtn: this.vaildData(this.permission.projectname_add, false),
          viewBtn: this.vaildData(this.permission.projectname_view, false),
          delBtn: this.vaildData(this.permission.projectname_delete, false),
          editBtn: this.vaildData(this.permission.projectname_edit, false)
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
      'warehousingForm.projectPresetId': {
        handler(newVal, oldVal) {
          if (newVal !== undefined && newVal !== oldVal) {
            for (const tempData of this.projectNameData) {
              if (tempData.id === newVal) {
                this.warehousingForm.code = tempData.code // {} this.warehousingForm['code']
                break
              }
            }
          }
        },
        deep: true,
        immediate: true
      },
      'warehousingForm.productList': {
        handler(productList) {
          if (productList !== undefined && productList instanceof Array) {
            // 货品清单列表
            productList.map(product => {
              if (product['productId'] !== undefined && product['productId'] !== '') {
                // 货品列表
                this.productList.forEach(product2 => {
                  if (product2['id'] === product['productId']) {
                    product['productCode'] = product2['productCode']
                    product['supplier'] = product2['supplier']
                    product['norms'] = product2['norms']
                    product['categoryId'] = product2['categoryId']
                  }
                })
              }
              // 小计计算
              if (this.isNumber(product['quantity']) && this.isNumber(product['unitPrice'])) {
                product['money'] = Number(product['quantity']) * Number(product['unitPrice'])
              }
              return product
            })
          }
        },
        deep: true//对象内部的属性监听，深度监听
      },

      //监听详情的预设项目和货品名称管理列表数据
      'detailForm.projectPresetId': {
        handler(newVal, oldVal) {
          if (newVal !== undefined && newVal !== oldVal) {
            for (const tempData of this.projectNameData) {
              if (tempData.id === newVal) {
                this.detailForm.code = tempData.code // {} this.warehousingForm['code']
                break
              }
            }
          }
        },
        deep: true,
        immediate: true
      },
      'detailForm.productId': {
        handler(newVal, oldVal) {
          if (newVal !== undefined && newVal !== oldVal) {
            for (const tempData of this.productNameData) {
              if (tempData.id === newVal) {
                this.detailForm.productCode = tempData.productCode
                this.detailForm.supplier = tempData.supplier
                this.detailForm.norms = tempData.norms
                this.detailForm.categoryId = tempData.categoryId
                break
              }
            }
          }
        },
        deep: true,
        immediate: true
      },
      'detailForm.quantity': {
        handler(val) {
          if (this.isNumber(val) && this.isNumber(this.detailForm.unitPrice)) {
            this.detailForm.money = Number(val) * Number(this.detailForm.unitPrice)
          }
        },
        deep: true,
        immediate: true
      },
      'detailForm.unitPrice': {
        handler(val) {
          if (this.isNumber(val) && this.isNumber(this.detailForm.quantity)) {
            this.detailForm.money = Number(val) * Number(this.detailForm.quantity)
          }
        },
        deep: true,
        immediate: true
      },
    },
    mounted() {
      this.initData()
    },
    methods: {
      // 初始化数据
      initData() {
        // 获取预设项目列表数据
        getPresuppositionList().then(res => {
          //获取入库列表的预设项目列表数据
          this.option.column[2].dicData = []
          //获取新增入库的预设项目列表数据
          this.optionForm.column[0].dicData = []
          //获取详情的预设列表数据
          this.optionDetail.column[0].dicData = []
          this.projectNameData = res.data.data
          for (const data of this.projectNameData) {
            this.option.column[2].dicData.push({value: data.id, label: data.title})
            this.optionForm.column[0].dicData.push({value: data.id, label: data.title})
            this.optionDetail.column[0].dicData.push({value: data.id, label: data.title})
          }
        })
        // 获取货品名称管理列表数据
        getProductList().then(res => {
          this.productList = res.data.data
          //获取详情的货品名称管理列表数据
          this.optionDetail.column[2].dicData = []
          this.productNameData = res.data.data
          for (const data of this.productNameData) {
            this.optionDetail.column[2].dicData.push({value: data.id, label: data.productName})
          }
        })
      },
      rowSave(row, done, loading) {
        // row.je = row.jr * 100
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
        this.dialogFormVisible = false;
      },
      rowUpdate(row, index, done) {
        getProductListUpdate(row).then(() => {
          this.detailOnload(this.pageDetail);
          this.$message({
            type: "success",
            message: "操作成功!"
          });
          done();
        }, error => {
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
      //操作栏提交
      rowSubmit(row) {
        add(row.id).then(() => {
          this.onLoad(this.page);
          this.$message({
            type: "success",
            message: "操作成功!"
          });
        })
      },
      //弹窗新增入库暂存
      dialogSave() {
        if (this.$refs.warehousingForm !== undefined) {
          if((this.warehousingForm.productList || []).length === 0) {
            this.$message({
              type: "warning",
              message: "请填写商品清单!"
            });
            return false
          }
          this.$refs.warehousingForm.validate(isvalidate => {
            if (isvalidate) {
              save(this.warehousingForm).then(() => {
                this.onLoad(this.page);
                this.$message({
                  type: "success",
                  message: "操作成功!"
                });
                this.dialogFormVisible = false;
              });
            }else {
              return false
            }
          })
        }
      },
      //新增入库提交
      warehousingSubmit() {
        if (this.$refs.warehousingForm !== undefined) {
          if((this.warehousingForm.productList || []).length === 0) {
            this.$message({
              type: "warning",
              message: "请填写商品清单!"
            });
            return false
          }
          this.$refs.warehousingForm.validate(isvalidate => {
            if (!isvalidate) {
              return
            } else {
              inSubmit(this.warehousingForm).then(() => {
                this.onLoad(this.page);
                this.$message({
                  type: "success",
                  message: "操作成功!"
                });
                this.dialogFormVisible = false;
              })
            }
          })
        }
      },
      beforeOpen(done, type) {
        if (["edit", "view"].includes(type)) {
          getDetail(this.form.id).then(res => {
            this.form = res.data.data;
          });
        }
        done();
      },
      beforeOpenDetail(done) {
        this.detailForm.projectPresetId = this.projectPresetId
        this.detailForm.productRecordsId = this.productRecordsId
        done()
      },
      searchReset() {
        this.query = {};
        this.onLoad(this.page);
      },
      searchChange(params, done) {
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
        this.query.recordsStatus = (this.tabName === 'temp' ? '0' : '1')
        getList(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
          const data = res.data.data;
          this.page.total = data.total;
          this.data = data.records;
          this.data.map(temp => {
            if (temp['createUser'] + '' === '-1') {
              temp['createUser'] = ''
            }
            if (temp['status'] + '' === '-1') {
              temp['status'] = ''
            }
            return temp
          })
          this.loading = false;
          this.selectionClear();
        });
      },
      tabClick(e) {
        switch (e.name) {
          case 'submit':
            this.query['recordsStatus'] = "1"
            this.optionDetail.addBtn = false
            this.optionDetail.editBtn = false
            this.optionDetail.delBtn = false
            this.optionDetail.viewBtn = true
            this.optionDetail.menu = false
            break
          default:
            this.query['recordsStatus'] = "0"
            this.optionDetail.addBtn = true
            this.optionDetail.editBtn = true
            this.optionDetail.delBtn = true
            this.optionDetail.viewBtn = false
            this.optionDetail.menu = true
            break
        }
        this.onLoad(this.page, {})
      },
      // 新增入库清空表单方法
      clearAllForm() {
        // 清空按钮点击事件
        if (this.$refs.warehousingForm !== undefined) {
          this.$refs.warehousingForm.resetForm()
          this.$refs.warehousingForm.clearValidate()
          this.$refs.warehousingForm.allDisabled = false
        }
      },
      //新增
      menuAdd() {
        this.clearAllForm()
        this.dialogFormVisible = true;
      },
      isNumber(val) {
        // 非负整数
        const regPos = /^\d+$/
        // 负整数
        const regNeg = /^\\-[1-9][0-9]*$/
        if (regPos.test(val) || regNeg.test(val)) {
          return true;
        } else {
          return false;
        }
      },
      //详情
      detailRow(row) {
        //自定义表单获取出入库记录列表的数据
        this.storageForm.productListOddNumber = row.productListOddNumber
        this.storageForm.documentDate = row.documentDate
        this.storageForm.projectPresetId = row.$projectPresetId
        this.storageForm.recordsStatus = row.$recordsStatus
        this.storageForm.createUser = row.$createUser
        this.storageForm.createTime = row.createTime
        //获取详情数据
        this.productRecordsId = row.id
        console.log(this.productRecordsId);
        this.projectPresetId = row.projectPresetId
        this.dialogDetailVisible = true
        this.detailOnload()
      },
      // 详情onload
      detailOnload() {
        this.loading = true;
        getProductInventory(this.productRecordsId).then(res => {
          const data = res.data.data
          this.detailFormData = data.records
          this.pageDetail.total = data.total;
          this.loading = false;
        })
      },
      //详情的行删除
      rowDetailDel(row) {
        getProductListRemove(row.id).then(() => {
          this.detailOnload(this.pageDetail);
          this.$message({
            type: "success",
            message: "操作成功!"
          });
        })
      },
      //详情的新增事件
      rowDetailSave(row, done) {
        row['productRecordsId'] = this.productRecordsId
        getProductListSave(row).then(() => {
          this.detailOnload(this.pageDetail);
          this.$message({
            type: "success",
            message: "操作成功!"
          });
          done()
        });
      },
      closeDetailDialog(){
        this.dialogDetailVisible = false
        this.refreshChange()
      }
    }
  };
</script>

<style>

</style>
