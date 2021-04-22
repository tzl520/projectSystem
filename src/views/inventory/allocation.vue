<template>
  <basic-container>
    <el-tabs v-model="tabName" @tab-click="tabClick">
      <el-tab-pane label="暂存" name="temp">
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
            <el-button type="text" size="mini" @click="rowView(row)">详 情</el-button>
            <el-button type="text" size="mini" @click="rowSubmit(row)">提 交</el-button>
            <el-button type="text" size="mini" @click="rowDel(row)">删 除</el-button>
          </template>
          <template slot="menuLeft">
            <el-button type="primary"
                       size="mini"
                       icon="el-icon-plus"
                       @click="menuAdd">新 增
            </el-button>
            <!--<el-button type="info"-->
                       <!--size="mini"-->
                       <!--icon="el-icon-takeaway-box"-->
                       <!--plain>导出-->
            <!--</el-button>-->
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
            <el-button type="text" size="mini" @click="rowView(row)">详 情</el-button>
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
            <el-button type="text" size="mini" @click="rowView(row)">详 情</el-button>
            <el-button type="text" size="mini" @click="rowAuditDetail(row)">审核详情</el-button>
          </template>
          <template slot="menuForm">
            <el-button type="warning"
                       icon="el-icon-folder"
                       size="mini"
                       plain>暂 存
            </el-button>
            <el-button type="primary"
                       icon="el-icon-finished"
                       size="mini"
                       plain>提 交
            </el-button>
          </template>
          <template slot="menuLeft">
            <el-button type="danger"
                       size="mini"
                       icon="el-icon-delete"
                       plain
                       v-if="permission.allocation_delete"
                       @click="handleDelete">删 除
            </el-button>
          </template>
        </avue-crud>
      </el-tab-pane>
    </el-tabs>
    <el-dialog :title="addAllocation"
               :modal-append-to-body="false"
               :visible.sync="dialogAllocationVisible"
               top="10vh"
               width="50%">
      <avue-form :option="optionAllocation"
                 :showConfirmButton="false"
                 v-model="allocation"
                 ref="allocation"
                 :data="allocationData">
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
      </avue-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" v-if="this.addAllocation !== '新增调拨' && this.tabName === 'temp'" @click="rowUpdate">修改</el-button>
        <el-button size="mini" v-if="this.addAllocation !== '新增调拨' && this.tabName === 'temp'" @click="dialogAllocationVisible = false">取消</el-button>
        <el-button type="primary" size="mini" v-else-if="this.addAllocation !== '新增调拨' && this.tabName === 'toAudit' || this.tabName === 'submit'" @click="dialogAllocationVisible = false">关闭</el-button>
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
      <avue-form :option="optionAllocationAuditDetail"
                 v-model="allocationAuditDetail"
                 ref="allocationAuditDetail"
                 :data="allocationAuditDetailData">
      </avue-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="auditDetailDialog = false">关闭</el-button>
      </span>
    </el-dialog>
  </basic-container>
</template>

<script>
  import {
    getList,
    getDetail,
    remove,
    save,
    submit,
    update,
    submitAllocation,
    getDBAudit,
    getAuditList
  }
    from "@/api/inventory/allocation";
  import { getDetailsList, getAllocationList } from "@/api/inventory/projectdetails";
  import { mapGetters } from "vuex";

  export default {
    data() {
      return {
        tabName: 'temp',
        form: {},
        query: {allocationStatus: "0"},
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
          dialogClickModal: false,
          size: 'mini',
          align: 'center',
          column: [
            {
              label: '单号',
              prop: 'allocationOddNumber',
              addDisplay: false,
              readonly: true,
              search: true,
              width: 145,
              searchLabelWidth: 50
            },
            {
              label: '调拨状态',
              prop: 'allocationStatus',
              dicUrl: "/api/blade-system/dict-biz/dictionary?code=recordsStatus",
              props: {
                label: "dictValue",
                value: "dictKey"
              },
              type: 'select'
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
              search: true
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
              label: "备注",
              prop: "remark",
              rules: [{
                required: true,
                message: "请输入备注",
                trigger: "blur"
              }]
            },
          ]
        },
        dialogAllocationVisible: false,
        allocationData: [],
        allocation: {
          dialOutProject: '',
          dialInProject: '',
          projectCode: '',
          productId: '',
          categoryName: '',
          productCode: '',
          availableStockNum: ''
        },
        addAllocation: '新增调拨',
        projectNameData: [],
        optionAllocation: {
          menuBtn: true,
          submitBtn: false,
          labelWidth: 115,
          size: 'mini',
          align: 'center',
          disabled: false,
          group: [
            {
              icon: 'el-icon-sold-out',
              label: '拨出项目',
              // collapse: true,
              arrow: false,
              prop: 'group1',
              column: [
                {
                  label: '拨出项目',
                  prop: 'dialOutProject',
                  rules: [{
                    required: true,
                    message: '请选择拨出项目',
                    trigger: 'blur'
                  }],
                  type: 'select',
                  filterable: true,
                  dicData: []
                }, {
                  label: '项目代码',
                  prop: 'projectCode',
                  placeholder: '项目代码',
                  readonly: true
                }, {
                  label: '货品名称',
                  prop: 'productId',
                  rules: [{
                    required: true,
                    message: '请选择货品名称',
                    trigger: 'blur'
                  }],
                  type: 'select',
                  filterable: true,
                  dicData: []
                }, {
                  label: '货品类别',
                  prop: 'categoryName',
                  placeholder: '货品类别',
                  readonly: true
                }, {
                  label: '货品编号',
                  prop: 'productCode',
                  placeholder: '货品编号',
                  readonly: true
                }, {
                  label: '项目库存总量',
                  prop: 'availableStockNum',
                  placeholder: '项目库存总量',
                  readonly: true,
                }, {
                  label: '拨出数量',
                  prop: 'quantity',
                  rules: [{
                    required: true,
                    message: '请输入拨出数量',
                    trigger: 'blur'
                  }],
                  type: 'number',
                  value: '1',
                  minRows: 1,
                }, {
                  label: '备注',
                  prop: 'remark',
                  placeholder: '备注',
                }]
            },
            {
              icon: 'el-icon-sell',
              label: '拨入项目',
              prop: 'group2',
              arrow: false,
              column: [
                {
                  label: '拨入项目',
                  prop: 'dialInProject',
                  rules: [{
                    required: true,
                    message: '请选择拨入项目',
                    trigger: 'blur'
                  }],
                  type: 'select',
                  filterable: true,
                  dicData: []
                }, {
                  label: '项目代码',
                  prop: 'projectCode1',
                  placeholder: '项目代码',
                  readonly: true
                }]
            },
          ]
        },
        auditTitle: '审核',
        auditDialog: false,
        auditForm: {
          allocationId: '',
          auditStatus: '',
          auditAdvice: '',
        },
        rules: {
          auditAdvice: [
            { required: true, message: '请输入审核意见', trigger: 'blur' },
          ],
          auditStatus:[
            { required: true, message: '请选择审核状态', trigger: 'blur' },
          ]
        },
        auditDetailTitle: '审核详情',
        auditDetailDialog: false,
        allocationAuditDetail: {},
        allocationAuditDetailData: [],
        optionAllocationAuditDetail: {
          submitBtn: false,
          emptyBtn: false,
          size: 'mini',
          disabled: true,
          column: [
            {
              label: '审核人',
              prop: 'auditPerson',
              span: 24
            },{
              label: '审核时间',
              prop: 'auditTime',
              span: 24
            },{
              label: '审核意见',
              prop: 'auditAdvice',
              type: 'textarea',
              span: 24
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
          addBtn: this.vaildData(this.permission.allocation_add, false),
          viewBtn: this.vaildData(this.permission.allocation_view, false),
          delBtn: this.vaildData(this.permission.allocation_delete, false),
          editBtn: this.vaildData(this.permission.allocation_edit, false)
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
      'allocation.dialOutProject': {
        handler(newVal, oldVal) {
          if (newVal !== undefined && newVal !== oldVal) {
            this.optionAllocation.group[0].column[2].dicData = []
            this.quet()
            for (const tempData of this.projectNameData) {
              if (tempData.projectPresetId === newVal) {
                this.allocation.projectCode = tempData.projectCode
                getAllocationList(tempData.projectPresetId ).then(res =>{
                  this.optionAllocation.group[0].column[2].dicData = []
                  for (const data of res.data.data) {
                    this.optionAllocation.group[0].column[2].dicData.push({value: data.productId, label: data.productName})
                  }
                })
                break
              }
            }
          }
        },
        deep: true,
        immediate: true
      },
      'allocation.productId': {
        handler(newVal, oldVal) {
          if (newVal !== undefined && newVal !== oldVal) {
            for (const tempData of this.projectNameData) {
              if (tempData.productId === newVal) {
                this.allocation.categoryName = tempData.categoryName
                this.allocation.categoryId = tempData.categoryId
                this.allocation.productCode = tempData.productCode
                this.allocation.availableStockNum = tempData.availableStockNum
                break
              }
            }
          }
        },
        deep: true,
        immediate: true
      },
      'allocation.dialInProject': {
        handler(newVal, oldVal) {
          if (newVal !== undefined && newVal !== oldVal) {
            for (const tempData of this.projectNameData) {
              if (tempData.projectPresetId === newVal) {
                this.allocation.projectCode1 = tempData.projectCode
                break
              }
            }
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
        //获取新增调拨项目
        getDetailsList().then(res => {
          this.optionAllocation.group[0].column[0].dicData = []
          this.optionAllocation.group[0].column[2].dicData = []
          this.optionAllocation.group[1].column[0].dicData = []
          this.projectNameData = res.data.data
          var hash = {}
          this.projectNameData = this.projectNameData.reduce(function (item, next) {
            hash[next.projectPresetId] ? '' : hash[next.projectPresetId] = true && item.push(next)
            return item
          }, [])
          for (const data of this.projectNameData) {
            this.optionAllocation.group[0].column[0].dicData.push({value: data.projectPresetId, label: data.projectName})
            // this.optionAllocation.group[0].column[2].dicData.push({value: data.productId, label: data.productName})
            this.optionAllocation.group[1].column[0].dicData.push({value: data.projectPresetId, label: data.projectName})
          }
        })
      },
      beforeOpen(done, type) {
        if (["edit", "view"].includes(type)) {
          getDetail(this.form.id).then(res => {
            this.form = res.data.data;
          });
        }
        done();
      },
      //清空数据
      quet(){
        this.allocation.productId = ''
        this.allocation.categoryName = ''
        this.allocation.availableStockNum = ''
        this.allocation.productCode = ''
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
        if (this.tabName === 'temp') {
          this.query.allocationStatus = '0'
        } else if (this.tabName === 'toAudit') {
          this.query.allocationStatus = '2'
        } else {
          this.query.allocationStatus = '1'
        }
        getList(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
          const data = res.data.data;
          this.page.total = data.total;
          this.data = data.records;
          this.loading = false;
          this.selectionClear();
        });
      },
      tabClick(e) {
        switch (e.name) {
          case 'toAudit':
            this.query['allocationStatus'] = "2"
            this.optionAllocation.disabled = true
            break
          case 'submit':
            this.query['allocationStatus'] = "1"
            this.optionAllocation.disabled = true
            break
          default:
            this.query['allocationStatus'] = "0"
            this.optionAllocation.disabled = false
            break
        }
        this.onLoad(this.page, {})
      },
      // 清空按钮点击事件
      clearAllForm() {
        if (this.$refs.allocation !== undefined) {
          this.$refs.allocation.resetForm()
          this.$refs.allocation.clearValidate()
          this.$refs.allocation.allDisabled = false
        }
      },
      //新增
      menuAdd() {
        this.clearAllForm()
        this.addAllocation = '新增调拨'
        this.optionAllocation.menuBtn = true
        this.dialogAllocationVisible = true;
        this.quet()
      },
      //弹窗新增调拨暂存
      dialogSave() {
        if (this.$refs.allocation !== undefined) {
          this.$refs.allocation.validate(isvalidate => {
            if (!isvalidate) {
              return
            } else {
              if (this.allocation.quantity > this.allocation.availableStockNum) {
                this.$message.warning('库存总量不足!')
                this.$refs.allocation.allDisabled = false
              } else {
                save(this.allocation).then(() => {
                  this.onLoad(this.page);
                  this.$message({
                    type: "success",
                    message: "操作成功!"
                  });
                  this.dialogAllocationVisible = false;
                });
              }
            }
          })
        }
      },
      //弹窗新增调拨提交
      dialogSubmit() {
        if (this.$refs.allocation !== undefined) {
          this.$refs.allocation.validate(isvalidate => {
            if (!isvalidate) {
              return
            } else {
              if (this.allocation.quantity > this.allocation.availableStockNum) {
                this.$message.warning('库存总量不足!')
                this.$refs.allocation.allDisabled = false
              } else {
                submit(this.allocation).then(() => {
                  this.onLoad(this.page);
                  this.$message({
                    type: "success",
                    message: "操作成功!"
                  });
                  this.dialogAllocationVisible = false;
                });
              }
            }
          })
        }
      },
      //调拨管理列表行删除
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
      //调拨管理列表行提交
      rowSubmit(row) {
        submitAllocation(row.id).then(() => {
          this.onLoad(this.page);
          this.$message({
            type: "success",
            message: "操作成功!"
          });
        })
      },
      //调拨管理列表行详情
      rowView(row) {
        getDetail(row.id).then(res => {
          this.addAllocation = '详情'
          this.optionAllocation.menuBtn = false
          if (this.$refs.allocation !== undefined) {
            this.$refs.allocation.allDisabled = false
          }
          const data = res.data.data
          console.log(data);
          this.allocation = data
          this.dialogAllocationVisible = true
        })
      },
      //调拨管理列表行详情 修改
      rowUpdate() {
        if (this.$refs.allocation !== undefined) {
          this.$refs.allocation.validate(isvalidate => {
            if (!isvalidate) {
              return
            } else {
              update(this.allocation).then(() => {
                this.onLoad(this.page);
                this.$message({
                  type: "success",
                  message: "操作成功!"
                });
                this.dialogAllocationVisible = false
              });
            }
          })
        }
      },

      //调拨管理列表审核
      rowAudit(row) {
        this.auditDialog = true
        if (this.$refs.auditForm !== undefined) {
          this.$refs.auditForm.resetFields();
        } else {
          this.auditForm.allocationId = row.id
        }
      },
      auditSubmit() {
        this.$refs.auditForm.validate((valid) => {
          if (valid) {
            getDBAudit(this.auditForm.allocationId, this.auditForm.auditStatus, this.auditForm.auditAdvice).then(() => {
              this.onLoad(this.page);
              this.$message({
                type: "success",
                message: "操作成功!"
              });
            })
            this.auditDialog = false
          } else {
            return false;
          }
        })
      },
      //调拨管理列表的行审核详情
      rowAuditDetail(row) {
        this.auditDetailDialog = true
        getAuditList(row.id).then(res => {
          const data = res.data.data[1]
          this.allocationAuditDetail = data
        })
      }
    }
  };
</script>

<style>
</style>
