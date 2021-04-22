<template>
  <basic-container>
    <el-tabs v-model="tabName" @tab-click="tabClick">
      <el-tab-pane label="出库暂存" name="temp">
        <avue-crud :option="option"
                   :table-loading="loading"
                   :data="data"
                   :page.sync="page"
                   :permission="permissionList"
                   :before-open="beforeOpen"
                   v-model="storageOut"
                   ref="crud"
                   @row-del="rowDel"
                   @search-change="searchChange"
                   @search-reset="searchReset"
                   @selection-change="selectionChange"
                   @current-change="currentChange"
                   @size-change="sizeChange"
                   @refresh-change="refreshChange"
                   @on-load="onLoad">
          <template slot-scope="{scope,size,row}" slot="menu">
            <el-button type="text" size="mini" @click="rowDetail(row)">详 情</el-button>
            <el-button type="text" size="mini" @click="rowSubmit(row)" :disabled="(row.productList || []).length === 0">
              提 交
            </el-button>
            <el-button type="text" size="mini" @click="rowDel(row)">删 除</el-button>
          </template>
          <template slot-scope="scope" slot="menuLeft">
            <el-button type="primary"
                       size="mini"
                       icon="el-icon-plus"
                       @click="menuAdd">新 增
            </el-button>
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
      <el-tab-pane label="待审核" name="toAudit">
        <avue-crud :option="option"
                   :table-loading="loading"
                   :data="data"
                   :page.sync="page"
                   :permission="permissionList"
                   :before-open="beforeOpen"
                   v-model="form"
                   ref="crud"
                   @row-del="rowDel"
                   @search-change="searchChange"
                   @search-reset="searchReset"
                   @selection-change="selectionChange"
                   @current-change="currentChange"
                   @size-change="sizeChange"
                   @refresh-change="refreshChange"
                   @on-load="onLoad">
          <template slot-scope="{scope,size,row}" slot="menu">
            <el-button type="text" size="mini" @click="rowDetail(row)">详 情</el-button>
            <el-button type="text" size="mini" @click="rowAudit(row)">审 核</el-button>
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
                   v-model="form"
                   ref="crud"
                   @row-del="rowDel"
                   @search-change="searchChange"
                   @search-reset="searchReset"
                   @selection-change="selectionChange"
                   @current-change="currentChange"
                   @size-change="sizeChange"
                   @refresh-change="refreshChange"
                   @on-load="onLoad">
          <template slot-scope="{scope,size,row}" slot="menu">
            <el-button type="text" size="mini" @click="rowDetail(row)">详 情</el-button>
            <el-button type="text" size="mini" @click="rowAuditDetail(row)">审核详情</el-button>
          </template>
        </avue-crud>
      </el-tab-pane>
    </el-tabs>
    <el-dialog :title="WarehouseOutTitle"
               :modal-append-to-body="false"
               :visible.sync="dialogOutVisible"
               top="10vh"
               width="70%">
      <avue-form :option="optionOut"
                 v-model="warehouseOut"
                 ref="warehouseOut"
                 :data="warehouseOutData">
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
                     @click="dialogSubmit"
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
              :key="item.productId"
              :label="item.productName"
              :value="item.productId">
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
      <el-form ref="productListRecordsOutDetail"
               size="mini"
               v-model="storageOut"
               label-width="80px">
        <el-row :gutter="10">
          <el-col span="6">
            <el-form-item label="单号">
              <el-input v-model="storageOut.productListOddNumber" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col span="6">
            <el-form-item label="单据日期">
              <el-input v-model="storageOut.documentDate" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col span="6">
            <el-form-item label="创建人">
              <el-input v-model="storageOut.createUser" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col span="6">
            <el-form-item label="创建时间">
              <el-input v-model="storageOut.createTime" disabled></el-input>
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
                 @row-save="rowDetailSave"
                 @row-update="rowUpdate"
                 @row-del="rowDetailDel"
                 @refresh-change="detailOnload"
                 :table-loading="loading">
      </avue-crud>
      <span slot="footer" class="dialog-footer">
         <el-button type="primary" @click="closeDetailDialog" size="mini">关闭</el-button>
      </span>
    </el-dialog>
    <el-dialog :title="auditTitle"
               width="45%"
               :visible.sync="auditDialog"
               :modal-append-to-body="false">
      <el-form ref="auditForm" :rules="rules" :model="auditForm" label-width="80px">
        <el-form-item label="审核状态" prop="auditStatus">
          <el-radio v-model="auditForm.auditStatus" label="1">通过</el-radio>
          <el-radio v-model="auditForm.auditStatus" label="2">不通过</el-radio>
        </el-form-item>
        <el-form-item label="审核意见" prop="auditAdvice">
          <el-input type="textarea" v-model="auditForm.auditAdvice"/>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="auditSubmit">确定</el-button>
        <el-button size="mini" @click="auditDialog = false">取消</el-button>
      </span>
    </el-dialog>
    <el-dialog :title="auditDetailTitle"
               width="45%"
               :visible.sync="auditDetailDialog"
               :modal-append-to-body="false">
      <el-form ref="allocationAuditDetail"
               size="mini"
               v-model="allocationAuditDetail"
               label-width="80px">
        <el-row :gutter="10">
          <el-col span="24">
            <el-form-item label="审核人">
              <el-input v-model="allocationAuditDetail.auditPerson" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col span="24">
            <el-form-item label="审核时间">
              <el-input v-model="allocationAuditDetail.auditTime" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col span="24">
            <el-form-item label="审核意见">
              <el-input type="textarea" v-model="allocationAuditDetail.auditAdvice" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="auditDetailDialog = false">关闭</el-button>
      </span>
    </el-dialog>
  </basic-container>
</template>

<script>
  import {getList, getDetail, addStockOut, remove, stockOutSubmit, outSubmit} from "@/api/inventory/productlistrecords";
  import {
    getProductInventory,
    getProductListUpdate,
    getProductListSave,
    getProductListRemove
  } from '@/api/inventory/productlist';
  import {getCKAudit, getAuditList} from '@/api/inventory/auditrecords'
  import {getDetailsList, getAllocationList} from "@/api/inventory/projectdetails";

  import {mapGetters} from "vuex";

  export default {
    data() {
      return {
        tabName: 'temp',
        loading: true,
        query: {
          recordsStatus: "0",
          inOrOut: '1'
        },
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
        storageOut: {
          projectPresetId: '',
          code: '',
          productListOddNumber: '',
          documentDate: '',
          recordsStatus: '',
          createUser: '',
          createTime: '',
        },
        selectionList: [],
        projectNameData: [],
        productNameDate: [],
        option: {
          height: 'auto',
          calcHeight: 30,
          tip: false,
          searchShow: true,
          searchMenuSpan: 6,
          border: true,
          index: true,
          indexLabel: '序号',
          selection: true,
          size: 'mini',
          align: 'center',
          dialogClickModal: false,
          cancelBtn: false,
          saveBtn: false,
          addBtn: false,
          editBtn: false,
          viewBtn: false,
          delBtn: false,
          column: [
            {
              label: '单号',
              prop: 'productListOddNumber',
              addDisplay: false,
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
              search: true,
              width: 140
            },
            {
              label: '项目名称',
              prop: 'projectPresetId',
              rules: [{
                required: true,
                message: '请选择项目名称',
                trigger: 'blur'
              }],
              type: 'select',
              filterable: true,
              searchFilterable: true,
              search: true,
              dicData: [],
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
              filterable: true,
              addDisplay: false,
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
              readonly: true
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
            },
            {
              label: '备注',
              prop: 'remark',
              placeholder: '自动读取当前时间',
              readonly: true
            },
          ]
        },
        WarehouseOutTitle: '新增出库',
        dialogOutVisible: false,
        warehouseOutData: [],
        productList: [],
        warehouseOut: {
          projectPresetId: '',
          code: '',
          productList: []
        },
        optionOut: {
          height: 'auto',
          calcHeight: 30,
          tip: false,
          searchShow: true,
          searchMenuSpan: 6,
          border: true,
          index: true,
          size: 'mini',
          labelWidth: 90,
          submitBtn: false,
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
              hide: true,
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
                    type: 'select',
                    formslot: true,
                    filterable: true,
                    width: 130
                  },
                  {
                    label: '货品编号',
                    prop: 'productCode',
                    placeholder: '货品编号',
                    readonly: true,
                    width: 130
                  },
                  {
                    label: "分类名称",
                    prop: "categoryId",
                    placeholder: '分类名称',
                    readonly: true,
                    hide: true,
                    width: 130
                  },
                  {
                    label: '规格',
                    prop: 'norms',
                    placeholder: '规格',
                    width: 130
                  },
                  {
                    label: '单位',
                    prop: 'unit',
                    placeholder: '单位',
                    filterable: true,
                    width: 130
                  },
                  {
                    label: '系统数量',
                    prop: 'availableStockNum',
                    placeholder: '系统数量',
                    readonly: true,
                    width: 130
                  },
                  {
                    label: '出库数量',
                    prop: 'quantity',
                    placeholder: '数量',
                    type: 'number',
                    value: 1,
                    minRows: 1,
                    width: 130
                  },
                  {
                    label: '单价',
                    prop: 'unitPrice',
                    placeholder: '单价',
                    readonly: true,
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
                    label: '认领人',
                    prop: 'claimant',
                    placeholder: '认领人',
                    width: 130
                  },
                  {
                    label: '认领时间',
                    prop: 'claicmTime',
                    placeholder: '认领时间',
                    type: "datetime",
                    valueFormat: 'yyyy-MM-dd HH:mm:ss',
                    format: 'yyyy-MM-dd HH:mm:ss',
                    width: 178
                  },
                  {
                    label: '备注',
                    prop: 'remark',
                    placeholder: '备注',
                    cell: true,
                    width: 130

                  }
                ]
              }
            }
          ]
        },
        detailTitle: '详情',
        dialogDetailVisible: false,
        productRecordsId: '',
        projectPresetId: '',
        projectName: '',
        projectCode: '',
        stockNumProductId: '',//商品id
        detailForm: {
          projectPresetId: '',
          productRecordsId: '',
          code: '',
          productId: '',
          quantity: 0,
          unitPrice: 0,
          money: 0,
          availableStockNum: ''
        },
        detailFormData: [],
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
              prop: 'projectName',
              rules: [{
                required: true,
                message: '请选择项目名称',
                trigger: 'blur'
              }],
              type: 'select',
              dicData: [],
              filterable: true,
              cell: true,
              // editDetail: true,
              // addDetail: true
            },
            {
              label: '项目代码',
              prop: 'projectCode',
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
              hide: true,
              addDisplay: false,
              editDisplay: false,
              viewDisplay: false
            },
            {
              label: '规格',
              prop: 'norms',
              rules: [{
                required: true,
                message: '请输入规格',
                trigger: 'blur'
              }],
              cell: true,
              readonly: true
            },
            {
              label: '单位',
              prop: 'unit',
              rules: [{
                required: true,
                message: '请选择单位',
                trigger: 'blur'
              }],
              filterable: true,
              cell: true,
              readonly: true
            },
            {
              label: '系统数量',
              prop: 'availableStockNum',
              placeholder: '系统数量',
              readonly: true,
              width: 130
            },
            {
              label: '数量',
              prop: 'quantity',
              type: 'number',
              value: 1,
              minRows: 1,
              cell: true
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
              value: 1,
              minRows: 1,
              cell: true
            },
            {
              label: '小计',
              prop: 'money',
              rules: [{
                required: true,
                message: '请输入小计',
                trigger: 'blur'
              }],
              type: 'number',
              value: 1,
              minRows: 1,
              cell: true
            },
            {
              label: '认领人',
              prop: 'claimant',
              rules: [{
                required: true,
                message: '请填写认领人',
                trigger: 'blur'
              }],
              cell: true
            },
            {
              label: '认领时间',
              prop: 'claimTime',
              type: "datetime",
              format: "yyyy-MM-dd hh:mm:ss",
              valueFormat: "timestamp",
              cell: true,
              width: 140
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
        auditTitle: '审核',
        auditDialog: false,
        auditForm: {
          id: '',
          auditStatus: '',
          auditAdvice: '',
        },
        rules: {
          auditAdvice: [
            {required: true, message: '请输入审核意见', trigger: 'blur'},
          ],
          auditStatus: [
            {required: true, message: '请选择审核状态', trigger: 'blur'},
          ]
        },
        auditDetailTitle: '审核详情',
        auditDetailDialog: false,
        allocationAuditDetail: {
          auditPerson: '',
          auditTime: '',
          auditAdvice: ''
        },
        auditList: [],
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
      'warehouseOut.projectPresetId': {
        handler(newVal, oldVal) {
          if (newVal !== undefined && newVal !== oldVal) {
            this.quet()
            for (const tempData of this.projectNameData) {
              if (tempData.projectPresetId === newVal) {
                this.warehouseOut.code = tempData.projectCode
                getAllocationList(tempData.projectPresetId).then(res => {
                  this.productList = res.data.data
                })
                break
              }
            }
          }
        },
        deep: true,
        immediate: true
      },
      'warehouseOut.productList': {
        handler(productList) {
          if (productList !== undefined && productList instanceof Array) {
            // 货品清单列表
            productList.map(product => {
              if (product['productId'] !== undefined && product['productId'] !== '') {
                // 货品列表
                this.productList.forEach(product2 => {
                  // console.log(product2['productId'] === product['productId'])
                  if (product2['productId'] === product['productId']) {
                    product['productCode'] = product2['productCode']
                    product['supplier'] = product2['supplier']
                    product['norms'] = product2['norms']
                    product['unit'] = product2['unit']
                    product['categoryId'] = product2['categoryId']
                    product['availableStockNum'] = product2['availableStockNum']
                    product['unitPrice'] = product2['unitPrice']
                  }
                })
              }
              //小计计算
              if (this.isNumber(product['quantity']) && this.isNumber(product['unitPrice'])) {
                product['money'] = Number(product['quantity']) * Number(product['unitPrice'])
              }
              return product
            })
          }
        },
        deep: true//对象内部的属性监听，深度监听
      },
      //监听详情的商品库项目和货品名称管理列表数据
      'detailForm.projectName': {
        handler(newVal, oldVal) {
          if (newVal !== undefined && newVal !== oldVal) {
            for (const tempData of this.projectNameData) {
              if (tempData.id === newVal) {
                this.detailForm.projectPresetId = tempData.projectPresetId
                this.detailForm.projectCode = tempData.projectCode// {} this.warehousingForm['code']
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
            for (const tempData of this.productNameDate) {
              if (tempData.productId === newVal) {
                this.detailForm.productCode = tempData.productCode
                this.detailForm.supplier = tempData.supplier
                this.detailForm.norms = tempData.norms
                this.detailForm.unit = tempData.unit
                this.detailForm.categoryId = tempData.categoryId
                this.detailForm.availableStockNum = tempData.availableStockNum
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
        getDetailsList().then(res => {
            this.option.column[2].dicData = []
            this.optionOut.column[0].dicData = []
            this.optionDetail.column[0].dicData = []
            this.productList = res.data.data
            //获取详情的货品名称管理列表数据
            this.optionDetail.column[2].dicData = []
            this.productNameDate = res.data.data
            this.projectNameData = res.data.data
            //去掉重复的数据
            var hash = {};
            this.projectNameData = this.projectNameData.reduce(function (item, next) {
              hash[next.projectPresetId] ? '' : hash[next.projectPresetId] = true && item.push(next);
              return item
            }, [])
            for (const data of this.projectNameData) {
              this.option.column[2].dicData.push({value: data.projectPresetId, label: data.projectName})
              this.optionOut.column[0].dicData.push({value: data.projectPresetId, label: data.projectName})
              this.optionDetail.column[0].dicData.push({value: data.projectPresetId, label: data.projectName})
              this.stockNumProductId = data.productId
              //获取货品名称管理列表数据
              this.optionDetail.column[2].dicData.push({value: data.productId, label: data.productName})
            }
          },
        )
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
        if (this.tabName === 'temp') {
          this.query.inOrOut = '1'
          this.query.recordsStatus = '0'
        } else if (this.tabName === 'toAudit') {
          this.query.inOrOut = '1'
          this.query.recordsStatus = '2'
        } else {
          this.query.inOrOut = '1'
          this.query.recordsStatus = '1'
        }
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
          case 'toAudit':
            this.query['recordsStatus'] = "2"
            this.optionDetail.addBtn = false
            this.optionDetail.editBtn = false
            this.optionDetail.delBtn = false
            this.optionDetail.viewBtn = true
            this.optionDetail.menu = false
            break
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
      //弹窗新增出库 暂存
      dialogSave() {
        if (this.$refs.warehouseOut !== undefined) {
          if ((this.warehouseOut.productList || []).length === 0) {
            this.$message({
              type: "warning",
              message: "请填写商品清单!"
            });
            return false
          }
          this.$refs.warehouseOut.validate(isvalidate => {
            if (isvalidate) {
              this.warehouseOut.productList.forEach(product => {
                if (product['quantity'] > product['availableStockNum']) {
                  this.$message({
                    type: "warning",
                    message: "系统数量不足!"
                  });
                  this.$refs.warehouseOut.allDisabled = false
                  return false
                }
              })
              addStockOut(this.warehouseOut).then(() => {
                console.log('-=-=-=-=-=',this.warehouseOut);
                this.onLoad(this.page);
                this.$message({
                  type: "success",
                  message: "操作成功!"
                });
              });
              this.dialogOutVisible = false;
            } else {
              return false
            }
          })
        }
      },
      //弹窗新增出库 提交
      dialogSubmit() {
        if (this.$refs.warehouseOut !== undefined) {
          if ((this.warehouseOut.productList || []).length === 0) {
            this.$message({
              type: "warning",
              message: "请填写商品清单!"
            });
            return false
          }
          this.$refs.warehouseOut.validate(isvalidate => {
            if (isvalidate) {
              this.warehouseOut.productList.forEach(product => {
                if (product['quantity'] > product['availableStockNum']) {
                  this.$message({
                    type: "warning",
                    message: "系统数量不足!"
                  });
                  this.$refs.warehouseOut.allDisabled = false
                  return false
                } else {
                  outSubmit(this.warehouseOut).then(() => {
                    this.onLoad(this.page);
                    this.$message({
                      type: "success",
                      message: "操作成功!"
                    });
                  });
                  this.dialogOutVisible = false;
                }
              })
            } else {
              return false
            }
          })
        }
      },
      //新增出库清空表单方法
      clearAllForm() {
        // 清空按钮点击事件
        if (this.$refs.warehouseOut !== undefined) {
          this.$refs.warehouseOut.resetForm()
          this.$refs.warehouseOut.clearValidate()
          this.$refs.warehouseOut.allDisabled = false
        }
      },
      menuAdd() {
        this.clearAllForm()
        this.dialogOutVisible = true
        this.quet()
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
      rowDetail(row) {
        //自定义表单获取出入库记录列表的数据
        this.storageOut.productListOddNumber = row.productListOddNumber
        this.storageOut.documentDate = row.documentDate
        this.storageOut.projectPresetId = row.$projectPresetId
        this.storageOut.recordsStatus = row.$recordsStatus
        this.storageOut.createUser = row.$createUser
        this.storageOut.createTime = row.createTime
        //获取详情(商品清单)数据
        // console.log('-=-=-=-=',row);
        this.dialogDetailVisible = true
        this.productRecordsId = row.id
        this.projectPresetId = row.projectPresetId
        this.projectName = row.$projectPresetId
        this.projectCode = row.projectCode
        this.detailOnload()
        //获取系统数量
        // getStockNum(row.projectPresetId,this.stockNumProductId).then(res =>{
        //   console.log(this.optionDetail.column[7])
        //   for (const data of res.data.data){
        //     this.detailForm.stockNum = data.stockNum
        //     console.log(this.detailForm.stockNum)
        //   }
        // })
        // console.log(this.detailForm.stockNum)
      },
      detailOnload() {
        this.loading = true;
        getProductInventory(this.productRecordsId).then(res => {
          const data = res.data.data
          this.detailFormData = data.records
          this.pageDetail.total = data.total;
          this.loading = false;
        })
      },
      //详情(商品清单)修改
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
      beforeOpenDetail(done) {
        // console.log('this.detailForm', this.detailForm)
        this.detailForm.projectPresetId = this.projectPresetId
        this.detailForm.projectName = this.projectName
        this.detailForm.projectCode = this.projectCode
        // this.detailForm.productRecordsId = this.productRecordsId
        done()
      },
      //详情(商品清单)的新增事件
      rowDetailSave(row, done) {
        // console.log(row);
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
      //详情(商品清单)的行删除
      rowDetailDel(row) {
        getProductListRemove(row.id).then(() => {
          this.detailOnload(this.pageDetail);
          this.$message({
            type: "success",
            message: "操作成功!"
          });
        })
      },
      //出库列表的操作栏提交
      rowSubmit(row) {
        stockOutSubmit(row.id).then(() => {
          this.onLoad(this.page);
          this.$message({
            type: "success",
            message: "操作成功!"
          });
        })
      },
      //出库列表的行审核
      rowAudit(row) {
        this.auditDialog = true
        if (this.$refs.auditForm !== undefined) {
          this.$refs.auditForm.resetFields();
        } else {
          this.auditForm.id = row.id
        }
      },
      auditSubmit() {
        this.$refs.auditForm.validate((valid) => {
          if (valid) {
            getCKAudit(this.auditForm.id, this.auditForm.auditStatus, this.auditForm.auditAdvice).then(() => {
              this.onLoad(this.page);
              this.$message({
                type: "success",
                message: "操作成功!"
              });
            })
            this.auditDialog = false
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      //出库列表的行审核详情
      rowAuditDetail(row) {
        this.auditDetailDialog = true
        getAuditList(row.id).then(res => {
          this.auditList = res.data.data
          this.allocationAuditDetail.auditPerson = this.auditList[0].auditPerson
          this.allocationAuditDetail.auditTime = this.auditList[0].auditTime
          this.allocationAuditDetail.auditAdvice = this.auditList[0].auditAdvice
        })
      },
      //出库列表 详情 关闭事件
      closeDetailDialog() {
        this.dialogDetailVisible = false
        this.refreshChange()
      },
      //清空出库货品列表的值
      quet() {
        this.productList = ''
        this.warehouseOut.productList = ''
      }
    }
  };
</script>

<style>
</style>
