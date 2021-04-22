<template>
  <basic-container>
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
                   v-if="permission.autocode_delete"
                   @click="handleDelete">删 除
        </el-button>
      </template>
    </avue-crud>
  </basic-container>
</template>

<script>
  import {getImplementationPlanList, getDetail, add, update, remove} from "@/api/project/implementationPlan";
  import projectUpload from "@/components/file-upload/project-upload";
  import {mapGetters} from "vuex";
  export default {
    name: "implementationPlan",
    components: {projectUpload},
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
      // 校验计划结束时间必须在计划开始时间之后 方法规则
      const planEndDate = (rule, value, callback) => {
        setTimeout(() => {
          if (value !== undefined && value !== '') {
            // 获取计划开始时间
            const {planStartDate} = this.form
            // 判断是否已经选择了计划开始时间，没有则提示请先选择计划开始时间
            if (planStartDate !== undefined && planStartDate !== '') {
              const begin = new Date(planStartDate);
              const end = new Date(value);
              if (end - begin < 0) {
                callback(new Error('计划结束时间必须在计划开始时间之后 '))
              } else {
                callback()
              }
            } else {
              callback(new Error('请先选择计划开始时间'))
            }
          } else {
            callback()
          }
        }, 100)
      }
      return {
        form: {
          projectId: ''
        },
        query: {
          projectId: ''
        },
        loading: true,
        page: {
          pageSize: 10,
          currentPage: 1,
          total: 0
        },
        selectionList: [],
        projectAttachList: [],//附件集合
        option: {
          height: 'auto',
          align: 'center',
          calcHeight: 30,
          tip: false,
          searchShow: true,
          searchMenuSpan: 6,
          searchSpan: 8,
          border: true,
          index: true,
          indexLabel: '序号',
          viewBtn: true,
          selection: true,
          dialogClickModal: false,
          dialogWidth: '50%',
          dialogHeight: 600,
          dialogTop: 15,
          size: 'mini',
          labelWidth: 110,
          searchLabelWidth: 100,
          updateBtn: true,
          column: [
            {
              label: "项目id",
              prop: "projectId",
              hide: true,
              addDisplay: false,
              viewDisplay: false,
              editDisplay: false
            },
            {
              label: "项目名称",
              prop: "projectName",
              hide: true,
              readonly: true,
              addDisabled: true,
              editDisabled: true
            },
            {
              label: "项目代码",
              prop: "code",
              placeholder: '自动填充',
              hide: true,
              readonly: true,
              addDisabled: true,
              editDisabled: true
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
              searchFilterable: true,
              addDisabled: true,
              editDisabled: true
            },
            {
              label: "实施名称",
              prop: "implementName",
              rules: [
                {
                  required: true,
                  message: "请输入实施名称",
                  trigger: "blur"
                }
              ],
            },
            {
              label: "实施责任人",
              prop: "updateUser",
              dicUrl: '/api/blade-user/userNameList',
              props: {
                label: "name",
                value: "id"
              },
              type: 'select',
              readonly: true,
              addDisplay: false,
              editDisabled: true,
              search: true
            },
            {
              label: "实施类型",
              prop: "implementType"
            },
            {
              label: "实施内容",
              prop: "implementContent",
              type: 'textarea',
              overHidden: true,
              span: 24,
              hide: true
            },
            {
              label: "计划开始时间",
              prop: "planStartDate",
              type: 'date',
              valueFormat: 'yyyy-MM-dd',
              format: 'yyyy-MM-dd',
              search: true
            },
            {
              label: "计划结束时间",
              prop: "planEndDate",
              rules: [
                {
                  validator: planEndDate,
                  trigger: "change"
                }
              ],
              type: 'date',
              valueFormat: 'yyyy-MM-dd',
              format: 'yyyy-MM-dd',
              search: true
            },
            {
              label: "实际完成时间",
              prop: "actualEndDate",
              type: 'date',
              valueFormat: 'yyyy-MM-dd',
              format: 'yyyy-MM-dd',
              hide: true
            },
            {
              label: "录入时间",
              prop: "updateTime",
              hide: true,
              addDisplay: false,
              editDisabled: true
            },
            {
              label: "工作预算",
              prop: "workBudget",
              hide: true
            },
            {
              label: "费用使用比例",
              prop: "useProportion",
              hide: true
            },
            {
              label: "实际使用费用",
              prop: "actualUseCost",
              hide: true
            },
            {
              label: "计划状态",
              prop: "planStatus",
              type: 'select',
              dicUrl: "/api/blade-system/dict-biz/dictionary?code=planning_node",
              props: {
                label: "dictValue",
                value: "dictKey"
              },
              search: true
            },
            {
              label: "疑难问题",
              prop: "difficultProblems",
              type: 'textarea',
              overHidden: true,
              span: 24,
              hide: true
            },
            {
              label: '',
              prop: 'file',
              formslot: true,
              labelWidth: 0,
              hide: true,
              span: 24
            }
          ]
        },
        data: [],
        attachOnly: false
      };
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
          addBtn: this.vaildData(this.permission.autocode_add, false),
          viewBtn: this.vaildData(this.permission.autocode_view, false),
          delBtn: this.vaildData(this.permission.autocode_delete, false),
          editBtn: this.vaildData(this.permission.autocode_edit, false)
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
      rowSave(row, done, loading) {
        row['projectId'] = this.projectId
        row['projectAttachList'] = this.projectAttachList
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
        // 表单打开前方法
        this.attachOnly = false
        if (this.projectData !== undefined) {
          this.form['projectName'] = this.projectData['name']
          this.form['projectId'] = this.projectId
          this.form['stage'] = this.projectData['stage']
          this.form['code'] = this.projectData['code']
        }
        if (["edit"].includes(type)) {
          getDetail(this.form.id).then(res => {
            this.form = res.data.data;
            const sysUserId = JSON.parse(localStorage.getItem('saber-userInfo')).content.user_id
            if( this.form.createUser !== sysUserId){
              this.option.updateBtn = false
              this.attachOnly = true
              this.$message.error('您没有权限修改')
            }else{
              this.option.updateBtn = true
              this.attachOnly = false
            }
          });
        }
        if (type === 'add') {
          this.projectAttachList = []
        }
        if (["view"].includes(type)) {
          this.attachOnly = true
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
        this.query.projectId = this.projectId
        getImplementationPlanList(page.currentPage, page.pageSize, Object.assign(params)).then(res => {
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
          this.projectAttachList.splice(index, 1)
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
