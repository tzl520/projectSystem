<template>
  <basic-container>
    <avue-crud :option="option"
               :table-loading="loading"
               :data="data"
               :page.sync="page"
               :permission="permissionList"
               v-model="projectInfoForm"
               ref="crud"
               @search-change="searchChange"
               @search-reset="searchReset"
               @selection-change="selectionChange"
               @current-change="currentChange"
               @size-change="sizeChange"
               @refresh-change="refreshChange"
               @on-load="onLoad">
      <template slot="classification" slot-scope="scope">
        <el-tag v-show="scope.row.classification === '1'" type="success" :size="scope.size">{{scope.row.$classification}}</el-tag>
        <el-tag v-show="scope.row.classification === '2'" type="info" :size="scope.size">{{scope.row.$classification}}</el-tag>
        <el-tag v-show="scope.row.classification === '3'" type="primary" :size="scope.size">{{scope.row.$classification}}</el-tag>
        <el-tag v-show="scope.row.classification === '4'" type="warning" :size="scope.size">{{scope.row.$classification}}</el-tag>
      </template>
      <template slot-scope="{type, size, row}" slot="menu">
        <el-button :size="size" :type="type" @click="showGiveFormDialog(row.id)">展开</el-button>
      </template>
      <template slot="menuLeft">
        <el-button size="mini" type="success" v-if="dataList.length>0" icon="el-icon-upload2" plain @click="exportExcel()">导出</el-button>
        <el-button size="mini" type="success" v-else icon="el-icon-upload2" plain @click="tipClick()">导出</el-button>
      </template>
    </avue-crud>
    <el-dialog
      :visible.sync="dialogVisible"
      width="60%"
      :modal="false"
      :close-on-click-modal="false"
    >
      <avue-form :option="dialogFormOption" v-model="dialogForm" ref="dialogForm" :data="dialogData">
      </avue-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="mini">取 消</el-button>
      </span>
    </el-dialog>
  </basic-container>
</template>

<script>
import {mapGetters} from "vuex";
import {getProjectNameGetAll, getProjectSummaryList, getProjectSummaryOpen} from "@/api/project/projectReportForm";
import axios from 'axios';
import fileDownload from 'js-file-download';
export default {
  name: '',
  components: {},
  props: {},
  data() {
    return {
      dataList: [],
      loading: true,
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0
      },
      dialogForm: {},
      dialogData:[],
      dialogVisible: false,
      searchCondition: {},
      dialogFormOption: {
        menu: false,
        submitBtn: false,
        emptyBtn: false,
        addBtn: false,
        labelWidth:180,
        readonly: true,
        placeholder: '',
        column: [
          {
            label: "成员",
            prop: "member",
            placeholder: ' ',
          },
          {
            label: "使用单位",
            prop: "useUnit",
            placeholder: ' ',
          },
          {
            label: "验收时间",
            prop: "acceptCheckTime",
            type: 'date',
            placeholder: ' ',
          },
          {
            label: "合同金额",
            prop: "contractMoney",
            placeholder: ' ',
            append: '万元',
          },
          {
            label: "财评金额",
            prop: "reviewMoney",
            placeholder: ' ',
            append: '万元',
          },
          {
            label: "建设合同金额",
            placeholder: ' ',
            prop: "buildContractMoney",
            append: '万元',
          },
          {
            label: "建设合同结算金额",
            placeholder: ' ',
            prop: "contractSettlementMoney",
            append: '万元',
          },
          {
            label: "项目决算金额",
            placeholder: ' ',
            prop: "finalAccountsMoney",
            append: '万元',
          },
        ]
      },
      uploadHeaders: {},
      projectNameData: [],
      projectInfoForm: {
        parentId: ''
      },
      option: {
        height: 'auto',
        tip: false,
        menuWidth: 100,
        searchMenuSpan: 6,
        border: true,
        delBtn: false,
        viewBtn: false,
        index: true,
        editBtn: false,
        indexLabel: '序号',
        selection: true,
        addBtn: false,
        size: 'mini',
        align: 'center',
        dialogClickModal: false,
        column: [
          {
            label: "项目名称",
            prop: "projectId",
            search: true,
            type: 'select',
            hide: true,
            width: 120,
            searchFilterable: true,
            dicData: [],
          },
          {
            label: "项目名称",
            prop: "name",
          },
          {
            label: "项目代码",
            prop: "code",
          },
          {
            label: "项目分类",
            prop: "classification",
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=project_classification",
            props: {
              label: "dictValue",
              value: "dictKey"
            },
            slot: true
          },
          {
            label: "项目阶段",
            prop: "stage",
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=stage",
            props: {
              label: "dictValue",
              value: "dictKey"
            },
          },
          {
            label: "项目概算",
            prop: "budgetEstimate",
          },
          {
            label: "项目总投资",
            prop: "totalInvestment",
          },
          {
            label: "项目负责人",
            prop: "projectPersonLiable",
            dicUrl: '/api/blade-user/userNameList',
            props: {
              label: "name",
              value: "id"
            },
          },
          {
            label: "立项日期",
            prop: "commencementDate",
            type: 'datetime',
            format: 'yyyy-MM-dd',
            valueFormat: 'yyyy-MM-dd',
            searchSpan:12,
            searchRange:true,
            search: true
          }
        ]
      }
    }
  },
  mounted() {
    this.initData()
  },
  watch: {
    'projectInfoForm.parentId': {
      handler(newVal, oldVal) {
        if (newVal !== undefined && newVal !== oldVal) {
          for (const tempData of this.projectNameData) {
            if (tempData.id === newVal) {
              this.projectInfoForm.name = tempData.title
              break
            }
          }
        }
      },
      deep: true,
      immediate: true
    },
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
  methods: {
    // 初始化数据
    initData() {
      getProjectNameGetAll().then(res => {
        this.option.column[1].dicData = []
        this.projectNameData = res.data.data
        for (const data of this.projectNameData) {
          this.option.column[0].dicData.push({value: data.id, label: data.name})
        }
      })
    },
    //展开其它
    showGiveFormDialog(projectId) {
      this.dialogVisible = true
      getProjectSummaryOpen(projectId).then(res => {
        const data = res.data.data
        this.dialogForm = data
        this.dialogForm['reviewMoney'] = Number(this.dialogForm['reviewMoney']) / 10000 / 100
        this.dialogForm['buildContractMoney'] = Number(this.dialogForm['buildContractMoney']) / 10000 / 100
        this.dialogForm['finalAccountsMoney'] = Number(this.dialogForm['finalAccountsMoney']) / 10000 / 100
        this.dialogForm['contractMoney'] = Number(this.dialogForm['contractMoney']) / 10000 / 100
        this.dialogForm['contractSettlementMoney'] = Number(this.dialogForm['contractSettlementMoney']) / 10000 / 100
      })
    },
    searchReset() {
      this.query = {};
      this.onLoad(this.page);
      this.searchCondition = {}
    },
    searchChange(params, done) {
      this.query = params;
      if(params.commencementDate !== undefined && params.commencementDate.length === 2){
        this.query['startTime'] = params.commencementDate[0]
        this.query['endTime'] = params.commencementDate[1]
      }
      this.query.commencementDate = undefined
      params.commencementDate = undefined
      this.searchCondition = params
      this.onLoad(this.page,params)
      done();
    },
    selectionChange(list) {
      this.selectionList = list;
    },
    selectionClear() {
      this.selectionList = [];
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
      getProjectSummaryList(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        this.data = data.records;
        this.dataList = data.records
        console.log(this.dataList)
        for(const money of this.data){
          money['budgetEstimate'] = Number(money['budgetEstimate']) / 10000 / 100
          money['totalInvestment'] = Number(money['totalInvestment']) / 10000 / 100
        }
        this.loading = false;
        this.selectionClear();
      });
    },
    //导出
    exportExcel(){
      const condition = Object.assign({}, this.searchCondition)
      console.log(condition)
      if(condition.projectId === undefined && condition.startTime !== undefined){
        console.log('1')
        this.startTime = condition.startTime
        this.endTime = condition.endTime
        this.projectId = ''
        console.log(this.projectId,this.startTime,this.endTime)
      }else if(condition.startTime === undefined && condition.projectId !== undefined) {
        console.log('2222')
        this.projectId = condition.projectId
        this.startTime = ''
        this.endTime = ''
        console.log(this.projectId,this.startTime,this.endTime)
      }else if(condition.endTime !== undefined && condition.projectId !== undefined){
        this.projectId = condition.projectId
        console.log('3')
        this.startTime = condition.startTime
        this.endTime = condition.endTime
        console.log(this.projectId,this.startTime,this.endTime)
      }else{
        console.log('4')
        this.projectId = ''
        this.startTime = ''
        this.endTime  = ''
        console.log(this.projectId,this.startTime,this.endTime)
      }
      const params = {
        projectId: this.projectId,
        startTime: this.startTime,
        endTime: this.endTime
      }
      const filName = '项目产值统计报表文件'
      axios.get('/api/project-manager/projectReport/exportOutputValue',{
        responseType: 'blob',
        params: params
      }).then(res => {
        console.log(res)
        fileDownload(res.data, filName + '.xlsx')
      })
    },
    tipClick(){
      this.$message.info('暂无导出数据')
    }
  }
}
</script>

<style scoped lang="less">

</style>
