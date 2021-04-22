<template>
  <basic-container>
    <el-row>
      <avue-crud :data="data"
                 :option="mergedContractOption"
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
      </avue-crud>
    </el-row>
  </basic-container>
</template>

<script>

export default {
  name: "MergedContract",
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
    return {
      test: '已归并合同',
      page:{
        pageSize: 10,
        currentPage: 1,
        total: 0
      },
      query: {
        projectId: ''
      },
      form: {
        projectId: ''
      },
      data:[],
      mergedContractOption:{
        size:'mini',
        border:true,
        align:'center',
        searchLabelWidth:90,
        menuWidth:100,
        dialogDrag:true,
        dialogWidth:'45%',
        dialogTop:15,
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
              required: true,
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
            label:"合同码",
            prop:"contractCode",
            search: true
          },
          {
            label: "合同名称",
            prop: "contractName",
            search:true
          },
          {
            label: "造价批次号",
            prop: "costBatchIds",
          },
          {
            label: "造价类型",
            prop: "costType",
            search:true
          },
          {
            label: "造价名称",
            prop: "costName",
            search:true
          },
          {
            label: "概算大类数",
            prop: "estimateMaxCategory",
            search:true
          },
          {
            label: "概数小类数",
            prop: "estimateMinCategory",
            search:true
          },
          {
            label: "概算总金额",
            prop: "totalEstimatedAmount",
          },
          {
            label: "合同价",
            prop: "contractPrice",
          },
          {
            label: "结算价",
            prop: "settlementPrice",
          },
          {
            label: "结余",
            prop: "costBalance",
          },
          {
            label: "状态",
            prop: "costStatus",
          },
          {
            label: "创建时间",
            prop: "createTime",
          }
        ]
      }
    }
  },
  mounted() {
    if (this.projectId === undefined || this.projectId.trim() === ''){
      this.projectId = this.$route.params.projectId
    }
  },
  methods:{

  }
}
</script>

<style scoped>

</style>
