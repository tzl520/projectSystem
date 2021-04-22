<template>
  <basic-container>
    <avue-crud :option="option"
               :table-loading="loading"
               :data="data.map(item=>{item.receiver==='-1'|| item.receiver===-1 ? item.receiver = '': item.receiver;return item})"
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
        <el-tag v-show="scope.row.priority === '1'" type="danger" :size="scope.size">{{scope.row.$priority}}</el-tag>
        <el-tag v-show="scope.row.priority === '4'" type="primary" :size="scope.size">{{scope.row.$priority}}</el-tag>
        <el-tag v-show="scope.row.priority === '3'" type="success" :size="scope.size">{{scope.row.$priority}}</el-tag>
        <el-tag v-show="scope.row.priority === '2'" type="warning" :size="scope.size">{{scope.row.$priority}}</el-tag>
      </template>
      <template slot-scope="{type, size, row}" slot="menu">
        <el-button :size="size" :type="type" @click="showGiveFormDialog(row, true)">查看</el-button>
        <el-button v-if="!arr.includes(row.workOrderState)" :size="size" :type="type" @click="showGiveFormDialog(row,false)">编辑</el-button>
        <el-button v-if="row.workOrderState === '0'" :size="size" :type="type" @click="showDialog(row)">派发</el-button>
        <el-button v-if="row.workOrderState === '5'" :size="size" :type="type" @click="showDialog(row)">重新派发</el-button>
        <el-button v-if="row.workOrderState === '2' || row.workOrderState === '1'" :size="size" :type="type" @click="hangDialog(row)">挂起</el-button>
        <el-button v-if="array.includes(row.workOrderState) " :size="size" :type="type" @click="showClose(row)">关闭</el-button>
        <el-button v-if="row.workOrderState === '1' || row.workOrderState === '2'"  :size="size" :type="type" @click="urgingDialog(row)">催办</el-button>
        <el-button v-if="row.workOrderState === '3'" :size="size" :type="type" @click="signClickDialog(row)">发起回访</el-button>
      </template>
    </avue-crud>
    <el-dialog :visible.sync="dialogFormVisible" :modal="false" width="30%">
      <avue-form :option="dialogAgainFormOption" v-model="dialogAgainForm"  ref="dialogAgainForm">
      </avue-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false" size="mini">取 消</el-button>
        <el-button type="primary" @click="signClick" size="mini">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="dialogVisible"
      width="30%"
      :modal="false"

    >
      <avue-form :option="dialogFormOption" v-model="dialogForm"  ref="dialogForm">
      </avue-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="mini">取 消</el-button>
        <el-button type="primary" @click="distribution" size="mini">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :visible.sync="CloseVisible"
      width="30%"
      :modal="false"
    >
      <avue-form :option="dialogFormOptionClose" v-model="dialogFormClose"  ref="dialogFormClose">
      </avue-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="distributionClose" size="mini">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :visible.sync="urgingVisible"
      width="30%"
      :modal="false"
    >
      <avue-form :option="dialogFormOptionUrging" v-model="dialogFormUrging"  ref="dialogFormUrging">
      </avue-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="distributionUrging" size="mini">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :visible.sync="hangVisible"
      width="30%"
      :modal="false"
    >
      <avue-form :option="dialogFormOptionHang" v-model="dialogFormHang"  ref="dialogFormHang">
      </avue-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="distributionHang" size="mini">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :visible.sync="giveForm.dialogVisible"
      :title="giveForm.dialogTitle"
      width="60%"
      :modal="false"
    >
      <give-form :submit-loading.sync="giveForm.submitLoading" :give-form-data="giveForm.data" :is-read-only="giveForm.isReadOnly" @submit="handleReserve" @close="giveForm.dialogVisible = false"></give-form>
    </el-dialog>
  </basic-container>
</template>


<script>
import {getDetail, add, update, remove, doneworkSub} from "@/api/workorder/backe";
import {commit, updateWork, getGivePageList} from '@/api/workorder/give'
import {mapGetters} from "vuex";
import {closeSubmit} from "@/api/workorder/close";
import {urgingSub} from "@/api/workorder/reminder";
import {hangSub} from "@/api/workorder/hangup";
import GiveForm from "@/views/workorder/form/giveForm";


export default {
  components: {GiveForm},
  data() {
    //校验回访内容
    let addressReg = (rule, value, callback) => {
      let regExp = /^[\\s\u4e00-\u9fa5A-Za-z0-9]{0,}$/;
      setTimeout(()=>{
        if(value !== undefined && value !== ''){
          if (!regExp.test(value)) {
            callback(new Error('您输入了非法字符，请重新输入!'));
          } else {
            callback();
          }
        }else{
          callback()
        }

      },100)

    }
    //校验关闭内容
    let closeReg = (rule, value, callback) => {
      let regExp = /^[\\s\u4e00-\u9fa5A-Za-z0-9]{0,}$/;
      setTimeout(()=>{
        if(value !== undefined && value !== ''){
          if (!regExp.test(value)) {
            callback(new Error('您输入了非法字符，请重新输入!'));
          } else {
            callback();
          }
        }else{
          callback()
        }

      },100)

    }
    //校验催办内容
    let reminderRep = (rule, value, callback) => {
      let regExp = /^[\\s\u4e00-\u9fa5A-Za-z0-9]{0,}$/;
      setTimeout(()=>{
        if(value !== undefined && value !== ''){
          if (!regExp.test(value)) {
            callback(new Error('您输入了非法字符，请重新输入!'));
          } else {
            callback();
          }
        }else{
          callback()
        }

      },100)
    }
   //校验派发内容
    let sendRep = (rule, value, callback) => {
      let regExp = /^[\\s\u4e00-\u9fa5A-Za-z0-9]{0,}$/;
      setTimeout(()=>{
        if(value !== undefined && value !== ''){
          if (!regExp.test(value)) {
            callback(new Error('您输入了非法字符，请重新输入!'));
          } else {
            callback();
          }
        }else{
          callback()
        }

      },100)
    }
//校验挂起内容
    let hangRep = (rule, value, callback) => {
      let regExp = /^[\\s\u4e00-\u9fa5A-Za-z0-9]{0,}$/;
      setTimeout(()=>{
        if(value !== undefined && value !== ''){
          if (!regExp.test(value)) {
            callback(new Error('您输入了非法字符，请重新输入!'));
          } else {
            callback();
          }
        }else{
          callback()
        }

      },100)
    }
    return {
      form: {},
      giveForm: {
        dialogTitle: '编辑工单',
        dialogVisible: false,
        submitLoading: false,
        isReadOnly: false,
        data: {}
      },
      dialogForm: {
        id: ''
      },
      dialogFormClose:{
        id:''
      },
      dialogFormUrging: {
        giveId: '',
        id:''
      },
      dialogFormHang: {
        id: ''
      },
      dialogAgainForm:{
        giveId:''
      },
      arr: ['1', '2', '3','6'], // 待办、在办、已办数组
      array: ['1','2','0','4', '5','7'],
      query: {},
      loading: true,
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0
      },
      urgingVisible : false,
      CloseVisible : false,
      dialogVisible : false,
      hangVisible : false,
      dialogFormVisible: false,
      selectionList: [],
      option: {
        indexLabel:'序号',
        size: "mini",
        labelWidth: 100,
        height:'auto',
        calcHeight: 30,
        tip: false,
        searchShow: true,
        searchMenuSpan: 4,
        border: true,
        index: true,
        addBtn:false,
        excelBtn: false,
        delBtn: false,
        viewBtn: false,
        editBtn: false,
        align:'center',
        menuWidth: 300,
        selection: true,
        dialogClickModal: false,
        column: [
          {
            label: "工单编号",
            prop: "workOrderNumber",
            search: true,
          },
          {
            label: "工单名称",
            prop: "workOrderName",
            search: true,
          },
          {
            label: "工单类型",
            prop: "workOrderType",
            type:'select',
            dicUrl: '/api/workorder/worktype/list',
            props: {
              label: "typeName",
              value: "id"
            },
            search: true,
            searchFilterable: true,
          },
          {
            label: "优先级",
            prop: "priority",
            type: "select",
            search: true,
            slot: true,
            width: "80",
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=priority",
            props: {
              label: "dictValue",
              value: "dictKey"
            },
          },
          {
            label: "状 态",
            prop: "workOrderState",
            type: "select",
            searchPlaceholder:'状态',
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=work_order_state",
            props: {
              label: "dictValue",
              value: "dictKey"
            },
            search: true
          },
          {
            label: "回访状态",
            prop: "returnStatus",
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=return_status",
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
            label: "接   收  人",
            searchPlaceholder:'接收人',
            prop: "receiver",
            type:'select',
            dicUrl: "/api/blade-user/userNameList",
            props: {
              label: "name",
              value: "id"
            },
            search: true
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
          dicUrl: "/api/blade-user/userNameList",
          props: {
            label: "name",
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
            validator: sendRep,
            trigger: "change"
          }],
          span: 24,
        }
        ]
      },
      //关闭
      dialogFormOptionClose: {
        emptyBtn:false,
        submitBtn:false,
        labelWidth: 120,
        column: [{
          label: "关闭工单原因",
          prop: "closeCause",
          type: "textarea",
          span: 24,
          rules:[{
            validator:closeReg,
            trigger: "change"
          }],
        }]
      },
      //催办
      dialogFormOptionUrging: {
        emptyBtn:false,
        submitBtn:false,
        labelWidth: 100,
        column: [{
          label: "催办内容",
          prop: "reminderContent",
          type: "textarea",
          rules: [{
            validator: reminderRep,
          }],
          span: 24,
        },
          {
          label: "催办方式",
          type: "select",
            prop:"reminderWay",
            rules:[{
            required: true,
              message:'请选择催办方式'
            }],
          dicUrl: "/api/blade-system/dict-biz/dictionary?code=reminder_way",
          props: {
            label: "dictValue",
            value: "dictKey"
          },span: 24,
        }]
      },
      //挂起
      dialogFormOptionHang: {
        emptyBtn:false,
        submitBtn:false,
        labelWidth: 100,
        column: [{
          label: "挂起原因",
          prop: "hangUpReson",
          type: "textarea",
          span: 24,
          rules:[{
            required:true,
            validator: hangRep,
            trigger:'change'
          }]
        },
          {
            label: "结束时间",
            prop: "hangUpEndTime",
            type: "date",
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd',
            span: 24,
            rules:[{
              required:true,
              message:'请选择结束时间',
              trigger:'change'
            }]
          }
        ]
      },
      // 回访
      dialogAgainFormOption: {
        emptyBtn: false,
        submitBtn: false,
        column: [
          {
            label: "回访人",
            type: "select",
            prop: 'returnPeople',
            rules: [{
              required: true,
              message: "请选择回访人",
              trigger: "change",
            }],
            dicUrl: "/api/blade-user/userNameList",
            props: {
              label: "name",
              value: "id"
            },
            span:24
          },
          {
            label: "回访内容",
            prop: 'returnContent',
            type: "textarea",rules: [{
              required: true,
              validator:addressReg,
              trigger: "change",
            }],
            span:24
          },
          {
            label: "回访时间",
            type: "date",
            prop: 'time',
            rules: [{
              required: true,
              message: "请选择回访时间",
              trigger: "blur",
            }],
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd',
            span:24
          }]
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
    signClickDialog(row){
      if (this.$refs.dialogAgainForm !== undefined) {
        this.$refs.dialogAgainForm.resetForm()
        this.$refs.dialogAgainForm.clearValidate()
      }
      this.dialogFormVisible=true
      this.dialogAgainForm.giveId=row.id
    },
    //回访按钮
    signClick() {
      this.$refs.dialogAgainForm.validate(isvalidate => {
        if (!isvalidate) {
          console.log('验证不通过')
          return
        }else {
          doneworkSub(this.dialogAgainForm).then( res => {
            const type = res.data.success ? "success" : "error"
            this.$message({
              message: '操作成功!',
              type: type
            })
            this.onLoad(this.page)
            this.$refs.dialogAgainForm.allDisabled = false
            this.dialogFormVisible=false
            this.$refs.dialogAgainForm.resetForm()
          })
        }
      })
    },
    // 显示派发表单
    showDialog(row) {
      if (this.$refs.dialogForm !== undefined) {
        this.$refs.dialogForm.resetForm()
        this.$refs.dialogForm.clearValidate()
      }
      this.dialogForm.id = row.id
      this.dialogVisible = true
    },
    //显示关闭传的giveId
    showClose(row) {
      if (this.$refs.dialogFormClose !== undefined) {
        this.$refs.dialogFormClose.resetForm()
        this.$refs.dialogFormClose.clearValidate()
      }
      this.dialogFormClose.id = row.id
      this.CloseVisible = true
    },
    //催办
    urgingDialog(row) {
      if (this.$refs.dialogFormUrging !== undefined) {
        this.$refs.dialogFormUrging.resetForm()
        this.$refs.dialogFormUrging.clearValidate()
      }
      this.dialogFormUrging.giveId = row.id
      this.urgingVisible = true
    },
    // 挂起
    hangDialog(row) {
      if (this.$refs.dialogFormHang !== undefined) {
        this.$refs.dialogFormHang.resetForm()
        this.$refs.dialogFormHang.clearValidate()
      }
      this.dialogFormHang.id = row.id
      this.hangVisible = true
    },
    // 这是派发工单确认的按钮
    distribution(){
      this.$refs.dialogForm.validate(isvalidate => {
        if (!isvalidate) {
          console.log('验证不通过')
          return
        }else {
          commit(this.dialogForm).then( res => {
            const type = res.data.success ? "success" : "error"
            this.$message({
              message: res.data.msg,
              type: type
            })
            //这是将表单中的所有数据全部清空
             this.$refs.dialogForm.resetForm()
            // 这是取消组件自带的所有元素禁用按钮
            this.$refs.dialogForm.allDisabled = false
            // 对话框窗口关闭
            this.dialogVisible = false
            if (res.data.success) {
              this.onLoad(this.page)
            }
          })
        }
      })
    },
    //关闭
    distributionClose() {
      this.$refs.dialogFormClose.validate(isvalidate => {
        if (!isvalidate) {
          console.log('验证不通过')
          return
        } else {
          closeSubmit(this.dialogFormClose.id, this.dialogFormClose.closeCause).then(res => {
            const type = res.data.success ? "success" : "error"
            this.$message({
              message: res.data.msg,
              type: type
            })
            this.$refs.dialogFormClose.resetForm()
            this.CloseVisible = false
          })
          this.onLoad(this.page)
        }
      })
    },
    //这是催办提交
    distributionUrging(){
      this.$refs.dialogFormUrging.validate(isvalidate => {
        if (!isvalidate) {
          return
        } else {
          urgingSub(this.dialogFormUrging.giveId, this.dialogFormUrging.reminderContent, this.dialogFormUrging.reminderWay)
            .then(res => {
              const type = res.data.success ? "success" : "error"
              this.$message({
                message: res.data.msg,
                type: type
              })
              this.urgingVisible = false
              this.$refs.dialogFormUrging.resetForm()
              this.onLoad(this.page)
              // 刷新整个项目location.reload()
            })
        }
    })
    },
    //这是挂起提交的按钮
    distributionHang(){
      this.$refs.dialogFormHang.validate(isvalidate => {
        if (!isvalidate) {
          return
        } else {
      hangSub(this.dialogFormHang.id,this.dialogFormHang.hangUpReson,this.dialogFormHang.hangUpEndTime).then(res =>{
        const type = res.data.success ? "success" : "error"
        this.$message({
          message: res.data.msg,
          type: type
        })
        this.onLoad(this.page)
        this.hangVisible = false
        this.$refs.dialogFormHang.resetForm()
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
      getGivePageList(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        this.data = data.records;
        this.loading = false;
        this.selectionClear();
      });
    },
    showGiveFormDialog(row, readonly = false) {
      this.giveForm.isReadOnly = readonly
      this.giveForm.data = Object.assign({}, row)
      this.giveForm.dialogTitle = readonly ? '查看工单' : '编辑工单'
      this.giveForm.dialogVisible = true
      console.log('this.$ref',this.$refs)
    },
    // 这是表单进行更新的方法
    handleReserve(submitData) {
      this.submitLoading = true
      updateWork(submitData).then(res => {
        //res. data. Success 存在就给type赋值success,否则就赋值error
        const type = res.data.success ? 'success' : 'error'
        this.$confirm(res.data.msg, {
          confirmButtonText: "确定",
          showCancelButton: false,
          closeOnClickModal: false,
          closeOnPressEscape: false,
          showClose: false,
          type: type
        }).then(() => {
          this.giveForm.dialogVisible = false
          this.submitLoading = false
          this.onLoad(this.page, this.query)
          this.giveForm.isReadOnly = true
        })
      },error => {
        this.$message({
          type: "error",
          message: error
        });
        this.submitLoading = false
      })
    }
  }
};
</script>

<style>
</style>
