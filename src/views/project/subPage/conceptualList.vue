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
        <template slot="projectFinancialEvaluationsForm" slot-scope="scope">
          <avue-crud :option="foOption" :data="form.projectFinancialEvaluations">
          </avue-crud>
        </template>
        <template slot="projectProgrammeExpertReviewsForm" slot-scope="scope">
          <avue-crud :option="infoOption" :data="form.projectProgrammeExpertReviews">
          </avue-crud>
        </template>
        <template slot="projectFinancialAppraisalCostsForm" slot-scope="scope">
          <avue-crud :option="costOption" :data="form.projectFinancialAppraisalCosts">
          </avue-crud>
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
  import {getConceptualPage,getProgrammeDetail,add,update,remove} from '@/api/project/conceptual'
  import projectUpload from "@/components/file-upload/project-upload";
  import {mapGetters} from "vuex";

  export default {
    components: { projectUpload},
    test:'方案设计',
    name: "ConceptualList",
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
    data(){
      //校验输入内容
      let inputContentReg = (rule, value, callback) => {
        let regExp = /^[\\s，。、：；/:,;\u4e00-\u9fa5A-Za-z0-9]{0,}$/;
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
      // 校验履行结束日期必须在开始日期之后 方法规则
      const checkCompletionDate = (rule, value, callback) =>  {
        setTimeout(() => {
          // 只有当竣工日期选择了之后才进行校验
          if (value !== undefined && value !== '') {
            // 获取开始日期
            const { programmerStartDate } = this.form
            // 判断是否已经选择了开工日期，没有则提示请先选择开工日期
            if (programmerStartDate !== undefined && programmerStartDate !== '') {
              const begin = new Date(programmerStartDate);
              const end = new Date(value);
              if (end - begin < 0) {
                callback(new Error('履行结束日期必须在开始日期之后'))
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
      return{
        linkType: 'conceptualList',
        attachOnly: false,
        page:{
          pageSize: 10,
          currentPage: 1,
          total: 0
        },
        form: {
          projectId:'',
          projectFinancialEvaluations: [],
          projectProgrammeExpertReviews: [],
          projectFinancialAppraisalCosts: []
        },
        query: {
          projectId: ''
        },
        loading:true,
        projectAttachList: [],//附件集合
        selectionList: [],
        data: [],
        option:{
          updateBtn: true,
          index: true,
          indexLabel:'序号',
          addTitle:'添加方案设计',
          menuWidth:140,
          border:true,
          page:true,
          align:'center',
          size: 'mini',
          delBtn:false,
          editBtn: true,
          selection: true,
          tip: false,
          labelWidth:110,
          // searchMenuSpan: 6,
          columnBtn:false,
          viewBtn: true,
          dialogWidth:'55%',
          dialogTop:15,
          dialogHeight:600,
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
              hide: true,
              editDisabled:true
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
              addDisabled: true,
              editDisabled:true,
              rules: [{
                required: true,
                message: "请选择项目阶段",
                trigger: "change"
              }],
              dicUrl: "/api/blade-system/dict-biz/dictionary?code=stage",
              props: {
                label: "dictValue",
                value: "dictKey"
              },
              hide: true,
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
              addDisabled: true,
              editDisabled:true,
              hide: true,
            },
            {
              label:'方案设计名称',
              prop:'programmeName',
              searchLabelWidth:100,
              search: true,
              rules: [{
                required: true,
                validator:inputContentReg,
                trigger: "change",
              }]
            },
            {
              label:'方案设计编码',
              prop:'programmeCode',
              search: true,
              searchLabelWidth:100,
              rules: [{
                required: true,
                validator:inputContentReg,
                trigger: "change",
              }]
            },
            {
              label:'方案设计单位',
              prop:'programmeDesignUnit',
              rules: [{
                required: true,
                validator:inputContentReg,
                trigger: "change",
              }],
              hide: true
            },
            {
              label:'方案设计人员',
              prop:'programmeDesignPerson',
              hide: true
            },
            {
              label:'开始时间',
              prop:'programmerStartDate',
              type: 'date',
              valueFormat: 'yyyy-MM-dd',
              format: 'yyyy-MM-dd',
              search: true
            },
            {
              label:'结束时间',
              prop:'completionDate',
              type: 'date',
              rules: [
                {
                  validator: checkCompletionDate,
                  trigger: "change"
                }
              ],
              valueFormat: 'yyyy-MM-dd',
              format: 'yyyy-MM-dd',
              search: true
            },
            {
              label:'是否评审',
              prop:'isReview',
              search: true,
              type: 'select',
              dicUrl: "/api/blade-system/dict-biz/dictionary?code=is_whether",
              props: {
                label: "dictValue",
                value: "dictKey"
              },
              hide:true,
            },
            {
              label:'设计类型',
              prop:'programmeType  ',
              type: 'select',
              dicUrl: "/api/blade-system/dict-biz/dictionary?code=contract_type",
              props: {
                label: "dictValue",
                value: "dictKey"
              },
              hide:true,
            },
            {
              label:'方案备注',
              prop:'programmeRemarks',
              type: 'textarea',
              overHidden:true,
              rules: [{
                validator:inputContentReg,
                trigger: "change",
              }],
              span:24,
              hide: true
            },
            {
              label: '',
              labelWidth:10,
              prop: 'divider',
              component: 'elDivider',//ele分割线
              params: {
                html: '<p style="font-size: 18px">专家评审</p>',
                contentPosition: "left",
              },
              hide:true,
              span:24,
              addDisplay: false
            },
            {
              labelWidth:0,
              label: '',
              prop: 'projectProgrammeExpertReviews',
              span:24,
              hide:true,
              formslot:true,
              addDisplay: false
            },
            {
              label: '',
              labelWidth:10,
              prop: 'divider',
              component: 'elDivider',//ele分割线
              params: {
                html: '<p style="font-size: 18px">造价</p>',
                contentPosition: "left",
              },
              hide:true,
              span:24,
              addDisplay: false
            },
            {
              labelWidth:0,
              label: '',
              prop: 'projectFinancialAppraisalCosts',
              span:24,
              hide:true,
              formslot:true,
              addDisplay: false
            },
            {
              label: '',
              labelWidth:10,
              prop: 'divider',
              component: 'elDivider',//ele分割线
              params: {
                html: '<p style="font-size: 18px">财评</p>',
                contentPosition: "left",
              },
              hide:true,
              span:24,
              addDisplay: false
            },
            {
              labelWidth:0,
              label: '',
              prop: 'projectFinancialEvaluations',
              span:24,
              hide:true,
              formslot:true,
              addDisplay: false
            },
            {
              label: '',
              prop: 'file',
              formslot: true,
              hide: true,
              labelWidth: 0,
              span: 24
            }
          ]
        },
        infoOption:{
          header:false,
          border:true,
          editBtn: false,
          delBtn:false,
          viewBtn:true,
          menuWidth: 80,
          labelWidth:100,
          dialogWidth:'40%',
          dialogHeight:450,
          dialogTop:20,
          align:'center',
          column: [
            {
              label:"专家评审编码",
              prop:"expertReviewCode",
            },
            {
              label:"专家姓名",
              prop:"reviewExperts",
              hide:true
            },
            {
              label:"专家单位",
              prop:"reviewUnit",
              hide:true
            },
            {
              label:"评审身份",
              prop:"reviewIdentity",
              hide:true
            },
            {
              label:"联系电话",
              prop:"reviewPhone",
              hide:true
            },
            {
              label:"评审时间",
              prop:"reviewDate",
              type: 'date',

            },
            {
              label:"评审内容",
              prop:"expertReviewContent",
              type:'textarea',
            },
            {
              label:"评审意见",
              prop:"reviewComments",
              type:'textarea',
            },
            {
              label:"评审结果",
              prop:"reviewResult",
              type: 'select',
            }
          ]
        },
        foOption:{
          header:false,
          border:true,
          editBtn: false,
          delBtn:false,
          viewBtn:true,
          menuWidth: 80,
          labelWidth:100,
          dialogWidth:'40%',
          dialogHeight:450,
          dialogTop:20,
          align:'center',
          column: [
            {
              label:"财评编码",
              prop:"financialEvaluationCode",
            },
            {
              label:"财评名称",
              prop: "financialEvaluationName",
            },
            {
              label:"财评机构",
              prop: "financialEvaluationAgency"
            },
            {
              label:"被财评单位",
              prop: "financialEvaluationUnit"
            },
            {
              label:"财评报告编号",
              prop: "financialEvaluationReport",

            },
            {
              label:"财评开始时间",
              prop: "financialEvaluationStartDate",
              type: 'date',

            },
            {
              label:"财评结束时间",
              prop: "financialEvaluationEndDate",
              type: 'date',

            },
            {
              label:"财评结果",
              prop: "financialEvaluationResults",
            },
            {
              label:"问题及建议",
              prop: "problemsSuggestions",
              type:'textarea',
              span:24,
              hide:true
            }
          ]
        },
        costOption:{
          header:false,
          border:true,
          editBtn: false,
          delBtn:false,
          viewBtn:true,
          menuWidth: 80,
          labelWidth:100,
          dialogWidth:'40%',
          dialogHeight:450,
          dialogTop:20,
          align:'center',
          column: [
            {
              label: '造价编码',
              prop:"costCode"
            },
            {
              label: '造价人',
              prop:"updateUser",
            },
            {
              label:"造价开始时间",
              prop: "costStartDate",
              type: "datetime"
            },
            {
              label:"造价结束时间",
              prop: "costEndDate",
              type: "datetime"
            },
            {
              label: "造价金额",
              prop: "costMoney"
            },
            {
              label: "内容及问题",
              prop: "content",
              type: 'textarea',
              hide: true,
              span: 24
            },
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
    methods: {
      attach(attachList){
        this.projectAttachList = attachList
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
        if (["view"].includes(type)) {
          this.attachOnly = true
          getProgrammeDetail(this.form.id).then(res => {
            this.form = res.data.data;
          });
        } else {
          this.attachOnly = false
        }
        if (["edit"].includes(type)) {
          getProgrammeDetail(this.form.id).then(res => {
            this.form = res.data.data;
            const sysUserId = JSON.parse(localStorage.getItem('saber-userInfo')).content.user_id
            this.userIdList = this.form
            console.log(this.userIdList)
            if(this.userIdList.createUser !== sysUserId){
              this.$message.error('您没有权限修改')
              this.option.updateBtn = false
            }else{
              this.option.updateBtn = true
              console.log('成功匹配')
            }
            console.log(this.form)
          });
        }
        done()
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
        getConceptualPage(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
          const data = res.data.data;
          this.page.total = data.total;
          this.data = data.records;
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
  .el-dialog-div{
    height: 70vh;
    overflow: auto;
  }

</style>
