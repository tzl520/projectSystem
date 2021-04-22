<template>
  <basic-container>
    <el-row>
      <avue-crud :data="data"
                 :option="costListOption"
                 :page.sync="page"
                 v-model="form"
                 ref="crud"
                 :before-open="beforeOpen"
                 @search-change="searchChange"
                 @search-reset="searchReset"
                 @selection-change="selectionChange"
                 @current-change="currentChange"
                 @size-change="sizeChange"
                 @refresh-change="refreshChange"
                 @row-save="rowSave"
                 @row-update="rowUpdate"
                 @row-del="rowDel"
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
        <!--<template slot="menuLeft">-->
        <!--<el-button type="success" plain size="mini"-->
        <!--@click="dialogVisible = true">导 入-->
        <!--</el-button>-->
        <!--<el-button type="primary" plain size="mini"-->
        <!--@click="centerDialogVisible = true">归并合同</el-button>-->
        <!--</template>-->
      </avue-crud>
      <el-dialog title="合同导入" :visible.sync="dialogVisible" :modal-append-to-body="false" width="30%">
        选择导入合同：

        <el-upload
          style="display: inline-block;"
          action="/api/project-manager/projectcost/import"
          :show-file-list="false"
          :headers="uploadHeaders"
          :on-success="handleSuccess">
          <el-select v-model="value" style="width: 60% " filterable multiple placeholder="请选择">
            <el-option
              v-for="item in contractList"
              :key="item.value"
              :label="item.contractName"
              :value="item.contractCode">
              <span style="float: left">{{ item.contractName }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.contractCode }}</span>
            </el-option>
          </el-select>
          <el-button size="small" type="info" icon="el-icon-upload">导入数据</el-button>
        </el-upload>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="dialogVisible = false" size="mini">确定导入</el-button>
          <el-button @click="dialogVisible = false" size="mini">取 消</el-button>
        </span>
      </el-dialog>
      <el-dialog title="合同归并" :visible.sync="centerDialogVisible" :modal-append-to-body="false" width="30%">
        选择归并合同：
        <el-select v-model="value" style="width: 60%" filterable multiple placeholder="请选择">
          <el-option
            v-for="item in contractList"
            :key="item.value"
            :label="item.contractName"
            :value="item.contractCode">
            <span style="float: left">{{ item.contractName }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.contractCode }}</span>
          </el-option>
        </el-select>

        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="centerDialogVisible = false" size="mini">归并合同</el-button>
          <el-button @click="centerDialogVisible = false" size="mini" clear>取 消</el-button>
        </span>

      </el-dialog>
    </el-row>
  </basic-container>
</template>

<script>
  import {getCostList, add, getCostDetail, update, remove} from '@/api/project/costList'
  import { getConceptualList } from '@/api/project/conceptual'
  import projectUpload from "@/components/file-upload/project-upload";
  import {mapGetters} from "vuex";

  export default {
    components: {projectUpload},
    name: "CostList",
    props: {
      projectId: {
        type: String,
        default: '0'
      },
      attachList:{
        type: Object,
        default: undefined
      }
    },
    data() {
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
      // 校验日期
      const checkCostDate = (rule, value, callback) =>  {
        setTimeout(() => {
          // 只有当竣工日期选择了之后才进行校验
          if (value !== undefined && value !== '') {
            // 获取开始日期
            const { costStartDate } = this.form
            // 判断是否已经选择了开工日期，没有则提示请先选择开工日期
            if (costStartDate !== undefined && costStartDate !== '') {
              const begin = new Date(costStartDate);
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
        test: '造价列表',
        value:'',
        dialogVisible: false,
        centerDialogVisible:false,
        page:{
          pageSize: 10,
          currentPage: 1,
          total: 0
        },
        query: {
          projectId: ''
        },
        form: {
          programmeId: '',
          programmeCode: ''
        },
        projectAttachList: [],//附件集合
        data:[],
        contractList:[],//合同列表
        conceptualList: [],//方案列表
        mergerForm:[],
        contractForm:{
          contractIds:''
        },
        costListOption:{
          updateBtn: true,
          index: true,
          indexLabel:'序号',
          selection: true,
          tip: false,
          size:'mini',
          border:true,
          align:'center',
          viewBtn:true,
          dialogDrag:true,
          dialogWidth:'45%',
          dialogTop:15,
          searchLabelWidth:100,
          labelWidth: 110,
          searchSpan: 8,
          searchMenuSpan: 6,
          column:[
            {
              label:"方案设计名称",
              prop:"programmeId",
              rules: [
                {
                  required: true,
                  message: "请选择方案设计名称",
                  trigger: "change"
                }
              ],
              search: true,
              type: 'select',
              dicData: [],
              width: 110,
              editDisabled:true
            },
            {
              label:"方案设计编码",
              prop:"programmeCode",
              placeholder:"自动读取",
              hide: true,
              editDisabled:true
            },
            {
              label: '造价人',
              prop:"updateUser",
              dicUrl: '/api/blade-user/userNameList',
              props: {
                label: "name",
                value: "id"
              },
              type: 'select',
              search: true,
              addDisplay: false
            },
            {
              label:"造价开始时间",
              prop: "costStartDate",
              type: 'date',
              valueFormat: 'yyyy-MM-dd',
              format: 'yyyy-MM-dd',
              search: true,
              width: 150
            },
            {
              label:"造价结束时间",
              prop: "costEndDate",
              rules: [
                {
                  validator: checkCostDate,
                  trigger: "change"
                }],
              type: 'date',
              valueFormat: 'yyyy-MM-dd',
              format: 'yyyy-MM-dd',
              search: true,
              width: 150
            },
            {
              label: '造价编码',
              prop:"costCode",
              rules: [
                {
                  required: true,
                  message: "请输入造价编码",
                  trigger: "change"
                }
              ],
            },
            {
              label: "造价金额",
              prop: "costMoney",
              rules: [{
                validator: checkNumber,
                trigger: "change"
              }],
              append: '万元'
            },
            {
              label: "内容及问题",
              prop: "content",
              type: 'textarea',
              hide: true,
              span: 24
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
        },
        attachOnly: false
      }
    },
    watch:{
      'projectId': function (newVal, oldVal) {
        if (newVal !== oldVal) {
          this.onLoad(this.page)
          this.initData()
        }
      },
      'contractForm.contractIds': {
        handler(newVal, oldVal) {
          if (newVal !== undefined && newVal !== oldVal) {
            for (const tempData of this.contractList) {
              if (tempData.id === newVal) {
                this.contractForm.contractCode = tempData.contractCode
              }
            }
          }
        },
        deep: true,
        immediate: true
      },
      'form.programmeId': {
        handler(newVal, oldVal) {
          if (newVal !== undefined && newVal !== oldVal) {
            for (const tempData of this.conceptualList) {
              if (tempData.id === newVal) {
                this.form.programmeCode = tempData.programmeCode
              }
            }
          }
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
      },
      //导入
      uploadHeaders() {
        return {
          'Authorization': 'Basic c2FiZXI6c2FiZXJfc2VjcmV0',
          'Blade-Auth': 'bearer ' + this.token
        }
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
        //方案列表
        getConceptualList(this.projectId).then(res => {
          this.conceptualList = res.data.data
          const dicData = []
          this.conceptualList.forEach(contract => {
            dicData.push({ value: contract.id, label: contract.programmeName })
          })
          this.costListOption.column[0].dicData = dicData
        })
      },
      rowSave(row, done, loading) {
        row['projectId'] = this.projectId
        row['projectAttachList'] = this.projectAttachList
        row['projectAttachList'].forEach(attach => {
          attach['createTime'] = ''
          attach['linkType'] = this.linkType
        })
        row['costMoney'] = Number(row['costMoney']) * 10000 * 100
        console.log(row);
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
        row['costMoney'] = Number(row['costMoney']) * 10000 * 100
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
      beforeOpen(done,type) {
        this.attachOnly = false
        if (["edit"].includes(type)) {
          getCostDetail(this.form.id).then(res => {
            this.form = res.data.data;
            this.form.costMoney = Number(this.form.costMoney) / 10000 / 100
            const sysUserId = JSON.parse(localStorage.getItem('saber-userInfo')).content.user_id
            if(this.form.createUser !== sysUserId){
              this.costListOption.updateBtn = false
              this.attachOnly = true
              this.$message.error('您没有权限修改')
            }else{
              this.costListOption.updateBtn = true
              this.attachOnly = false
              console.log('成功匹配')
            }
          });
        }
        if (type === 'add') {
          this.projectAttachList = []
        }
        if (["view"].includes(type)) {
          this.attachOnly = true
          getCostDetail(this.form.id).then(res => {
            this.form = res.data.data;
            this.form.costMoney = Number(this.form.costMoney) / 10000 / 100
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
        console.log(this.query)
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
        getCostList(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
          const data = res.data.data;
          this.page.total = data.total;
          this.data = data.records;
          for (const cost of this.data) {
            cost.costMoney = Number(cost.costMoney) / 10000 / 100
            console.log(cost);
          }
          this.loading = false;
          this.selectionClear();
        });
      },
      //成功导入
      handleSuccess(res) {
        this.$message.success(res.msg)
        this.refreshChange()
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

<style type="text/css" scoped>
  /*.importContract{*/
  /*  height: 20vh;*/
  /*  overflow: auto;*/
  /*}*/
</style>
