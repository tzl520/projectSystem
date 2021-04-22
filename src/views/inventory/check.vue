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
                   @row-save="rowSave"
                   @search-change="searchChange"
                   @search-reset="searchReset"
                   @selection-change="selectionChange"
                   @current-change="currentChange"
                   @size-change="sizeChange"
                   @refresh-change="refreshChange"
                   @on-load="onLoad">
          <template slot-scope="{scope,size,row}" slot="menu">
            <el-button type="text" size="mini" @click="startCheck(row)" v-if="row.countStatus === 0">开始盘点</el-button>
            <el-button type="text" size="mini" @click="detailRow(row)" v-if="row.countStatus === 1">详 情</el-button>
            <el-button type="text" size="mini" @click="rowSubmit(row)" v-if="row.countStatus === 1">提 交</el-button>
            <el-button type="text" size="mini" @click="rowDel(row)">删 除</el-button>
          </template>
          <template slot-scope="scope" slot="menuLeft">
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
                   v-model="form"
                   ref="crud"
                   @row-save="rowSave"
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
    <el-dialog :title="checkListDetailTitle"
               width="68%"
               top="7vh"
               :visible.sync="dialogCheckListDetailVisible"
               :modal-append-to-body="false">
      <el-form ref="checkAddListDetail"
               size="mini"
               v-model="form"
               label-width="80px">
        <el-row :gutter="10">
          <el-col span="8">
            <el-form-item label="盘点单号">
              <el-input v-model="form.checkOddNumber" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col span="8">
            <el-form-item label="项目名称">
              <el-input v-model="form.projectPresetName" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col span="8">
            <el-form-item label="盘点时间">
              <el-input v-model="form.checkDate" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col span="8">
            <el-form-item label="盘点人">
              <el-input v-model="form.createUserName" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col span="8">
            <el-form-item label="创建时间">
              <el-input v-model="form.createTime" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <avue-crud :option="optionCheckListDetail"
                 v-model="checkListDetail"
                 ref="checkListDetail"
                 :data="checkListDetailData"
                 :page.sync="pageDetail"
                 @refresh-change="detailOnload"
                 @row-del="rowDetailDel"
                 :table-loading="loading"
                 @row-update="rowUpdate">
      </avue-crud>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogCheckListDetailVisible = false" size="mini">关 闭</el-button>
      </span>
    </el-dialog>
  </basic-container>
</template>

<script>
  import {getList, getDetail, add, remove, checkCount, submit} from "@/api/inventory/checknomber";
  import {getCheckList, getCheckUpdate} from "@/api/inventory/check";
  import { getDetailsList } from "@/api/inventory/projectdetails";
  import {mapGetters} from "vuex";

  export default {
    data() {
      return {
        tabName: 'temp',
        form: {
          projectPresetId: '',
          projectPresetName: '',
          projectCode: '',
          checkDate: '',
          checkOddNumber: '',
          numberStatus: '',
          createUser: '',
          createUserName: '',
          createTime: ''
        },
        query: {numberStatus: '0'},
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
          layout: "total,pager,prev,next,jumper",
        },
        selectionList: [],
        projectNameData: [],
        checkOddNumber: '',
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
          dialogWidth: '40%',
          dialogType: 'form',
          delBtn: false,
          editBtn: false,
          viewBtn: false,
          column: [
            {
              label: '盘点单号',
              prop: 'checkOddNumber',
              addDisplay: false,
              search: true,
              width: 145
            },
            {
              label: "项目名称",
              prop: "projectPresetId",
              rules: [{
                required: true,
                message: '请选择项目名称',
                trigger: 'blur'
              }],
              type: 'select',
              dicData: [],
              filterable: true,
              searchFilterable: true,
              span: 24,
              search: true
            },
            {
              label: '项目代码',
              prop: 'projectCode',
              placeholder: '自动读取',
              readonly: true,
              hide: true,
              showColumn: false,
              span: 24
            },
            {
              label: '盘点时间',
              prop: 'checkDate',
              rules: [{
                required: true,
                message: '请选择盘点时间',
                trigger: 'blur'
              }],
              type: "datetime",
              valueFormat: 'yyyy-MM-dd HH:mm:ss',
              format: 'yyyy-MM-dd HH:mm:ss',
              span: 24
            },
            {
              label: '盘点人',
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
              width: 140
            }]
        },
        checkListDetailTitle: '盘点详情',
        dialogCheckListDetailVisible: false,
        checkListDetail: {
          systemNum: 0,
          checkNum: 0,
          profitOrLoss: '0',
          num: 0
        },
        checkListDetailData: [],
        projectPresetId: '',
        checkNomberId: '',
        checkDate: '',
        productNameDate: [],
        optionCheckListDetail: {
          submitBtn: false,
          addBtn: false,
          columnBtn: false,
          dialogModal: false,
          searchBtn: false,
          emptyBtn: false,
          size: 'mini',
          align: 'center',
          dialogWidth: '40%',
          labelWidth: 110,
          menu: true,
          index: true,
          delBtn: false,
          editBtn: false,
          cellBtn: true,
          column: [
            {
              label: '货品名称',
              prop: 'productName',
              readonly: true
            },
            {
              label: '系统数量',
              prop: 'systemNum',
              readonly: true
            },
            {
              label: '实际盘点数量',
              prop: 'checkNum',
              type: 'number',
              width: 110,
              minRows: 0,
              cell: true
            },
            {
              label: '盈亏数量',
              prop: 'num',
              readonly: true,
              value: 0
            },
            {
              label: '盈亏情况',
              prop: 'profitOrLoss',
              dicUrl: "/api/blade-system/dict-biz/dictionary?code=profitOrLoss",
              props: {
                label: "dictValue",
                value: "dictKey"
              },
              type: 'select',
              readonly: true
            },
            {
              label: '备注',
              prop: 'remark',
              placeholder: '备注',
              cell: true
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
      'form.projectPresetId': {
        handler(newVal, oldVal) {
          if (newVal !== undefined && newVal !== oldVal) {
            for (const tempData of this.projectNameData) {
              if (tempData.projectPresetId === newVal) {
                this.form.projectCode = tempData.projectCode
                break
              }
            }
          }
        },
        deep: true,
        immediate: true
      },
      'checkListDetail.systemNum': {
        handler(val) {
          if (this.isNumber(val) && this.isNumber(this.checkListDetail.checkNum)) {
            if (Number(val) === Number(this.checkListDetail.checkNum)){
              this.checkListDetail['profitOrLoss'] = '0'
              this.checkListDetail.num = 0
            } else if (Number(val) - Number(this.checkListDetail.checkNum) < 0) {
              this.checkListDetail['profitOrLoss'] = '1'
              this.checkListDetail.num = Math.abs(Number(val) - Number(this.checkListDetail.checkNum))
            }else if (Number(val) - Number(this.checkListDetail.checkNum) > 0) {
              this.checkListDetail['profitOrLoss'] = '2'
              this.checkListDetail.num = Math.abs(Number(val) - Number(this.checkListDetail.checkNum))
            }
          }
        },
        deep: true,
        immediate: true
      },
      'checkListDetail.checkNum': {
        handler(val) {
          if (this.isNumber(val) && this.isNumber(this.checkListDetail.systemNum)) {
            if (Number(val) === Number(this.checkListDetail.systemNum)){
              this.checkListDetail['profitOrLoss'] = '0'
              this.checkListDetail.num = 0
            } else if (Number(this.checkListDetail.systemNum) - Number(val) < 0) {
              this.checkListDetail['profitOrLoss'] = '1'
              this.checkListDetail.num = Math.abs(Number(this.checkListDetail.systemNum) - Number(val))
            }else if (Number(this.checkListDetail.systemNum) - Number(val) > 0) {
              this.checkListDetail['profitOrLoss'] = '2'
              this.checkListDetail.num = Math.abs(Number(this.checkListDetail.systemNum) - Number(val))
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
        getDetailsList().then(res => {
          this.projectNameData = res.data.data
          this.option.column[1].dicData = []
          this.option.column[4].dicData = []
          this.option.column[5].dicData = []
          //去掉重复的数据
          var hash = {}
          this.projectNameData = this.projectNameData.reduce(function (item, next) {
            hash[next.projectPresetId] ? '' : hash[next.projectPresetId] = true && item.push(next);
            return item
          }, [])
          for (const data of this.projectNameData) {
            this.option.column[1].dicData.push({value: data.projectPresetId, label: data.projectName})
            this.option.column[4].dicData.push({value: data.projectPresetId, label: data.categoryName})
            this.option.column[5].dicData.push({value: data.projectPresetId, label: data.productName})
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
        this.form.projectPresetId = []
        this.form.checkDate = ''
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
        this.query.numberStatus = (this.tabName === 'temp' ? '0' : '1')
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
          case 'submit':
            this.query['numberStatus'] = "1"
            this.option.addBtn = false
            this.optionCheckListDetail.editBtn = false
            this.optionCheckListDetail.delBtn = false
            this.optionCheckListDetail.viewBtn = true
            this.optionCheckListDetail.menu = false
            break
          default:
            this.query['numberStatus'] = "0"
            this.option.addBtn = true
            this.optionCheckListDetail.editBtn = true
            this.optionCheckListDetail.delBtn = true
            this.optionCheckListDetail.viewBtn = false
            this.optionCheckListDetail.menu = true
            break
        }
        this.onLoad(this.page, {})
      },
      //盘点列表行操作的开始盘点
      startCheck(row) {
        this.projectPresetId = row.projectPresetId
        this.checkDate = row.checkDate
        checkCount(row.id, this.projectPresetId, this.checkDate).then(res => {
          this.onLoad(this.page);
          console.log(res);
        })
      },
      //盘点列表行操作的详情
      detailRow(row) {
        console.log(row);
        this.dialogCheckListDetailVisible = true
        this.form.checkOddNumber = row.checkOddNumber
        this.form.projectPresetName = row.$projectPresetId
        this.form.checkDate = row.checkDate
        this.form.numberStatus = row.$numberStatus
        this.form.createUserName = row.$createUser
        this.form.createTime = row.createTime
        this.projectPresetId = row.projectPresetId
        this.checkNomberId = row.id
        this.detailOnload()
      },
      //盘点列表行操作详情的onload
      detailOnload() {
        this.loading = true;
        getCheckList(this.checkNomberId).then(res => {
          const data = res.data.data
          this.checkListDetailData = data.records
          this.pageDetail.total = data.total;
          this.loading = false;
        })
      },
      //盘点列表行操作详情的修改
      rowUpdate(row, index, done, loading) {
        getCheckUpdate(row).then(() => {
          this.detailOnload(this.pageDetail);
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
      //校验
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
      //盘点列表行操作的提交
      rowSubmit(row) {
        submit(row.id).then(() => {
          this.onLoad(this.page);
          this.$message({
            type: "success",
            message: "操作成功!"
          });
        })
      },
      //盘点列表 详情 删除
      rowDetailDel(row) {
        remove(row.id).then(() => {
          this.detailOnload(this.pageDetail);
          this.$message({
            type: "success",
            message: "操作成功!"
          });
        })
      },
    }
  };
</script>

<style>

</style>
