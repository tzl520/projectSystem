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
  import {getPaymentStatusPage,getDetail,add,update,remove} from "@/api/project/paymentStatus";
  import projectUpload from "@/components/file-upload/project-upload";
  import {mapGetters} from "vuex";

  export default {
    components:{projectUpload},
    name: "contractPaymentStatus",
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
        test: '合同支付情况',
        loading:true,
        linkType: 'contractPaymentStatus',
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
          addTitle:'添加支付情况',
          selection: true,
          tip: false,
          menuWidth:140,
          columnBtn:false,
          border:true,
          size: 'mini',
          align:'center',
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
              editDisabled:true,
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
              hide:true,
            },
            {
              label: "支付人",
              prop: "paymentPerson",
              rules: [{
                required: true,
                validator:inputContentReg,
                trigger: "change",
              }],
              search: true
            },
            {
              label: "支付方式",
              prop: "paymentMode",
              rules: [{
                required: true,
                validator:inputContentReg,
                trigger: "change",
              }],
              search: true
            },
            {
              label: "支付金额",
              prop: "paymentMoney",
              rules: [
                {
                  required: true,
                  message: "请输入支付金额",
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
              label: "未支付金额",
              prop: "unpaidMoney",
              rules: [
                {
                  required: true,
                  message: "请输入未支付金额",
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
              label:"支付时间",
              prop:"paymentDate",
              searchFilterable:true,
              type: 'date',
              valueFormat: 'yyyy-MM-dd',
              format: 'yyyy-MM-dd',
              search: true
            },
            {
              label:"支付事项",
              prop:"paymentMatters",
              type: 'textarea',
              overHidden:true,
              rules: [{
                validator:inputContentReg,
                trigger: "change",
              }],
              span: 24
            },
            {
              label: "疑难问题",
              prop: "problem",
              type: 'textarea',
              overHidden:true,
              rules: [{
                validator:inputContentReg,
                trigger: "change",
              }],
              span: 24
            },
            {
              label:'',
              prop: 'file',
              formslot:true,
              labelWidth: 0,
              hide:true,
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
          // console.log("=============",this.biddingList)
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
            this.form.paymentMoney = Number(this.form.paymentMoney) / 10000 / 100
            this.form.unpaidMoney = Number(this.form.unpaidMoney) / 10000 / 100
          });
        } else {
          this.attachOnly = false
        }
        if (["edit"].includes(type)) {
          getDetail(this.form.id).then(res => {
            this.form = res.data.data;
            this.form.paymentMoney = Number(this.form.paymentMoney) / 10000 / 100
            this.form.unpaidMoney = Number(this.form.unpaidMoney) / 10000 / 100
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
        row['paymentMoney'] = Number(row['paymentMoney']) * 10000 * 100
        row['unpaidMoney'] = Number(row['unpaidMoney']) * 10000 * 100
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
        row['paymentMoney'] = Number(row['paymentMoney']) * 10000 * 100
        row['unpaidMoney'] = Number(row['unpaidMoney']) * 10000 * 100
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
        getPaymentStatusPage(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
          const data = res.data.data;
          this.page.total = data.total;
          this.data = data.records;
          for (const contract of this.data) {
            contract.paymentMoney = Number(contract.paymentMoney) / 10000 / 100
            contract.unpaidMoney = Number(contract.unpaidMoney) / 10000 / 100
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
