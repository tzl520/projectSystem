<template>
  <basic-container>
    <el-row>
      <avue-crud :data="data"
                 :option="option"
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
                 @row-del="rowDel"
                 @row-update="rowUpdate"
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
        <template slot-scope="{scope,size,row}" slot="menu">
          <el-button type="text" size="mini" @click="rowDel(row)" icon="el-icon-refresh-left"> 撤回</el-button>
        </template>
      </avue-crud>
    </el-row>
  </basic-container>
</template>

<script>
  import {getInspectionPage, getInspectionDetail, add, update, remove} from '@/api/project/inspection'
  import {getNodePersonLiableList} from '@/api/project/gantt'
  import {mapGetters} from "vuex";

  export default {
    name: "InspectionList",
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
        setTimeout(() => {
          if (value !== undefined && value !== '') {
            if (!regExp.test(value)) {
              callback(new Error('您输入了非法字符，请重新输入!'));
            } else {
              callback();
            }
          } else {
            callback()
          }

        }, 100)

      }
      return {
        dialogVisible: false,
        test: '巡检列表',
        page: {
          pageSize: 10,
          currentPage: 1,
          total: 0
        },
        query: {
          projectId: '',
          inspectStatus: '1'
        },
        form: {
          projectId: '',
          createUser: ''
        },
        selectionList: [],
        data: [],
        dataList: [],
        userData: [],
        option: {
          addBtnText: '发布巡检',
          addTitle: '发布巡检',
          size: 'mini',
          border: true,
          align: 'center',
          indexLabel: '序号',
          columnBtn: false,
          delBtn: false,
          index: true,
          selection: true,
          tip: false,
          menuWidth: 130,
          dialogWidth: '50%',
          dialogTop: 15,
          dialogHeight: 600,
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
              readonly: true,
              addDisabled: true,
              editDisabled: true,
              hide: true
            },
            {
              label: "项目代码",
              prop: "code",
              readonly: true,
              hide: true,
              addDisabled: true,
              editDisabled: true
            },
            {
              label: "项目阶段",
              prop: "stage",
              type: "select",
              hide: true,
              addDisabled: true,
              editDisabled: true,
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
              editDisabled: true
            },
            {
              label: "编号",
              prop: "number",
              rules: [{
                required: true,
                validator: inputContentReg,
                trigger: "change",
              }]
            },
            {
              label: "巡检名称",
              prop: "inspectName",
              rules: [{
                required: true,
                validator: inputContentReg,
                trigger: "change",
              }]
            },
            {
              label: "施工单位",
              prop: "constructionUnitId",
              type: "select",
              dicUrl: "/api/blade-system/dict-biz/dictionary?code=unit",
              props: {
                label: "dictValue",
                value: "dictKey"
              },
              filterable: true,
              search: true
            },
            {
              label: "监理单位",
              prop: "supervisorUnitId",
              type: "select",
              dicUrl: "/api/blade-system/dict-biz/dictionary?code=unit",
              props: {
                label: "dictValue",
                value: "dictKey"
              },
              filterable: true,
              search: true
            },
            {
              label: "建设单位",
              prop: "buildUnitId",
              type: "select",
              dicUrl: "/api/blade-system/dict-biz/dictionary?code=unit",
              props: {
                label: "dictValue",
                value: "dictKey"
              },
              filterable: true,
              search: true
            },
            {
              label: "发起人",
              prop: "createUser",
              type: 'select',
              dicUrl: "/api/blade-user/userNameList",
              props: {
                label: "name",
                value: "id"
              },
              addDisplay: false,
              viewDisplay: false,
              editDisplay: false,
              hide: true
            },
            {
              label: "发起时间",
              prop: "createTime",
              type: 'date',
              valueFormat: 'yyyy-MM-dd',
              format: 'yyyy-MM-dd',
              addDisplay: false,
              viewDisplay: false,
              editDisplay: false,
              hide: true,
            },
            {
              label: "巡检人员",
              prop: "userId",
              type: 'select',
              dicData: [],
              rules: [{
                required: true,
                message: "请选择巡检人员",
                trigger: "blur"
              }]
            },
            {
              label: "检查日期",
              prop: "inspectDate",
              type: 'date',
              valueFormat: 'yyyy-MM-dd',
              format: 'yyyy-MM-dd'
            },
            {
              label: "巡检事项",
              prop: "matter",
              type: 'textarea',
              rules: [{
                validator: inputContentReg,
                trigger: "change",
              }],
              span: 24
            },
            {
              label: "巡检状态",
              prop: "inspectStatus",
              search: true,
              width: 70,
              type: 'select',
              dicUrl: "/api/blade-system/dict-biz/dictionary?code=inspect_status",
              props: {
                label: "dictValue",
                value: "dictKey"
              },
              addDisplay: false,
              editDisabled: true,
            },
          ]
        }
      }
    },
    watch: {
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
      if (this.projectId === undefined || this.projectId.trim() === '') {
        this.projectId = this.$route.params.projectId
      }
      this.init()
    },
    methods: {
      init() {
        //选择项目小组成员
        getNodePersonLiableList(this.projectId).then(res => {
          console.log(res.data.data)
          this.option.column[12].dicData = []
          this.dataList = res.data.data
          for (let data of this.dataList) {
            this.option.column[12].dicData.push({label: data.userName, value: data.userId})
          }
        })

        console.log(JSON.parse(localStorage.getItem('saber-userInfo')).content.user_id);
      },
      beforeOpenDialog(done, type) {
        // 表单打开前方法
        this.option.updateBtn = true
        if (this.projectData !== undefined) {
          this.form['projectName'] = this.projectData['name']
          this.form['projectId'] = this.projectData['id']
          this.form['stage'] = this.projectData['stage']
          this.form['classification'] = this.projectData['classification']
          this.form['code'] = this.projectData['code']
        }
        if (["view"].includes(type)) {
          this.option.updateBtn = false
          getInspectionDetail(this.form.id).then(res => {
            this.form = res.data.data;
          });
        }
        if (["edit"].includes(type)) {
          const localUserId = JSON.parse(localStorage.getItem('saber-userInfo')).content.user_id
          getInspectionDetail(this.form.id).then(res => {
            this.form = res.data.data;
            if (this.form.createUser !== localUserId) {
              // console.log('no')
              this.option.updateBtn = false
              this.$message.error('您没有权限修改')
            } else {
              this.option.updateBtn = true
              // console.log('yes')
            }
            console.log(this.form.createUser);
          });
        }
        done()
      },
      rowSave(row, done, loading) {
        row['projectId'] = this.projectId
        add(row).then(() => {
          console.log("++++++++发布巡检++++++++", row);
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
        this.$confirm("确定将选择数据撤回?", {
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
              message: "撤回成功!"
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
      currentChange(currentPage) {
        this.page.currentPage = currentPage;
      },
      sizeChange(pageSize) {
        this.page.pageSize = pageSize;
      },
      refreshChange() {
        this.onLoad(this.page, this.query);
      },
      onLoad(page, params = {}) {
        this.loading = true;
        this.query.projectId = this.projectId
        getInspectionPage(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
          const data = res.data.data;
          console.log("获取巡检++======", res.data.data)
          this.page.total = data.total;
          this.data = data.records;
          this.loading = false;
        });
      }
    }
  }
</script>

<style scoped>

</style>
