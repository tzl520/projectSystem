<template>
  <basic-container>
    <el-row>
      <avue-crud :data="data"
                 :option="inviteTendersOption"
                 :page.sync="page"
                 v-model="form"
                 ref="crud"
                 :before-open="beforeOpenDialog"
                 @search-change="searchChange"
                 @search-reset="searchReset"
                 @selection-change="selectionChange"
                 @current-change="currentChange"
                 @size-change="sizeChange"
                 @refresh-change="refreshChange"
                 @row-update="rowUpdate"
                 @row-save="rowSave"
                 @on-load="onLoad">
        <template slot-scope="scope" slot="fileForm">
          <project-upload
            :project-id="projectId"
            :link-id="scope.row.id"
            :link-type="linkType"
            :attach-only.sync="attachOnly"
            :crud-height="240"
            @uploadFileSuccess="uploadFileSuccess"
            @delFileSuccess="delFileSuccess"
            @empowerFile="empowerFile"
          ></project-upload>
        </template>
        <template slot="infoForm" slot-scope="scope">
          <avue-crud :option="infoOption"
                     v-model="peopleForm"
                     ref="peopleForm"
                     :data="biddingPeopleData"
                     :page.sync="pageDetail"
                     @row-update="biddingUpdate"
                     @row-del="biddingRemove"
                     @row-save="biddingSave"
                     @current-change="currentChangeBidding"
                     @size-change="sizeChangeBidding"
                     @refresh-change="reloadDetailPage">
          </avue-crud>
        </template>
        <template slot="menuLeft">
          <el-button type="danger"
                     size="mini"
                     plain
                     @click="handleDelete">删 除
          </el-button>
        </template>
      </avue-crud>
    </el-row>
  </basic-container>
</template>

<script>
  import {getList,getDetail,add,update,remove} from '@/api/project/bidding'
  import {getPeoplePage,addPeople,updatePeople,removePeople} from '@/api/project/biddingPeople'
  import {mapGetters} from "vuex";
  import projectUpload from "@/components/file-upload/project-upload";

export default {
  components: {projectUpload},
  name: "InviteTenders",
  props: {
    projectId: {
      type: String,
      default: '0',
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
    //校验联系电话
    const constReg= (rule, value, callback) =>{
      const phoneExp = /^((0\d{2,3}-\d{7,8})|(1[3584]\d{9}))$/;
      setTimeout(()=>{
        if(value !== undefined && value !==''){
          if ((!phoneExp.test(value)) && value !== '') {
            callback(new Error('请输入正确的格式！'));
          } else {
            callback();
          }
        }else{
          callback()
        }
      },100)
    }
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
      test:'招标管理',
      loading:true,
      page:{
        pageSize: 10,
        currentPage: 1,
        total: 0
      },
      pageDetail: {
        pageSize: 10,
        currentPage: 1,
        total: 0,
        layout: ' total, prev, pager, next'
      },
      attachOnly: false,
      queryDetail: {
        financialBidingId:''
      },
      query: {
        projectId: ''
      },
      form: {
        projectId: '',
        biddingPeopleList: []
      },
      linkType: 'inviteTenders',
      financialBidingId:'',
      peopleForm:{
        financialBidingId:'',
        bidder:'',
        bidderPrices:'',
        telephone:''
      },
      projectAttachList: [],//附件集合
      biddingPeopleData: [],//投标人集合
      data: [],
      inviteTendersOption:{
        updateBtn: true,
        index: true,
        indexLabel:'序号',
        addTitle:'添加招标内容',
        selection: true,
        tip: false,
        border:true,
        dialogDrag:true,
        dialogWidth:'50%',
        dialogHeight:600,
        dialogTop:15,
        labelWidth:100,
        columnBtn:false,
        align:'center',
        delBtn:false,
        menuWidth:140,
        size:'mini',
        viewBtn:true,
        column:[
          {
            label: "项目id",
            prop: "projectId",
            hide: true,
            addDisplay:false,
            viewDisplay:false,
            editDisplay:false
          },
          {
            label: "项目名称",
            prop: "projectName",
            readonly: true,
            addDisabled: true,
            editDisabled:true,
            hide: true
          },
          {
            label: "项目代码",
            prop: "code",
            readonly: true,
            hide: true,
            addDisabled: true,
            editDisabled:true
          },
          {
            label: "项目阶段",
            prop: "stage",
            type: "select",
            hide: true,
            addDisabled: true,
            editDisabled:true,
            rules: [{
              message: "请选择项目阶段",
              trigger: "change"
            }],
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=stage",
            props: {
              label: "dictValue",
              value: "dictKey"
            }
          },
          {
            label: "项目分类",
            prop: "classification",
            type: "select",
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=project_classification",
            props: {
              label: "dictValue",
              value: "dictKey"
            },
            filterable: true,
            hide: true,
            width: 80,
            addDisabled: true,
            editDisabled:true
          },
          {
            label:'招标名称',
            prop:'biddingName',
            rules: [{
              required: true,
              validator:inputContentReg,
              trigger: "change",
            }],
            search: true,
          },
          {
            label:'招标类型',
            prop:'biddingType',
            type: 'select',
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=bidding_type",
            props: {
              label: "dictValue",
              value: "dictKey"
            }
          },
          {
            label:'专业码',
            prop:'majorCode',
            rules: [{
              required: true,
              validator:inputContentReg,
              trigger: "change",
            }],
            search: true,
          },
          {
            label:'发包方式',
            prop:'contractMethod',
            search: true,
            type: 'select',
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=contract_method",
            props: {
              label: "dictValue",
              value: "dictKey"
            },
          },
          {
            label:'招标时间',
            prop:'releaseDate',
            type: "date",
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd'
          },
          {
            label:'开标时间',
            prop:'tenderOpenDate',
            type: "date",
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd'
          },
          {
            label:'中标时间',
            prop:'contractorDate',
            type: "date",
            valueFormat: 'yyyy-MM-dd',
            format: 'yyyy-MM-dd'
          },
          {
            label:'发包方',
            prop:'employer',
            rules: [{
              required: true,
              validator:inputContentReg,
              trigger: "change",
            }],
            search: true,
          },
          {
            label: '中标方',
            prop: 'contractor',
            rules: [{
              required: true,
              validator:inputContentReg,
              trigger: "change",
            }],
            hide:true
          },
          {
            label: '',
            labelWidth:10,
            prop: 'divider',
            component: 'elDivider',//ele分割线
            hide:true,
            span:24,
            addDisplay: false
          },
          {
            label:'招标标底',
            prop:'baseBidPrice',
            search: true,
            rules: [
              {
                required: true,
                message: "招标标底只能是数字",
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
            label: '中标价',
            prop: 'bidPrice',
            rules: [
              {
                required: true,
                message: "请输入合同价",
                trigger: "blur"
              },
              {
                validator: checkNumber,
                trigger: "blur"
              }
            ],
            append: '万元',
            hide:true
          },
          {
            label: '差额',
            prop: 'priceDifference',
            editDisplay:false,
            addDisplay: false,
            append: '万元',
            hide:true
          },
          {
            label: '中标方联系人',
            prop: 'contractorContacts',
            rules: [{
              required: true,
              validator:inputContentReg,
              trigger: "change",
            }],
            labelWidth: 110,
            hide:true
          },
          {
            label: '联系电话',
            prop: 'contractorPhone',
            rules: [{
              required: true,
              validator:constReg,
              trigger: "change",
            }],
            hide:true
          },
          {
            label: '',
            labelWidth:10,
            prop: 'divider',
            component: 'elDivider',//ele分割线
            params: {
              html: '<p style="font-size: 18px">投标人</p>',
              contentPosition: "left",
            },
            hide:true,
            span:24,
            editDisplay: false,
            addDisplay: false
          },
          {
            labelWidth:0,
            label: '',
            prop: 'info',
            span:24,
            hide:true,
            formslot:true,
          },
          {
            label:'',
            prop: 'file',
            formslot:true,
            labelWidth: 0,
            hide:true,
            span:24,
          }
        ]
      },
      infoOption:{
        addBtn:false,
        editBtn:false,
        addRowBtn:true,
        addBtnText:'添加投标人',
        cellBtn:true,
        viewDisabled:true,
        border:true,
        column: [
          {
            label: '添加投标人',
            prop: 'biddingPeopleList',
            addDisplay:false,
            addDisabled:true,
            hide:true,
          },
          {
            label: '投标方',
            prop: 'bidder',
            rules: [{
              required: true,
              validator:inputContentReg,
              trigger: "change",
            }],
            cell:true
          },
          {
            label: '投标价',
            prop: 'bidderPrices',
            rules: [
              {
                message: "请输入数字",
                trigger: "blur"
              },
              {
                validator: checkNumber,
                trigger: "blur"
              }
            ],
            append: '万元',
            cell:true
          },
          {
            label: '联系电话',
            prop: 'telephone',
            rules: [{
              required: true,
              validator:constReg,
              trigger: "change",
            }],
            cell:true
          }
        ]
      }
    }
  },
  watch:{
    'projectId': function (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.onLoad(this.page)
      }
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
  },
  methods:{
    attach(attachList){
      this.projectAttachList = attachList
    },
    biddingSave(row, done, loading) {
     row['financialBidingId'] = this.form.id
      addPeople(row).then(() => {
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
    biddingUpdate(row, index, done, loading){
      if (row.isTrusted === undefined){
        updatePeople(row).then(() => {
          this.biddingOnload(this.pageDetail);
          this.$message({
            type: "success",
            message: "操作成功!"
          });
          done();
        }, error => {
          loading();
          console.log(error);
        });
      }else {
        row['financialBidingId'] = this.form.id
        addPeople(row).then(() => {
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
      }
    },
    biddingRemove(row) {
      this.$confirm("确定将选择数据删除?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          return removePeople(row.id);
        })
        .then(() => {
          this.$message({
            type: "success",
            message: "操作成功!"
          });
          this.biddingOnload(this.pageDetail);
        });
    },
    currentChangeBidding(currentPage){
      this.pageDetail.currentPage = currentPage;
    },
    sizeChangeBidding(pageSize){
      this.pageDetail.pageSize = pageSize;
    },
    refreshBidding() {
      this.biddingOnload(this.pageDetail, this.queryDetail);
    },
    //投标人加载
    biddingOnload(pageDetail, params = {}) {
      this.loading = true;
      this.queryDetail.financialBidingId = this.form.id
      getPeoplePage(pageDetail.currentPage, pageDetail.pageSize, Object.assign(params, this.queryDetail)).then(res => {
        const data = res.data.data;
        this.pageDetail.total = data.total;
        this.biddingPeopleData = data.records;
        this.loading = false;
      });
    },
    reloadDetailPage(){
      this.biddingOnload(this.pageDetail)
    },
    beforeOpenDialog(done,type) {
      // 表单打开前方法
      if (this.projectData !== undefined) {
        this.form['projectName'] = this.projectData['name']
        this.form['projectId'] = this.projectData['id']
        this.form['stage'] = this.projectData['stage']
        this.form['classification'] = this.projectData['classification']
        this.form['code'] = this.projectData['code']
      }
      this.infoOption.menu = false
      this.infoOption.columnBtn = false
      this.infoOption.header=true
      if (["view"].includes(type)) {
        // this.infoOption.addRowBtn = false
        this.attachOnly = true
        this.infoOption.header=false
        getDetail(this.form.id).then(res => {
          this.form = res.data.data;
          console.log(this.form)
          this.form.projectFinancialBidding['baseBidPrice'] = Number(this.form.projectFinancialBidding['baseBidPrice']) / 10000 / 100
          this.form.projectFinancialBidding['bidPrice'] = Number(this.form.projectFinancialBidding['bidPrice']) / 10000 / 100
          this.onLoad(this.page)
        });
        this.queryDetail.financialBidingId = this.form.id
        getPeoplePage(this.pageDetail.currentPage, this.pageDetail.pageSize, Object.assign({}, this.queryDetail)).then(res => {
          const data = res.data.data;
          this.pageDetail.total = data.total;
          this.biddingPeopleData = data.records;
        });
      }
      if (["edit"].includes(type)) {
        this.attachOnly = false
        this.infoOption.menu = true
        this.infoOption.refreshBtn = true
        getDetail(this.form.id).then(res => {
          this.form = res.data.data;
          this.form.projectFinancialBidding['baseBidPrice'] = Number(this.form.projectFinancialBidding['baseBidPrice']) / 10000 / 100
          this.form.projectFinancialBidding['bidPrice'] = Number(this.form.projectFinancialBidding['bidPrice']) / 10000 / 100
          const sysUserId = JSON.parse(localStorage.getItem('saber-userInfo')).content.user_id
          this.userIdList = this.form
          console.log(this.userIdList)
          if(this.userIdList.createUser !== sysUserId){
            this.$message.error('您没有权限修改')
            this.inviteTendersOption.updateBtn = false
          }else{
            this.inviteTendersOption.updateBtn = true
            console.log('成功匹配')
          }
          this.onLoad(this.page)
        });
        this.biddingOnload(this.pageDetail)
      }
      if (["add"].includes(type)) {
        this.pageDetail.total = 0;
        this.biddingPeopleData = [];
      }
      done()
    },
    rowUpdate(row, index, done, loading) {
      row['baseBidPrice'] = Number(row['baseBidPrice']) * 10000 * 100
      row['bidPrice'] = Number(row['bidPrice']) * 10000 * 100
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
          console.log(this.ids)
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
      //添加附件集合
      row['baseBidPrice'] = Number(row['baseBidPrice']) * 10000 * 100
      row['bidPrice'] = Number(row['bidPrice']) * 10000 * 100
      row['projectAttachList'] = this.projectAttachList
      row['projectAttachList'].forEach(attach => {
        attach['createTime'] = ''
        attach['linkType'] = this.linkType
      })
      //添加投标人集合
      row['biddingPeopleList'] = this.biddingPeopleData
      row['projectId'] = this.projectId
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
      console.log(page)
      getList(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
        const data = res.data.data;
        console.log(data)
        this.page.total = data.total;
        this.data = data.records;
        for(const money of this.data){
          money['baseBidPrice'] = Number(money['baseBidPrice']) / 10000 / 100
          money['bidPrice'] = Number(money['bidPrice']) / 10000 / 100
        }
        this.loading = false;
      });
    },
    empowerFile(data) {
      const index = data.index
      if (index >= 0 && this.projectAttachList.length > index) {
        this.projectAttachList[index]['accessPermissions'] = data.accessPermissions
        this.projectAttachList[index]['permissionsPerson'] = data.permissionsPerson
      }
    },
    uploadFileSuccess(data) {
      this.projectAttachList.push(data)
    },
    delFileSuccess(index) {
      if (this.projectAttachList.length > index) {
        this.projectAttachList.splice(index,1)
      }
    },
  }
}
</script>

<style scoped>

</style>
