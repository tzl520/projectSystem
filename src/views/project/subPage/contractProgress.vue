<template>
  <basic-container>
    <el-row>
      <avue-crud :data="data"
                 :option="option"
                 :page.sync="page"
                 :before-open="beforeOpenDialog"
                 v-model="form"
                 ref="crud"
                 @search-change="searchChange"
                 @search-reset="searchReset"
                 @selection-change="selectionChange"
                 @current-change="currentChange"
                 @size-change="sizeChange"
                 @row-update="rowUpdate"
                 @refresh-change="refreshChange"
                 @row-save="rowSave"
                 @on-load="onLoad">
        <template slot="menuLeft">
          <el-button type="danger"
                     size="mini"
                     icon="el-icon-delete"
                     plain
                     @click="handleDelete">删 除
          </el-button>
        </template>
        <template slot-scope="scope" slot="fileForm">
          <project-upload
            :project-id="projectId"
            :link-id="scope.row.id"
            :link-type="linkType"
            :attach-only.sync="attachOnly"
            :crud-height="240"
            :data.sync="projectAttachList"
            @uploadFileSuccess="uploadFileSuccess"
            @delFileSuccess="delFileSuccess"
            @empowerFile="empowerFile"
          ></project-upload>
        </template>
      </avue-crud>
    </el-row>
  </basic-container>
</template>

<script>
  import { getContractList } from '@/api/project/contract'
  import { getContractProgressPage,getDetail,add,update,remove} from "@/api/project/contractProgress";
  import projectUpload from "@/components/file-upload/project-upload";
  import {mapGetters} from "vuex";

  export default {
    components: {projectUpload},
    name: "ContractProgress",
    props: {
      projectId: {
        type: String,
        default: '0'
      },
      projectData: {
        type: Object,
        default: undefined
      },
      attachList:{
        type: Object,
        default: undefined
      }
    },
    data() {
      //校验输入内容
      let inputContentReg = (rule, value, callback) => {
        let regExp = /^[\\s，。、（）：；/:,;\u4e00-\u9fa5A-Za-z0-9]{0,}$/;
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
      // 校验数字框 方法规则
      const checkNumber = (rule, value, callback) => {
        setTimeout(() => {
          // 判断值是否为数字或小数
          if (!Number.isFinite(Number(value))) {
            callback(new Error('请输入数字值'))
          } else {
            callback()
          }
        }, 100)
      }
      return {
        test: '合同进度',
        loading:true,
        linkType: 'contractProgress',
        attachOnly: true,
        page:{
          pageSize: 10,
          currentPage: 1,
          total: 0
        },
        query: {
          projectId: ''
        },
        form: {
          projectId: '',
          contractId:'',
          contractCode:'',
        },
        projectAttachList: [],//附件集合
        selectionList:[],
        contractList:[],//合同列表
        data:[],
        option:{
          index: true,
          indexLabel:'序号',
          addTitle:'添加合同进度',
          selection: true,
          tip: false,
          align:'center',
          menuWidth:140,
          columnBtn:false,
          border:true,
          size: 'mini',
          delBtn:false,
          viewBtn:true,
          labelWidth:110,
          dialogTop:15,
          dialogWidth:'50%',
          dialogHeight:600,
          updateBtn: true,
          column:[
            {
              label: "合同名称",
              prop: "contractId",
              type: 'select',
              search: true,
              filterable:true,
              searchFilterable:true,
              dicData:[]
            },
            {
              label: "合同码",
              prop: "contractCode",
              searchFilterable:true,
              editDisabled:true,
              addDisabled:true,
              placeholder:'自动读取',
              span:12,
              row:true,
              hide:true,
              search: true,
            },
            {
              label:"进度日期",
              prop:"progressDate",
              searchFilterable:true,
              type: 'date',
              valueFormat: 'yyyy-MM-dd',
              format: 'yyyy-MM-dd',
              search: true
            },
            {
              label: "计划投资",
              prop: "planInvestment",
              rules: [
                {
                  required: true,
                  message: "请输入计划投资",
                  trigger: "blur"
                },
                {
                  validator: checkNumber,
                  trigger: "blur"
                }
              ],
              append: '万元',
            },
            {
              label:"计划形象进度",
              prop:"planImageProgress",
              type: 'textarea',
              overHidden:true,
              rules: [{
                validator:inputContentReg,
                trigger: "change",
              }],
              span:24
            },
            {
              label: "总结完成投资",
              prop: "summarizeCompleteInvestment",
              rules: [
                {
                  required: true,
                  message: "请输入完成投资",
                  trigger: "blur"
                },
                {
                  validator: checkNumber,
                  trigger: "blur"
                }
              ],
              append: '万元'
            },
            {
              label:"总结形象进度",
              prop:"summarizeImageProgress",
              type: 'textarea',
              overHidden:true,
              rules: [{
                validator:inputContentReg,
                trigger: "change",
              }],
              span:24
            },
            {
              label:'',
              prop: 'file',
              formslot:true,
              hide:true,
              labelWidth: 0,
              span:24
            }
          ]
        }
      }
    },
    watch:{
      'projectId': function (newVal, oldVal) {
        if (newVal !== oldVal) {
          this.onLoad(this.page)
          this.initData()
        }
      },
      'form.contractId': {
        handler(newVal, oldVal) {
          if (newVal !== undefined && newVal !== oldVal) {
            for (const tempData of this.contractList) {
              if (tempData.id === newVal) {
                this.form.contractCode = tempData.contractCode
              }
            }
          }
        },
        deep: true,
        immediate: true
      }
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
    mounted() {
      if (this.projectId === undefined || this.projectId.trim() === ''){
        this.projectId = this.$route.params.projectId
      }
      this.initData()
    },
    methods:{
      attach(attachList){
        this.projectAttachList = attachList
      },
      initData() {
        getContractList(this.projectId).then(res => {
          this.contractList = res.data.data
          const dicData = []
          this.contractList.forEach(contract => {
            dicData.push({ value: contract.id, label: contract.contractName })
          })
          this.option.column[0].dicData = dicData
        })
      },
      beforeOpenDialog(done,type) {
        console.log(type)
        // 表单打开前方法
        if (this.projectData !== undefined) {
          this.form['projectName'] = this.projectData['name']
          this.form['projectId'] = this.projectData['id']
          this.form['stage'] = this.projectData['stage']
          this.form['classification'] = this.projectData['classification']
          this.form['code'] = this.projectData['code']
        }
        if (["view"].includes(type)) {
          this.attachOnly = true
          getDetail(this.form.id).then(res => {
            this.form = res.data.data;
            this.form.planInvestment = Number(this.form.planInvestment) / 10000 / 100
            this.form.summarizeCompleteInvestment = Number(this.form.summarizeCompleteInvestment) / 10000 / 100
          });
        } else {
          this.attachOnly = false
        }
        if (["edit"].includes(type)) {
          getDetail(this.form.id).then(res => {
            this.form = res.data.data;
            this.form.planInvestment = Number(this.form.planInvestment) / 10000 / 100
            this.form.summarizeCompleteInvestment = Number(this.form.summarizeCompleteInvestment) / 10000 / 100
            const sysUserId = JSON.parse(localStorage.getItem('saber-userInfo')).content.user_id
            if( this.form.createUser !== sysUserId){
              this.option.updateBtn = false
              this.$message.error('您没有权限修改')
            }else{
              this.option.updateBtn = true
            }
          });
        }
        done()
      },
      rowUpdate(row, index, done, loading) {
        row['planInvestment'] = Number(row['planInvestment']) * 10000 * 100
        row['summarizeCompleteInvestment'] = Number(row['summarizeCompleteInvestment']) * 10000 * 100
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
      rowSave(row, done, loading) {
        row['projectId'] = this.projectId
        row['projectAttachList'] = this.projectAttachList
        row['projectAttachList'].forEach(attach => {
          attach['createTime'] = ''
          attach['linkType'] = this.linkType
        })
        row['planInvestment'] = Number(row['planInvestment']) * 10000 * 100
        row['summarizeCompleteInvestment'] = Number(row['summarizeCompleteInvestment']) * 10000 * 100
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
        this.query.projectId = this.projectId
        getContractProgressPage(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
          const data = res.data.data;
          this.page.total = data.total;
          this.data = data.records;
          for (const contract of this.data) {
            contract.planInvestment = Number(contract.planInvestment) / 10000 / 100
            contract.summarizeCompleteInvestment = Number(contract.summarizeCompleteInvestment) / 10000 / 100
          }
          console.log(this.data)
          this.loading = false;
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
  }
</script>

<style scoped>

</style>
