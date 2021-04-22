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
  import projectUpload from "@/components/file-upload/project-upload";
  import {getContractList} from "@/api/project/contract";
  import {getFinalList, getFinalRemove, getFinalSave, getFinalUpdate, getFinalView} from "@/api/project/settlement";
  import {mapGetters} from "vuex";

  export default {
    components: { projectUpload },
    name: "finalAccountReport",
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
      // 校验完成日期必须在开工日期之后 方法规则
      const checkPlannedCompletionDate = (rule, value, callback) =>  {
        setTimeout(() => {
          // 只有当竣工日期选择了之后才进行校验
          if (value !== undefined && value !== '') {
            // 获取开工日期
            const { finalAccountStartDate } = this.form
            // 判断是否已经选择了开工日期，没有则提示请先选择开工日期
            if (finalAccountStartDate !== undefined && finalAccountStartDate !== '') {
              const begin = new Date(finalAccountStartDate);
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
        data: [],
        projectAttachList:[],
        page:{
          pageSize: 10,
          currentPage: 1,
          total: 0
        },
        query: {
          projectId: ''
        },
        form: {
          projectId:'',
          contractId:'',
          contractCode:'',
        },
        linkType: 'finalAccountReport',
        attachOnly: false,
        test: '项目决算报告',
        option:{
          updateBtn: true,
          dialogWidth:'50%',
          addTitle:'添加决算报告',
          size:'mini',
          index: true,
          delBtn:false,
          viewBtnText:'详情',
          viewBtn: true,
          searchLabelWidth:100,
          align:'center',
          searchMenuSpan: 6,
          border:true,
          searchBtnSpan: 6,
          searchSpan:8,
          selection: true,
          tip: false,
          labelWidth:120,
          indexLabel:'序号',
          column:[
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
              addDisabled: true,
              editDisabled:true
            },
            {
              label: "决算编号",
              prop: "finalAccountNum",
              hide: true,
              rules: [{
                required: true,
                trigger: 'change',
                message: "请输入决算编号",
              }]
            },
            {
              label: '决算金额',
              append: '万元',
              rules: [
                {
                  required: true,
                  message: "请输入结算金额",
                  trigger: "blur"
                },
                {
                  validator: checkNumber,
                  trigger: "blur"
                }
              ],
              prop: 'finalAccountMoney',
            },
            {
              label:'决算单位',
              hide: true,
              prop:'finalAccountUnit',
            },
            {
              label:'决算负责人',
              prop:'finalAccountPerson',
            },
            {
              label:'决算开始时间',
              prop:'finalAccountStartDate',
              type: 'date',
              width: 120,
              search: true,
              valueFormat: 'yyyy-MM-dd',
              format: 'yyyy-MM-dd',
              rules: [{
                required: true,
                message: "请选择决算开始日期",
                trigger: "change"
              }],
            },
            {
              label:'决算结束时间',
              width: 120,
              prop:'finalAccountEndDate',
              search: true,
              rules: [{
                  validator: checkPlannedCompletionDate,
                  trigger: "change"
                }],
          type: 'date',
          valueFormat: 'yyyy-MM-dd',
          format: 'yyyy-MM-dd',
        },{
              label:'问题描述',
              prop:'question',
              span:24,
              type: "textarea",
              rules: [{
                validator:inputContentReg,
                trigger: "change",
              }]
            },
            {
              label:'',
              prop: 'file',
              formslot:true,
              hide:true,
              labelWidth: 0,
              span:24,
            }
          ]
        }
      }
    },
    created() {
      console.log(this.test, 'created')
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
      console.log(this.test, 'mounted')
      this.initData()
    },
    methods:{
      rowSave(row, done, loading) {
        //添加附件集合
        row['projectId'] = this.projectId
        row['finalAccountMoney'] = Number(row['finalAccountMoney']) * 10000 * 100
        row['projectAttachList'] = this.projectAttachList
        row['projectAttachList'].forEach(attach => {
          attach['createTime'] = ''
          attach['linkType'] = this.linkType
        })
        getFinalSave(row).then(() => {
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
        getFinalUpdate(row).then(() => {
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
            return getFinalRemove(this.ids);
          })
          .then(() => {
            this.onLoad(this.page);
            this.$message({
              type: "success",
              message: "操作成功!"
            });
          });
      },
      beforeOpenDialog(done, type) {
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
          getFinalView(this.form.id).then(res => {
            this.form = res.data.data;
            this.form['finalAccountMoney'] = Number(this.form['finalAccountMoney']) / 10000 / 100
          });
        }
        if (["edit"].includes(type)) {
          this.attachOnly = false
          getFinalView(this.form.id).then(res => {
            this.form = res.data.data;
            const sysUserId = JSON.parse(localStorage.getItem('saber-userInfo')).content.user_id
            if(this.form.createUser !== sysUserId){
              this.$message.error('您没有权限修改')
              this.option.updateBtn = false
            }else{
              this.option.updateBtn = true
              console.log('成功匹配')
            }
            this.form['finalAccountMoney'] = Number(this.form['finalAccountMoney']) / 10000 / 100
          });
        }
        done();
      },
      initData(){
        getContractList(this.projectId).then(res => {
          this.contractList = res.data.data
          const dicData = []
          this.contractList.forEach(contract => {
            dicData.push({ value: contract.id, label: contract.contractName })
          })
          this.option.column[5].dicData = dicData
        })
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
        console.log(page)
        console.log(params)
        this.query.projectId = this.projectId
        getFinalList(page.currentPage, page.pageSize, Object.assign(params,this.query)).then(res => {
          const data = res.data.data;
          this.page.total = data.total;
          this.data = data.records;
          console.log(this.data)
          for(const money of this.data){
            money['finalAccountMoney'] = Number(money['finalAccountMoney']) / 10000 / 100
          }
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

