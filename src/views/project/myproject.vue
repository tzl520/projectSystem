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
               @search-change="searchChange"
               @search-reset="searchReset"
               @current-change="currentChange"
               @size-change="sizeChange"
               @refresh-change="refreshChange"
               @on-load="onLoad">
      <template slot="constructionNature" slot-scope="scope">
        <el-tag v-show="scope.row.constructionNature === '1'" type="success" :size="scope.size">{{scope.row.$constructionNature}}</el-tag>
        <el-tag v-show="scope.row.constructionNature === '2'" :size="scope.size">{{scope.row.$constructionNature}}</el-tag>
      </template>
      <template slot-scope="{type, size, row}" slot="menu">
        <el-button :size="size" :type="type" @click="goDetail(row)">详情</el-button>
        <el-button v-show="row.isProjectPersonLiable" :size="size" :type="type" @click="handleDel(row)">删除</el-button>
        <el-button v-show="!row.isProjectPersonLiable" :size="size" :type="type" disabled>删除</el-button>
      </template>
    </avue-crud>
  </basic-container>
</template>

<script>
import { getMyProjectList, remove } from "@/api/project/project";

export default {
  data() {
    return {
      form: {},
      query: {},
      loading: true,
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0
      },
      selectionList: [],
      option: {
        indexLabel:'序号',
        height:'auto',
        calcHeight: 30,
        tip: false,
        searchShow: true,
        searchMenuSpan: 6,
        border: true,
        addBtn: false,
        editBtn: false,
        delBtn: false,
        index: true,
        viewBtn: false,
        selection: false,
        size: 'mini',
        align:'center',
        dialogClickModal: false,
        menuWidth: 120,
        searchLabelWidth: 100,
        column: [
          {
            label: "项目代码",
            prop: "code",
            width: 90
          },
          {
            label: "项目名称",
            prop: "name",
            search: true
          },
          {
            label: "项目负责人",
            prop: "projectPersonLiableName",
            search: true,
            width: 100
          },
          {
            label: "项目阶段",
            prop: "stage",
            type: "select",
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=stage",
            props: {
              label: "dictValue",
              value: "dictKey"
            },
            search: true,
            width: 120
          },
          {
            label: "建设性质",
            prop: "constructionNature",
            type: "select",
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=construction_nature",
            props: {
              label: "dictValue",
              value: "dictKey"
            },
            width: 80,
            search: true,
            slot: true
          },
          {
            label: "项目性质",
            prop: "projectNature",
            type: "select",
            multiple: true,
            dicUrl: "/api/blade-system/dict-biz/dictionary?code=project_nature",
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
            search: true,
            width: 80
          },
          {
            label: "总投资(万元)",
            prop: "totalInvestment",
            width: 100
          },
          {
            label: "建设规模及描述",
            prop: "content"
          }
        ]
      },
      data: []
    };
  },
  methods: {
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
      getMyProjectList(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        this.data = data.records;
        this.data.map(row => {
          row.projectNature = row.projectNature.split(',')
          let totalInvestment = Number(row.totalInvestment) / 10000 / 100
          totalInvestment = String(totalInvestment).replace(/^(.*\..{4}).*$/,"$1")
          row.totalInvestment = Number(totalInvestment)
        })
        this.loading = false;
      });
    },
    goDetail(row) {
      // 前往详情页
      console.log("前往项目详情=============",row);
      this.$router.push({ path: '/myProject/detail/'+row.id, query: { name: row.name }})
    },
    handleDel(row) {
      // 删除项目
      if (row.isProjectPersonLiable) {
        this.$confirm("确定删除【" + row.name + "】项目吗?", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          remove(row.id).then(res => {
            const type = res.data.success ? 'success' : 'error'
            this.$message({
              type: type,
              message: res.data.msg
            });
            this.onLoad(this.page, this.query);
          })
        })
      } else {
        this.$confirm("抱歉，只有项目负责人才能删除！", {
          confirmButtonText: "确定",
          showCancelButton: false,
          closeOnClickModal: false,
          closeOnPressEscape: false,
          showClose: false,
          type: "warning"
        })
        return false
      }
    }
  }
};
</script>

<style>
</style>
