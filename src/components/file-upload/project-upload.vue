<template>
  <basic-container>
    <avue-crud :option="option"
               :data="data"
               v-model="form"
               ref="crud"
               @refresh-change="refreshChange"
               @on-load="onLoad">
      <template slot-scope="{type,size,row,index}" slot="menu">
        <el-button :size="size" :type="type" @click="viewFile(row)">预览</el-button>
        <el-button :size="size" :type="type" :disabled="attachOnly" @click="handleEmpower(row,index)">授权</el-button>
        <el-button :size="size" :type="type" :disabled="attachOnly" @click="rowDel(row,index)">删除</el-button>
      </template>
      <template slot="menuLeft">
        <el-upload
          class="upload-demo"
          ref="upload"
          :headers="uploadHeader"
          :data="uploadData"
          action="/api/project-manager/projectattach/put-file-attach"
          :file-list="fileList"
          :on-success="handleSuccess"
          :before-upload="beforeUpload"
          multiple
          :show-file-list="false">
          <el-button type="primary" size="mini" slot="trigger" v-if="!attachOnly">附件上传</el-button>
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
      <el-form ref="formEmpower" :model="formEmpower" label-width="80px">
        <el-form-item label="授权范围">
          <el-radio-group v-model="formEmpower.accessPermissions">
            <el-radio v-for="item in attachScopeList" :key="item.id" :label="item.dictKey">{{item.dictValue}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="授权人">
          <el-select
            v-model="formEmpower.permissionsPersonList"
            filterable
            multiple
            placeholder="请选择授权人"
            style="width: 100%"
          >
            <el-option
              v-for="item in empowerList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeEmpowerDialog">取 消</el-button>
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
      <div style="height:calc(100vh - 60px)">
        <iframe style="margin:0;padding:0;height:90%;width:100%;right:0px;"
                :src="src"></iframe>
      </div>
    </el-dialog>
    </basic-container>
</template>

<script>
    import {getProjectAttachList, remove, down, getNameList,authorize,attachScope} from "@/api/project/projectattach";
    import {mapGetters} from "vuex";
    import {Base64} from 'js-base64';
    export default {
        name: "projectUpload",
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
            default: '0'
          },
          attachOnly: { // 查看时关闭附件按钮
            type: Boolean,
            default: false
          },
          crudHeight: {
            type: String,
            default: 'auto'
          },
          randomNumber: {
            type: Number,
            default: 0
          }
        },
      data() {
        return {
          data: [],
          form: {},
          src: '',
          formEmpower:{
            id: '',
            attachId: '',
            index: -1,
            permissionsPerson: '',
            permissionsPersonList: [],
            accessPermissions: ''
          },
          herf: '',
          viewId: '',
          optionUnloadForm:{},
          loading: true,
          uploadHeader:{
            Authorization: "Basic c2FiZXI6c2FiZXJfc2VjcmV0",
            'Blade-Auth': ""
          },
          uploadData: {
            projectId: '',
            linkId: '',
            linkType: ''
          },
          dialogVisible: false,
          dialogEmpower: false,
          selectionList: [],
          empowerList: [],
          attachScopeList: [],
          fileList: [],
          attachList: [],
          fileUrl: '',//预览的地址
          option: {
            addBtn: false,
            viewBtn: false,
            editBtn: false,
            delBtn: false,
            columnBtn: false,
            refreshBtn: false,
            emptyBtn:false,//清空按钮
            selectClearBtn: false,
            height: this.crudHeight,
            border: true,
            align: 'center',
            size: 'mini',
            menuWidth: 170,
            column: [
              {
                label: '附件类型',
                prop: 'extension'
              },
              {
                label: '附件名称',
                prop: 'originalName'
              },
              {
                label: "上传时间",
                prop: "createTime",
                type: "date",
                format: "yyyy-MM-dd",
                valueFormat: "yyyy-MM-dd"
              },
              {
                label: '上传人',
                prop: 'username',
                width: 120
              },
            ]
          }
        };
      },
      computed: {
        ...mapGetters(["token","userInfo"])
      },
      watch: {
        linkId(){
          this.onLoad()
        },
        projectId(){
          this.onLoad()
        },
        linkType(){
          this.onLoad()
        },
        randomNumber() {
          this.onLoad()
        },
        fileUrl(val) {
          if (val !== undefined && val !=='') {
            this.src = 'http://218.75.241.210:8012/onlinePreview?url=' + encodeURIComponent(Base64.encode(val))
          }
        }
      },
      mounted() {
        getNameList().then(res =>{
          this.empowerList = res.data.data;
        })
        attachScope().then(res =>{
          this.attachScopeList = res.data.data;
        })
      },
      methods: {
        encodeUrl(url) {
          return encodeURIComponent(Base64.encode(url))
        },
        handleEmpower(row,index){
          this.formEmpower.permissionsPerson = ''
          this.formEmpower = Object.assign(this.formEmpower,row)
          this.formEmpower.permissionsPersonList = (this.formEmpower.permissionsPerson === '') ? [] : this.formEmpower.permissionsPerson.split(',')
          this.formEmpower.index = index
          this.dialogEmpower = true
        },
        handleSuccess(response){
          if (response.code == 200){
            this.$message({
              message: response.msg,
              type: 'success'
            });
            if (this.projectId === '0' || this.linkId === '0') {
              const date = new Date()
              const createTime = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
              const data = Object.assign({ createTime,username: this.userInfo.nick_name },response.data)
              const names = (data.originalName || '').split('.')
              data['extension'] = (names.length > 0) ? names[(names.length - 1)] : '未知'
              this.data.push(data)
              this.$emit('uploadFileSuccess',data)
            } else {
              this.onLoad()
            }
          } else {
            this.$message({
              message: response.msg,
              type: 'error'
            });
          }

        },
        beforeUpload() {
          // 附件上传前回调
          this.uploadHeader['Blade-Auth'] = 'bearer ' + this.token
          this.uploadData.projectId = this.projectId
          this.uploadData.linkId = this.linkId
          this.uploadData.linkType = this.linkType
          return true
        },
        submitEmpower(){
          this.formEmpower.permissionsPerson = this.formEmpower.permissionsPersonList.join(',')
          if (this.formEmpower.id === '0' || this.formEmpower.id === '') {
            this.$message({
              message: '操作成功！',
              type: 'success'
            });
            this.$emit('empowerFile',this.formEmpower)
            this.closeEmpowerDialog()
          } else {
            authorize(this.formEmpower.id,this.formEmpower.permissionsPerson,this.formEmpower.accessPermissions).then(res =>{
              this.$message({
                message: res.data.msg,
                type: (res.data.code === 200) ? 'success' : 'error'
              });
              this.closeEmpowerDialog()
            })
          }

        },
        viewFile(row){
          console.log(row)

          if (row.link === undefined || row.link === '') {

            down(row.id).then(res =>{
              if (res.data.success) {
                this.fileUrl = res.data.data
                this.dialogVisible = true
              } else {
                this.$message({
                  type: "error",
                  message: res.data.msg
                });
              }
            })

          } else {
            this.fileUrl = row.link
            this.dialogVisible = true
          }

        },
        rowDel(row,index) {
          this.$confirm("确定将选择数据删除?", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
            .then(() => {
              return remove(row.attachId);
            })
            .then((res) => {
              if (this.projectId === '0' || this.linkId === '0') {
                this.$emit('delFileSuccess',index)
                if (this.data.length > index) {
                  this.data.splice(index,1)
                }
              } else {
                this.onLoad()
              }
              this.$message({
                type: res.data.success ? 'success' : 'error',
                message: res.data.msg
              });
            });
        },
        refreshChange() {
          this.onLoad();
        },
        onLoad() {
          console.log(this.projectId,this.linkType,this.linkId)
          if (this.projectId !== '0' && this.linkId !== '0') {
            this.loading = true;
            const params = {
              projectId: this.projectId,
              linkId: this.linkId,
              linkType: this.linkType
            }
            getProjectAttachList(params).then(res => {
              this.data = res.data.data
              this.loading = false
            })
          }
        },
        closeEmpowerDialog() {
          this.dialogEmpower = false
        }
      }
    }
</script>

<style scoped>

</style>
