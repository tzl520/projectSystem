<template>
  <basic-container>
    <el-row>
      <avue-crud :data="data"
                 :option="evaluationOption"
                 :page.sync="page"
                 :before-open="beforeOpen"
                 v-model="form"
                 ref="crud"
                 @search-change="searchChange"
                 @search-reset="searchReset"
                 @refresh-change="refreshChange"
                 @row-update="rowUpdate"
                 @row-save="rowSave"
                 @on-load="onLoad"
                 @selection-change="selectionChange"
                 :show-column.sync="showColumn">
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
  import {getConceptualList} from '@/api/project/conceptual'
  import projectUpload from "@/components/file-upload/project-upload";
  import {getEvaluationPage, getEvaluationDetail, add, update, remove} from "@/api/project/fEvaluation"
  import {mapGetters} from "vuex";

  export default {
    components: {projectUpload},
    name: "FinancialEvaluation",
    props: {
      projectId: {
        type: String,
        default: '0'
      },
      attachList: {
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
      // 校验完成日期必须在开工日期之后 方法规则
      const checkFinancialEvaluationEndDate = (rule, value, callback) => {
        setTimeout(() => {
          // 只有当竣工日期选择了之后才进行校验
          if (value !== undefined && value !== '') {
            // 获取开始日期
            const {financialEvaluationStartDate} = this.form
            // 判断是否已经选择了开工日期，没有则提示请先选择开工日期
            if (financialEvaluationStartDate !== undefined && financialEvaluationStartDate !== '') {
              const begin = new Date(financialEvaluationStartDate);
              const end = new Date(value);
              if (end - begin < 0) {
                callback(new Error('结束日期必须在开始日期之后'))
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
      return {
        test: '送审财评',
        linkType: 'FinancialEvaluation',
        attachOnly: false,
        form: {
          projectId: '',
          programmeId: '',
          programmeCode: '',
          costAmount: ''
        },
        query: {projectId: ''},
        loading: true,
        page: {
          pageSize: 10,
          currentPage: 1,
          total: 0
        },
        data: [],
        projectAttachList: [],//附件集合
        selectionList: [],
        programmeList: [], // 方案设计列表
        evaluationOption: {
          updateBtn: true,
          index: true,
          indexLabel: '序号',
          addTitle: '添加财评',
          size: 'mini',
          labelWidth: 100,
          searchLabelWidth: 100,
          menuWidth: 140,
          selection: true,
          columnBtn: false,
          align: 'center',
          tip: false,
          border: true,
          delBtn: false,
          viewBtn: true,
          dialogWidth: '50%',
          dialogHeight: 600,
          dialogTop: 15,
          // searchShow: true,
          // searchMenuSpan: 6,
          column: [
            {
              label: "方案设计名称",
              prop: "programmeId",
              search: true,
              type: 'select',
              dicData: [],
              editDisabled: true,
              hide: true
            },
            {
              label: "方案设计编码",
              prop: "programmeCode",
              search: true,
              placeholder: "自动读取",
              hide: true,
              editDisabled: true
            },
            {
              label: "财评名称",
              prop: "financialEvaluationName",
              rules: [{
                required: true,
                validator: inputContentReg,
                trigger: "change",
              }],
              search: true
            },
            {
              label: "财评编码",
              prop: "financialEvaluationCode",
              rules: [{
                required: true,
                validator: inputContentReg,
                trigger: "change",
              }],
              search: true
            },
            {
              label: "财评开始时间",
              prop: "financialEvaluationStartDate",
              type: 'date',
              valueFormat: 'yyyy-MM-dd',
              format: 'yyyy-MM-dd',
              hide: true
            },
            {
              label: "财评结束时间",
              prop: "financialEvaluationEndDate",
              rules: [
                {
                  validator: checkFinancialEvaluationEndDate,
                  trigger: "change"
                }],
              type: 'date',
              valueFormat: 'yyyy-MM-dd',
              format: 'yyyy-MM-dd',
              hide: true
            },
            {
              label: "造价金额",
              prop: "costAmount",
              append: '万元'
            },
            {
              label: "财评金额",
              prop: "financialEvaluationAmount",
              append: '万元'
            },
            {
              label: "核减金额",
              prop: "deductionAmount",
              addDisplay: false,
              editDisplay: false
            },
            {
              label: "财评机构",
              prop: "financialEvaluationAgency",
              rules: [{
                required: true,
                validator: inputContentReg,
                trigger: "change",
              }]
            },
            {
              label: "财评报告",
              prop: "financialEvaluationReport",
              rules: [{
                validator: inputContentReg,
                trigger: "change",
              }],
              hide: true
            },
            {
              label: "财评结果",
              prop: "financialEvaluationResults",
              type: 'select',
              dicUrl: "/api/blade-system/dict-biz/dictionary?code=financialEvaluationResults",
              props: {
                label: "dictValue",
                value: "dictKey"
              },
              rules: [{
                validator: inputContentReg,
                trigger: "change",
              }],
              hide: true
            },
            {
              label: "问题及建议",
              prop: "problemsSuggestions",
              type: 'textarea',
              rules: [{
                validator: inputContentReg,
                trigger: "change",
              }],
              span: 24,
              hide: true
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
        }
      }
    },
    watch: {
      'projectId': function (newVal, oldVal) {
        if (newVal !== oldVal) {
          this.onLoad(this.page)
          this.initData()
        }
      },
      'form.programmeId': {
        handler(newVal, oldVal) {
          if (newVal !== undefined && newVal !== oldVal) {
            for (const tempData of this.programmeList) {
              if (tempData.id === newVal) {
                this.form.programmeCode = tempData.programmeCode
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
      if (this.projectId === undefined || this.projectId.trim() === '') {
        this.projectId = this.$route.params.projectId
      }
      this.initData()
    },
    methods: {
      attach(attachList) {
        this.projectAttachList = attachList
      },
      initData() {
        getConceptualList(this.projectId).then(res => {
          this.programmeList = res.data.data
          const dicData = []
          this.programmeList.forEach(programme => {
            dicData.push({value: programme.id, label: programme.programmeName})
          })
          this.evaluationOption.column[0].dicData = dicData
        })
      },
      rowSave(row, done, loading) {
        row['projectId'] = this.projectId
        row['projectAttachList'] = this.projectAttachList
        row['projectAttachList'].forEach(attach => {
          attach['createTime'] = ''
          attach['linkType'] = this.linkType
        })
        row['costAmount'] = Number(row['costAmount']) * 10000 * 100
        row['financialEvaluationAmount'] = Number(row['financialEvaluationAmount']) * 10000 * 100
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
        row['costAmount'] = Number(row['costAmount']) * 10000 * 100
        row['financialEvaluationAmount'] = Number(row['financialEvaluationAmount']) * 10000 * 100
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
      beforeOpen(done, type) {
        this.attachOnly = false
        if (["view"].includes(type)) {
          this.attachOnly = true
          getEvaluationDetail(this.form.id).then(res => {
            this.form = res.data.data;
            this.form.costAmount = Number(this.form.costAmount) / 10000 / 100
            this.form.financialEvaluationAmount = Number(this.form.financialEvaluationAmount) / 10000 / 100
          });
        }
        if (type === 'add') {
          this.projectAttachList = []
        }
        if (["edit"].includes(type)) {
          this.attachOnly = false
          getEvaluationDetail(this.form.id).then(res => {
            this.form = res.data.data;
            this.form.costAmount = Number(this.form.costAmount) / 10000 / 100
            this.form.financialEvaluationAmount = Number(this.form.financialEvaluationAmount) / 10000 / 100
            const sysUserId = JSON.parse(localStorage.getItem('saber-userInfo')).content.user_id
            if (this.form.createUser !== sysUserId) {
              this.evaluationOption.updateBtn = false
              this.$message.error('您没有权限修改')
            } else {
              this.evaluationOption.updateBtn = true
            }
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
        getEvaluationPage(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
          const data = res.data.data;
          this.page.total = data.total;
          this.data = data.records;
          for (const financial of this.data) {
            financial.costAmount = Number(financial.costAmount) / 10000 / 100
            financial.financialEvaluationAmount = Number(financial.financialEvaluationAmount) / 10000 / 100
          }
          this.loading = false;
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
