<template>
  <basic-container>
    <avue-crud :option="option"
               :table-loading="loading"
               :data="data"
               :page.sync="page"
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
      <template slot="priority" slot-scope="scope">
        <el-tag v-show="scope.row.give.priority === '1'" type="danger" :size="scope.size">{{scope.row.$priority}}</el-tag>
        <el-tag v-show="scope.row.give.priority === '4'" type="primary" :size="scope.size">{{scope.row.$priority}}</el-tag>
        <el-tag v-show="scope.row.give.priority === '3'" type="success" :size="scope.size">{{scope.row.$priority}}</el-tag>
        <el-tag v-show="scope.row.give.priority === '2'" type="warning" :size="scope.size">{{scope.row.$priority}}</el-tag>
      </template>
      <template slot-scope="{type,size,row}" slot="menu">
        <el-button :size="size" :type="type" @click="showBacke(row,true)">查看</el-button>
        <el-button :size="size" :type="type" @click="noClick(row)">办理</el-button>
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
    <el-dialog :visible.sync="dialogFormVisible" :modal="false" width="60%">
      <avue-form :option="dialogFormOption" v-model="dialogForm"  ref="dialogForm">
        <template slot-scope="scope" slot="returnAddress">
          <div @click="siteClick">
            <el-input placeholder="请选择位置" v-model="dialogForm['returnAddress']" readonly></el-input>
          </div>
        </template>
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
        <el-button type="primary" @click="handleClick" size="mini">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog
    :title="mapComponent.dialogTitle"
    :visible.sync="mapComponent.dialogMapVisible"
    width="80%"
    :modal="false"
    top="5vh"
  >
    <map-component @clickMap="clickMap">
    </map-component>

    <div slot="footer" class="dialog-footer">
      <el-button @click="mapComponent.dialogMapVisible = false">关闭</el-button>
    </div>
  </el-dialog>

  </basic-container>
</template>


<script>
import {getDetail, getList, repsubmit} from "@/api/workorder/returnvisit";
import {mapGetters} from "vuex";
import GiveForm from "@/views/workorder/form/giveForm";
import mapComponent from "@/components/map-component/mapComponent";
import projectUpload from "@/components/file-upload/project-upload";
import {add} from "@/api/workorder/returnvisit";

export default {
  components: {projectUpload, GiveForm,mapComponent},
  data() {
    //校验备注内容
    let commindRep = (rule, value, callback) => {
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
    //校验完成情况内容
    let finishRep = (rule, value, callback) => {
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
      mapComponent :{
        dialogMapVisible: false
      },
      form: {},
      linkType: 'replied',
      attachOnly: false,
      dialogForm:{
        giveId: '',
        id:''
      },
      projectId: undefined,
      projectAttachList: [],
      projectPosition: '',
      giveForm:{
        dialogTitle: '查看',
        dialogVisible: false,
        submitLoading: false,
        isReadOnly: false,
        data: {}
      },
      query: {
        returnStatus: "1"
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
        indexLabel:'序号',
        tip: false,
        searchShow: true,
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
            dicUrl: "/api/blade-user/userNameList",
            props: {
              label: "name",
              value: "id"
            },
            type:'select',
            hide: true,
            showColumn: false
          }]
      },
      dialogFormOption: {
        labelWidth: 100,
        emptyBtn: false,
        submitBtn: false,
        column: [
          {
          label: "评价",
          prop: "evaluate",
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=evaluate",
            props: {
              label: "dictValue",
              value: "dictKey"
            },
            rules:[{
              required: true,
              trigger:"change",
              message: "请选择评价"
            }],
          type: "select",
          span: 12
        },
          {
            label: "备注",
            prop: "comment",
            rules: [{
              validator: commindRep,
              trigger: 'change'
            }],
            span: 12
          },{
            label: "完成情况描述",
            prop: "finishDescribe",
            rules: [{
              validator: finishRep,
              trigger: 'change'
            }],
            span:12
          }, {
            label: "位置",
            prop: "returnAddress",
            type: "input",
            formslot: true,
            span:12
          }
          ]
      },
      data: []
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
  methods: {
    attach(attachList){
      this.projectAttachList = attachList
    },
    clickMap(mapData){
      this.dialogForm['longitude'] = mapData.lonLat || '' // => (mapData.lonLat === undefined) ? '' : mapData.lonLat
      this.dialogForm['returnAddress'] = mapData.position || ''
    },
    siteClick(){
      this.mapComponent.dialogMapVisible = true
    },
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
      this.dialogForm.giveId=row.giveId
      this.dialogFormVisible = true
    },
    //办理按钮
    handleClick(){
      this.$refs.dialogForm.validate(isvalidate => {
          if (!isvalidate) {
            return
          } else {
            const submitData = Object.assign({},this.dialogForm)
            submitData['projectAttachList'] = this.projectAttachList
            submitData['projectAttachList'] = submitData['projectAttachList'] || []
            submitData['projectAttachList'].forEach(attach => {
              attach['createTime'] = ''
              attach['linkType'] = this.linkType
            })
            repsubmit(submitData).then(res => {
              console.log('1111', submitData)
              const type = res.data.success ? "success" : "error"
                this.$message({
                  message: '提交成功!',
                  type: type
                })
                this.dialogFormVisible = false
                this.onLoad(this.page)
              this.$refs.dialogForm.allDisabled = false
              })
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
    searchReset() {
      this.query = {returnStatus: "1"};
      this.onLoad(this.page);
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
      getList(page.currentPage, page.pageSize, Object.assign(params, this.query = {returnStatus: "1"})).then(res => {
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

