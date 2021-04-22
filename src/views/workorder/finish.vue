<template>
  <basic-container>
<!--  这是在办工单  -->
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
<!--      <template slot-scope="{type,size,row}" slot="implementPeople">-->
<!--        <el-input type="text"></el-input>-->
<!--      </template>-->

      <template slot-scope="{type,size,row}" slot="menu">
        <el-button icon="el-icon-view" :size="size" :type="type" @click="showMore(row,true)">查看</el-button>
        <el-button icon="el-icon-check" :size="size" :type="type" @click="finishOkDialog(row)">完工</el-button>
      </template>

    </avue-crud>
    <el-dialog :visible.sync="dialogFormVisible" :modal="false" width="60%">
    <avue-form :option="dialogFormOption" v-model="dialogForm"  ref="dialogForm">
    </avue-form>
        <project-upload
          :project-id="projectId"
          :link-id="dialogForm.id"
          :link-type="linkType"
          :attach-only.sync="attachOnly"
          :crud-height="240"
          :data.sync="projectAttachList"
          @uploadFileSuccess="uploadFileSuccess"
          @delFileSuccess="delFileSuccess"
          @empowerFile="empowerFile"
        ></project-upload>
      <div slot="footer" class="dialog-footer" align="center">
      <el-button @click="dialogFormVisible = false" size="mini">取 消</el-button>
      <el-button type="primary" @click="finishOk" size="mini">确 定</el-button>
    </div>
  </el-dialog>
    <el-dialog
      :visible.sync="giveForm.dialogVisible"
      :title="giveForm.dialogTitle"
      width="60%"
      :modal="false"
    >
      <give-form :submit-loading.sync="giveForm.submitLoading" :give-form-data="giveForm.data" :is-read-only="giveForm.isReadOnly" @close="giveForm.dialogVisible = false"></give-form>
    </el-dialog>
  </basic-container>
</template>


<script>
import {mapGetters} from "vuex";
import {getList,remove,getDetailFinish,update,add} from "@/api/workorder/finish";
import {finishSub} from "@/api/workorder/finish";
import projectUpload from "@/components/file-upload/project-upload";
import GiveForm from "@/views/workorder/form/giveForm";

export default {
  components: {projectUpload,GiveForm},
  data() {
    // 校验结束日期必须在开始日期之后 方法规则
    const checkCompletionDate = (rule, value, callback) => {
      setTimeout(() => {
        // 只有当结束日期选择了之后才进行校验
        if (value !== undefined && value !== '') {
          // 获取开始日期
          const { practicalTime } = this.dialogForm
          // 判断是否已经选择了开始日期，没有则提示请先选择开始日期
          if (practicalTime !== undefined && practicalTime !== '') {
            const begin = new Date(practicalTime);
            const end = new Date(value);
            if (end - begin <= 0) {
              callback(new Error('结束日期必须在开始日期之后'))
            } else {
              callback()
            }
          } else {
            callback(new Error('请先选择开始日期'))
          }
        } else {
          callback()
        }
      }, 100)
    }
    return {
      linkType: 'finish',
      attachOnly: false,
      form: {},
      query: {
        backeStatus: "2"
      },
      giveForm:{
        dialogTitle: '查看',
        dialogVisible: false,
        submitLoading: false,
        isReadOnly: false,
        data: {}
      },
      projectAttachList: [],
      loading: true,
      dialogForm: {
        backeId:'',
        giveId: '',
        id: ''
      },
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
        indexLabel:'序号',
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
        editBtn: false,
        viewBtn: false,
        selection: true,
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
            hide: true,
            type:'select',
            dicUrl: "/api/blade-user/userNameList",
            props: {
              label: "name",
              value: "id"
            },
            showColumn: false
          }]
      },
      userList:[],
      dialogFormOption: {
        emptyBtn: false,
        submitBtn: false,
        column: [
          {
            label: "完成编号",
            prop: "finishNumber",
            rules:[{
              required: true,
              trigger: "change",
              message: '请填写编号'
            }],
            span:12,
          },
          {
            label: "实施人员",
            prop: "implementPeople",
            // dicUrl: "/api/blade-user/userNameList",
            // props: {
            //   label: "name",
            //   value: "id"
            // },
            // type: "select",
            // slot: true,
            disabled:true,
            placeholder: '自动读取当前用户',
            span:12
          },
          {
            label: "开始时间",
            prop: "practicalTime",
            type: "date",
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd',
            rules:[{
              required: true,
              message: '请选择开始时间',
              trigger:'change'
            }],
            span:12
          },{
            label: "结束时间",
            prop: "submitTime",
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd',
            rules:[{
              required: true,
              trigger:'change',
              validator: checkCompletionDate,
            }],
            type: "date",
            span:12
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
  // mounted() {
  //   const sysUserId = JSON.parse(localStorage.getItem('saber-userInfo')).content.user_id
  //   getUserNameList().then(res=>{
  //     this.userList = res.data.data
  //     for(const user of this.userList){
  //       if(sysUserId === user.id){
  //         this.dialogFormOption.implementPeople = user.name
  //         console.log(this.dialogFormOption.implementPeople)
  //       }
  //     }
  //   })
  // },
  methods: {
    // 这是附件的
    attach(attachList){
      this.projectAttachList = attachList
    },
    showMore(row,readonly = true){
      this.giveForm.isReadOnly=readonly
      this.giveForm.dialogVisible=true
      this.giveForm.dialogTitle="查看"
      // 浅拷贝
      this.giveForm.data = Object.assign({}, row.give || {})
    },
    finishOkDialog(row){
      if (this.$refs.dialogForm !== undefined) {
        this.$refs.dialogForm.resetForm()
        this.$refs.dialogForm.clearValidate()
      }
      this.dialogFormVisible = true
      this.dialogForm.giveId=row.giveId
      this.dialogForm.backeId=row.id
    },
    //这是确认完工的按钮
    finishOk() {
      this.$refs.dialogForm.validate(isvalidate => {
        if (!isvalidate) {
          console.log('验证不通过')
          return
        }else {
          const sysUserId = JSON.parse(localStorage.getItem('saber-userInfo')).content.user_id
          const submitData = Object.assign({},this.dialogForm)
          submitData['projectAttachList'] = this.projectAttachList
          submitData['implementPeople'] = sysUserId
          finishSub(submitData).then(res => {
          const type = res.data.success ? "success" : "error"
          this.$message({
            message: '操作成功!',
            type: type
          })
          this.onLoad(this.page)
            this.$refs.dialogForm.allDisabled = false
          this.dialogFormVisible = false
          this.$refs.dialogForm.resetForm()
        })
        }})
    },
    rowSave(row, done, loading) {
      row['projectId'] = this.projectId
      row['projectAttachList'] = this.projectAttachList
      row['projectAttachList'].forEach(attach => {
        attach['createTime'] = ''
        attach['linkType'] = this.linkType
      })
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
        getDetailFinish(this.form.id).then(res => {
          this.form = res.data.data;
        });
      }
      done();
    },
    searchReset() {
      this.query = { backeStatus: "2"};
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
      getList(page.currentPage, page.pageSize, Object.assign(params, this.query={backeStatus: "2"})).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        this.data = data.records;
        this.loading = false;
        this.selectionClear();
      });
    },
    uploadFileSuccess(data) {
      this.projectAttachList.push(data)
    },
    delFileSuccess(index) {
      if (this.projectAttachList.length > index) {
        this.projectAttachList.splice(index,1)
      }
    },
    empowerFile(data) {
      const index = data.index
      if (index >= 0 && this.projectAttachList.length > index) {
        this.projectAttachList[index]['accessPermissions'] = data.accessPermissions
        this.projectAttachList[index]['permissionsPerson'] = data.permissionsPerson
      }
    }
  }
};
</script>

<style>
</style>

