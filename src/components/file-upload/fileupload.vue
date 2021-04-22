<template>
  <div>
    <avue-crud :option="option"
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
      <template slot-scope="{type,size,row}" slot="menu">
        <el-button icon="el-icon-view" :size="size" :type="type" @click="viewFile(row)">预览</el-button>
<!--        <el-button icon="el-icon-check" :size="size" :type="type" @click="handleEmpower">预览</el-button>-->
        <el-button icon="el-icon-delete" :size="size" :type="type" @click="rowDel(row)">删除自定义</el-button>
      </template>
      <template slot="menuLeft">
        <el-upload
          class="upload-demo"
          ref="upload"
          :headers="uploadHeader"
          action="/api/blade-resource/oss/endpoint/put-file-attach"
          :file-list="fileList"
          :on-success="handleSuccess"
          :before-upload = "beforeUpload"
          multiple
          :show-file-list = "false">
          <el-button type="primary" size="mini" slot="trigger" >附件上传</el-button>
        </el-upload>

      </template>
    </avue-crud>
    <el-dialog
      title="授权"
      append-to-body
      :visible.sync="dialogEmpower"
      :close-on-click-modal="false"
      width="40%"
      top="5vh"
      center
      @close="closeEmpowerDialog">
      <div>
        <el-select
          v-model="formEmpower.permissionsPerson"
          filterable
          default-first-option
          placeholder="请选择授权人">
          <el-option
            v-for="item in empowerList"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="quet()">取 消</el-button>
        <el-button type="primary" @click="submitEmpower">提 交</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="预览"
      append-to-body
      :visible.sync="dialogVisible"
      width="100%"
      fullscreen
      @close="closeDialogVisible">
      <div style="height:700px">
        <iframe style="margin:0;padding:0;height:90%;width:100%;right:0px;border:solid 0px #ff0000;"
                :src="'http://218.75.241.210:8012' +`/onlinePreview?url=`+encodeURIComponent(fileUrl)"></iframe>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  import {getList, getDetail, add, update, remove, getNameList, down } from "@/api/project/projectattach";
  import {mapGetters} from "vuex";

  export default {
    name: "fileupload",
    props: {
      projectId: {
        type: String,
        default: '0'
      },
      linkId:{
        type: String,
        default: '0'
      },
      linkType:{
        type: String,
        default: 'workOrder'
      },
      attachOnly: { // 查看时关闭附件按钮
        type: Boolean,
        default: false
      },
    },
    data() {
      return {
        form: {
          extension: ''
        },
        query:{
          linkType: "workOrder"
        },
        formEmpower:{
          permissionsPerson: ''
        },
        loading: true,
        page: {
          pageSize: 10,
          currentPage: 1,
          total: 0
        },
        uploadHeader:{
          Authorization: "Basic c2FiZXI6c2FiZXJfc2VjcmV0",
          'Blade-Auth': ""
        },
        dialogVisible: false,
        dialogEmpower: false,
        selectionList: [],
        empowerList: [],
        fileList: [],
        attachList: [],
        attachData: [],
        fileUrl: '',//预览的地址
        option: {
          height: 150,
          addBtn: false,
          viewBtn: false,
          editBtn: false,
          delBtn: false,
          columnBtn: false,
          refreshBtn: false,
          menuWidth:140,
          emptyBtn:false,//清空按钮
          selectClearBtn: false,
          border: true,
          align: 'center',
          column: [
            {
              label: '附件类型',
              prop: 'linkType'
            },
            {
              label: '附件名称',
              prop: 'originalName'
            },
            {
              label: "创建时间",
              prop: "createTime",
              type: "date",
              format: "yyyy-MM-dd hh:mm:ss",
              valueFormat: "yyyy-MM-dd hh:mm:ss",
            },
            {
              label: '创建人',
              prop: 'createUser',
              type: 'select',
              dicUrl: "/api/project-manager/project/common/userNameList",
              props: {
                label: "name",
                value: "id"
              },
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
          addBtn: this.vaildData(this.permission.projectattach_add, false),
          viewBtn: this.vaildData(this.permission.projectattach_view, false),
          delBtn: this.vaildData(this.permission.projectattach_delete, false),
          editBtn: this.vaildData(this.permission.projectattach_edit, false)
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
    mounted() {
      this.uploadHeader['Blade-Auth'] = 'bearer ' + JSON.parse(localStorage.getItem('saber-userInfo')).content.access_token
    },
    watch:{
      linkId: function(newVal){
        this.linkId = newVal
        this.query.linkId = newVal
        console.log("linkId",this.query.linkId)
      },
      projectId: function(newVal){
        this.projectId = newVal
        this.query.projectId = newVal
        console.log("projectId",this.query.projectId)
      },
      attachOnly: function(newVal){
        console.log(newVal)
      }
    },
    methods: {
      handleEmpower(){
        this.dialogEmpower = true
        getNameList().then(res =>{
          this.empowerList = res.data.data;
        })
      },
      handleSuccess(response){
        const  data = response.data
        this.attachList.push({attachId:data.attachId,linkType: this.linkType})
        if (this.linkId == 0) this.data.push(data)
        if (response.code == 200){
            this.$message({
              message: '恭喜你，上传文件成功',
              type: 'success'
            });
            this.onLoad(this.page)
        }
        if (this.$refs.upload !== undefined){
          const attachData = this.attachList
          this.$emit('attach', attachData)
        }
      },
      beforeUpload(){
        this.uploadHeader['Blade-Auth'] = 'bearer ' + JSON.parse(localStorage.getItem('saber-userInfo')).content.access_token
      },
      viewFile(row){
        down(row.id).then(res =>{
          this.fileUrl = res.data
        })
        this.dialogVisible = true
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
            return remove(row.attachId);
          })
          .then(() => {
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
        if (this.linkId == this.query.linkId)
        console.log(this.query)
        getList(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
          console.log(this.query)
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

<style scoped>

</style>
