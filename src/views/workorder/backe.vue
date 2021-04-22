<template>
  <basic-container>
    <avue-crud :option="option"
               :table-loading="loading"
               :data="data"
               :page.sync="page"
               :before-open="beforeOpen"
               v-model="form"
               ref="crud"
               @search-change="searchChange"
               @search-reset="searchReset"
               @selection-change="selectionChange"
               @current-change="currentChange"
               @size-change="sizeChange"
               @refresh-change="refreshChange"
               @on-load="onLoad">
      <template slot="priority" slot-scope="scope">
        <el-tag v-show="scope.row.give.priority === '1'" type="danger" :size="scope.size">{{scope.row.$priority}}</el-tag>
        <el-tag v-show="scope.row.give.priority === '4'" type="primary" :size="scope.size">{{scope.row.$priority}}</el-tag>
        <el-tag v-show="scope.row.give.priority === '3'" type="success" :size="scope.size">{{scope.row.$priority}}</el-tag>
        <el-tag v-show="scope.row.give.priority === '2'" type="warning" :size="scope.size">{{scope.row.$priority}}</el-tag>
      </template>
      <template slot-scope="{type,size,row}" slot="menu">
        <el-button :size="size" :type="type" @click="showBacke(row,true)">查看</el-button>
        <el-button :size="size" :type="type" @click="signClick(row)">签收</el-button>
        <el-button :size="size" :type="type" @click="noClick(row)">拒收</el-button>
      </template>
    </avue-crud>
    <el-dialog
      :visible.sync="giveForm.dialogVisible"
      :title="giveForm.dialogTitle"
      width="60%"
      :modal="false"
    >
      <give-form :submit-loading.sync="giveForm.submitLoading" :give-form-data="giveForm.data" :is-read-only="giveForm.isReadOnly" @close="giveForm.dialogVisible = false"></give-form>
    </el-dialog>
    <el-dialog :visible.sync="dialogFormVisible" :modal="false" width="30%">
      <avue-form :option="dialogFormOption" v-model="dialogForm"  ref="dialogForm">
      </avue-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogFormVisible = false" size="mini">取 消</el-button>
      <el-button type="primary" @click="refuseClick" size="mini">确 定</el-button>
    </div>
  </el-dialog>

  </basic-container>
</template>


<script>
import {getDetail, sign, getList} from "@/api/workorder/backe";
import {mapGetters} from "vuex";
import {refuseC} from "@/api/workorder/refuse";
import GiveForm from "@/views/workorder/form/giveForm";
import {getUserNameList} from "@/api/workorder/common";

export default {
  components: {GiveForm},
  data() {
    //校验拒收内容
    let refuseRep = (rule, value, callback) => {
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
      unbliecable: true,
      form: {},
      dialogForm:{
        id:'',
        giveId: '',
        refuseReason: ''
      },
      receiverList: [],
      giveForm:{
        dialogTitle: '查看',
        dialogVisible: false,
        submitLoading: false,
        isReadOnly: false,
        data: {}
        },
      query: {
        backeStatus: "1"
      },
      loading: true,
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0
      },
      dialogFormVisible : false,
      selectionList: [],
      option: {
        align: "center",
        size: "mini",
        labelWidth: 100,
        height:'auto',
        calcHeight: 30,
        tip: false,
        searchShow: true,
        indexLabel:'序号',
        editBtn: false,
        searchMenuSpan: 4,
        border: true,
        index: true,
        addBtn:false,
        excelBtn: false,
        delBtn: false,
        viewBtn: false,
        selection: true,
        dialogClickModal: false,
        column: [
          {
            label: "工单编号",
            prop: "giveWorkOrderNumber",
            bind: "give.workOrderNumber"
          },
          {
            label: "工单编号",
            prop: "workOrderNumber",
            search: true,
            hide: true,
            showColumn: false
          },
          {
            label: "工单名称",
            prop: "giveWorkOrderName",
            bind: "give.workOrderName",
          },
          {
            label: "工单名称",
            prop: "workOrderName",
            search: true,
            hide: true,
            showColumn: false
          },{
            label: "工单类型",
            prop: "giveWorkOrderType",
            type:'select',
            bind: "give.workOrderType",
            dicUrl: '/api/workorder/worktype/list',
            props: {
              label: "typeName",
              value: "id"
            },
          },{
            label: "工单类型",
            prop: "workOrderType",
            type:'select',
            search: true,
            dicUrl: '/api/workorder/worktype/list',
            props: {
              label: "typeName",
              value: "id"
            },
            hide: true,
            showColumn: false,
            searchFilterable: true,
          },
          {
            label: "优先级",
            prop: "priorityj",
            bind: "give.priority",
            type: "select",
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=priority",
            props: {
              label: "dictValue",
              value: "dictKey"
            },
          },{
            label: "优先级",
            prop: "priority",
            type: "select",
            search: true,
            hide: true,
            showColumn: false,
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=priority",
            props: {
              label: "dictValue",
              value: "dictKey"
            },

          },
          {
            label: "工单完成时间",
            prop: "finishStartTime",
            bind: "give.finishStartTime",
            type: 'date',
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd',
          },
          {
            label: "接收人",
            prop: "giveRelationPeople",
            bind: "give.receiver",

            dicUrl: "/api/blade-user/userNameList",
            props: {
              label: "name",
              value: "id"
            },
          },
          {
            label: "接收人",
            prop: "receiver",
            search: true,
            type:'select',
            hide: true,
            dicUrl: "/api/blade-user/userNameList",
            props: {
              label: "name",
              value: "id"
            },
            showColumn: false
          }]
      },
      dialogFormOption: {
        emptyBtn: false,
        submitBtn: false,
        column: [
          {
            label: "拒收原因",
            prop: "refuseReason",
            type: "textarea",
            rules:[{
              required: true,
              trigger:"change",
              validator: refuseRep,
            }],
            span:24
          }]
      },
      data: [{ give: { workOrderNumber: ''} }]
    };
  },
  computed: {
    ...mapGetters(["permission"]),
    ids() {
      let ids = [];
      this.selectionList.forEach(ele => {
        ids.push(ele.id);
      });
      return ids.join(",");
    }
  },
  mounted() {
    getUserNameList().then(res=>{
      this.receiverList = res.data.data
    })
  },
  methods: {
    showBacke(row,readonly = true){
      this.giveForm.isReadOnly=readonly
      this.giveForm.dialogVisible=true
      this.giveForm.dialogTitle="查看"
      // 浅拷贝
      this.giveForm.data = Object.assign({}, row.give || {})
    },
    noClick(row){
      if (this.$refs.dialogForm !== undefined) {
        this.$refs.dialogForm.resetForm()
        this.$refs.dialogForm.clearValidate()
      }
      this.dialogForm.id = row.id
      this.dialogForm.giveid=row.giveId
      this.dialogFormVisible = true
    },
    //签收按钮
    signClick(row) {
      console.log(row.id)
      this.$confirm( '是否签收该工单?', '提示', {
        confirmButtonText: '签收',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        sign(row.id).then( res => {
          const type = res.data.success ? "success" : "error"
          this.$message({
            message: '签收成功!',
            type: type
          })
          this.onLoad(this.page)
      })
    }).catch((error)=>{
        console.log(error)
      })
    },
    //拒收按钮
    refuseClick(){
      this.$refs.dialogForm.validate(isvalidate => {
        if (!isvalidate) {
          return
        }else {
      refuseC(this.dialogForm).then(res => {
        const type = res.data.success ? "success" : "error"
        this.$message({
          message: '拒签成功!',
          type: type
        })
        this.dialogFormVisible=false
        this.onLoad(this.page)
      })
    }})},
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
    searchChange(params,done) {
      this.query = params;
      // console.log(this.receiverList)
      //   for(const user of this.receiverList) {
      //     if(params.receiver === user.realName){
      //       return user.id
      //     }
      //     console.log('ididididididididi',user.id)
      //   }return null
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
      getList(page.currentPage, page.pageSize, Object.assign(params, this.query={backeStatus: "1"})).then(res => {
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

