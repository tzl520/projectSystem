<template>
  <basic-container>
    <el-row>
      <avue-crud :data="data.map(item=>{item.implementationBudget==='-1'|| item.implementationBudget===-1 ? item.implementationBudget = '': item.implementationBudget;return item})"
                 :option="nodePlanOption"
                 :page.sync="page"
                 :before-open="beforeOpenDialog"
                 v-model="nodePlanForm"
                 ref="crud"
                 @search-change="searchChange"
                 @search-reset="searchReset"
                 @selection-change="selectionChange"
                 @current-change="currentChange"
                 @size-change="sizeChange"
                 @refresh-change="refreshChange"
                 @row-save="nodeSave"
                 @row-update="nodeUpdate"
                 @on-load="onLoad">
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
        <template slot="menuLeft">
          <el-button type="danger"
                     size="mini"
                     icon="el-icon-delete"
                     plain
                     @click="handleDelete">删 除
          </el-button>
        </template>
      </avue-crud>

    </el-row>
  </basic-container>
</template>

<script>
  import {getNodeList,getNodeDetail,add,remove,update} from "@/api/project/nodePlan";
  import projectUpload from "@/components/file-upload/project-upload";
  import {mapGetters} from "vuex";

  export default {
    components: { projectUpload },
    name: "PlanList",
    props: {
      projectId: {
        type: String,
        default: '0'
      },
      projectData: {
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
      // const checkNumber = (rule, value, callback) => {
      //   setTimeout(() => {
      //     // 判断值是否为数字或小数
      //     if (!Number.isFinite(Number(value))) {
      //       callback(new Error('请输入数字值'))
      //     } else {
      //       callback()
      //     }
      //   }, 100)
      // }
      // 校验完成日期必须在开工日期之后 方法规则
      const checkPlannedCompletionDate = (rule, value, callback) =>  {
        setTimeout(() => {
          // 只有当竣工日期选择了之后才进行校验
          if (value !== undefined && value !== '') {
            // 获取开工日期
            const { plannedStartDate } = this.nodePlanForm
            // 判断是否已经选择了开工日期，没有则提示请先选择开工日期
            if (plannedStartDate !== undefined && plannedStartDate !== '') {
              const begin = new Date(plannedStartDate);
              const end = new Date(value);
              if (end - begin < 0) {
                callback(new Error('完成日期必须在开始日期之后'))
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
        size:'mini',
        loading: false,
        linkType: 'planList',
        page:{
          pageSize: 10,
          currentPage: 1,
          total: 0
        },
        query: {
          projectId: ''
        },
        projectAttachList: [],//附件集合
        data: [],
        nodePlanForm: {
          projectId: ''
        },
        selectionList:[],
        nodePlanOption:{
          updateBtn: true,
          index: true,
          selectionWidth:40,
          indexLabel:'序号',
          addTitle:'添加节点计划',
          dialogWidth:'50%',
          dialogHeight:600,
          dialogTop:15,
          columnBtn:false,
          align:'center',
          menuWidth:130,
          border:true,
          page:true,
          size: 'mini',
          delBtn:false,
          viewBtnText:'详情',
          viewBtn: true,
          selection: true,
          tip: false,
          labelWidth:120,
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
              hide: true,
              readonly: true,
              addDisabled: true,
              editDisabled:true
            },
            {
              label: "项目代码",
              prop: "code",
              placeholder: '自动填充',
              hide:true,
              readonly: true,
              addDisabled: true,
              editDisabled:true
            },
            {
              label: "项目阶段",
              prop: "stage",
              hide: true,
              type: "select",
              dicUrl: "/api/blade-system/dict-biz/dictionary?code=stage",
              props: {
                label: "dictValue",
                value: "dictKey"
              },
              width: 120,
              searchFilterable:true,
              addDisabled:true,
              editDisabled:true
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
              label:'节点名称',
              prop:'nodeName',
              search: true,
              searchLabelWidth:100,
              rules: [{
                required: true,
                validator:inputContentReg,
                trigger: "change",
              }]
            },
            {
              label:'节点责任人',
              prop:'nodePersonLiable',
              dicUrl: '/api/blade-user/userNameList',
              props: {
                label: "name",
                value: "id"
              },
              type: 'select',
              readonly: true,
              addDisplay: false,
              editDisabled: true,
              search: true,
              searchLabelWidth:100,
            },
            {
              label:'节点状态',
              prop:'nodeStatus',
              search: true,
              type: 'select',
              dicUrl: "/api/blade-system/dict-biz/dictionary?code=planning_node2",
              props: {
                label: "dictValue",
                value: "dictKey"
              },
              hide: true
            },
            {
              label:'工作类型',
              prop:'jobType',
              search: true,
              type: 'select',
              dicUrl: "/api/blade-system/dict-biz/dictionary?code=work_type",
              props: {
                label: "dictValue",
                value: "dictKey"
              }
            },
            {
              label:'工作内容',
              prop:'jobContent',
              type: 'textarea',
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
              hide: true,
              span:24,
              editDisplay: false,
              addDisplay: false,
            },
            {
              label:'计划开始时间',
              prop:'plannedStartDate',
              rules: [
                {
                  required: true,
                  message: "请选择计划开始时间",
                  trigger: "blur"
                }
              ],
              type: 'date',
              valueFormat: 'yyyy-MM-dd',
              format: 'yyyy-MM-dd',
              hide: true
            },
            {
              label:'计划完成时间',
              prop:'plannedCompletionDate',
              rules: [
                {
                  required: true,
                  message: "请选择计划完成时间",
                  trigger: "blur"
                },
                {
                  validator: checkPlannedCompletionDate,
                  trigger: "change"
                }
              ],
              type: 'date',
              valueFormat: 'yyyy-MM-dd',
              format: 'yyyy-MM-dd',
              width: 100
            },
            {
              label:'实际开始时间',
              prop:'actualStartDate',
              rules: [
                {
                  required: true,
                  message: "请选择实际开始时间",
                  trigger: "blur"
                }
              ],
              type: 'date',
              valueFormat: 'yyyy-MM-dd',
              format: 'yyyy-MM-dd',
              hide: true
            },
            {
              label:'实际结束时间',
              prop:'actualFinishingDate',
              rules: [
                {
                  required: true,
                  message: "请选择实际结束时间",
                  trigger: "blur"
                },
                {
                  validator: checkPlannedCompletionDate,
                  trigger: "change"
                }
              ],
              type: 'date',
              valueFormat: 'yyyy-MM-dd',
              format: 'yyyy-MM-dd',
              width: 100
            },
            {
              label:'实施预算',
              prop:'implementationBudget',
              append: '万元',
            },
            {
              label:'实际使用费用',
              prop:'actualCost',
              append: '万元',
              width: 100
            },
            {
              label:'费用使用比例',
              prop:'actualProportion',
              rules: [{
                validator:inputContentReg,
                trigger: "change",
              }],
              width: 100
            },
            {
              label:'录入时间',
              prop:'updateTime',
              placeholder:"自动获取",
              type: "datetime",
              valueFormat: 'yyyy-MM-dd HH:mm:ss',
              format: 'yyyy-MM-dd HH:mm:ss',
              addDisplay: false,
              editDisplay: false,
              hide: true
            },
            {
              label:'计划工期',
              prop:'actualDay',
              placeholder:"自动计算",
              addDisplay: false,
              editDisplay: false,
              append: '天'
            },
            {
              label:'实际工期',
              prop:'realityDay',
              placeholder:"自动计算",
              addDisplay: false,
              editDisplay: false,
              append: '天'
            },
            {
              label:'疑难问题',
              prop: 'difficultProblems',
              type: 'textarea',
              rules: [{
                validator:inputContentReg,
                trigger: "change",
              }],
              hide:true,
              span:24
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
        attachOnly: true
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
      // console.log(this.$route.params.projectId)
      // console.log(this.projectId === undefined || this.projectId.trim() === '')
      if (this.projectId === undefined || this.projectId.trim() === ''){
        this.projectId = this.$route.params.projectId
      }
    },
    methods:{
      attach(attachList){
        this.projectAttachList = attachList
      },
      beforeOpenDialog(done, type) {
        // 表单打开前方法
        console.log('nodePlan',this.nodePlanForm)
        if (this.projectData !== undefined) {
          this.nodePlanForm['projectName'] = this.projectData['name']
          this.nodePlanForm['projectId'] = this.projectId
          this.nodePlanForm['stage'] = this.projectData['stage']
          this.nodePlanForm['nodeStage'] = this.projectData['stage']
          this.nodePlanForm['classification'] = this.projectData['classification']
          this.nodePlanForm['code'] = this.projectData['code']
        }
        if (type === 'add') {
          this.projectAttachList = []
        }
        if (["view"].includes(type)) {
          this.attachOnly = true
          getNodeDetail(this.nodePlanForm.id).then(res => {
            this.nodePlanForm = Object.assign(this.nodePlanForm, res.data.data);
            this.nodePlanForm['implementationBudget'] = Number(this.nodePlanForm['implementationBudget']) / 10000 / 100
            this.nodePlanForm['actualCost'] = Number(this.nodePlanForm['actualCost']) / 10000 / 100
          });
        } else {
          this.attachOnly = false
        }
        if (["edit"].includes(type)) {
          getNodeDetail(this.nodePlanForm.id).then(res => {
            this.nodePlanForm = Object.assign(this.nodePlanForm, res.data.data);
            this.nodePlanForm['implementationBudget'] = Number(this.nodePlanForm['implementationBudget']) / 10000 / 100
            this.nodePlanForm['actualCost'] = Number(this.nodePlanForm['actualCost']) / 10000 / 100
            const sysUserId = JSON.parse(localStorage.getItem('saber-userInfo')).content.user_id
            this.userIdList = this.nodePlanForm
            console.log(this.userIdList)
            if(this.userIdList.createUser !== sysUserId){
              this.$message.error('您没有权限修改')
              this.nodePlanOption.updateBtn = false
            }else{
              this.nodePlanOption.updateBtn = true
              console.log('成功匹配')
            }
          });
        }
        done()
      },
      nodeSave(row, done, loading) {
        row['projectAttachList'] = this.projectAttachList
        row['projectAttachList'].forEach(attach => {
          attach['createTime'] = ''
          attach['linkType'] = this.linkType
        })
        row['implementationBudget'] = Number(row['implementationBudget']) * 10000 * 100
        row['actualCost'] = Number(row['actualCost']) * 10000 * 100
        add(row).then(() => {
          this.onLoad(this.page);
          this.$message({
            showClose: true,
            message: '保存后不能修改,只有项目经理可以修改哦',
            type: 'warning'
          });
          done();
        }, error => {
          loading();
          window.console.log(error);
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
      nodeUpdate(row, index, done, loading) {
        row['implementationBudget'] = Number(row['implementationBudget']) * 10000 * 100
        row['actualCost'] = Number(row['actualCost']) * 10000 * 100
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
        console.log(this.query.projectId)
        getNodeList(page.currentPage, page.pageSize, Object.assign(params, this.query),this.projectId).then(res => {
          const data = res.data.data;
          for(const money of this.data){
            money['implementationBudget'] = Number(money['implementationBudget']) / 10000 / 100
            money['actualCost'] = Number(money['actualCost']) / 10000 / 100
          }
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

</style>
