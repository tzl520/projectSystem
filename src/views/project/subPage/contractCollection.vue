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
  import {getContractCollectionList, getDetail, add, update, remove} from '@/api/project/contractCollection'
  import {getContractList} from '@/api/project/contract'
  import projectUpload from "@/components/file-upload/project-upload";
  import {mapGetters} from "vuex";

  export default {
    name: "contractCollection",
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
      return {
        form: {
          contractId: '',
          contractCode: ''
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
        contractListData: [],
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
          updateBtn: true,
          column: [
            {
              label: "合同名称",
              prop: "contractId",
              type: 'select',
              search: true,
              filterable: true,
              editDisabled: true,
              searchFilterable: true,
              dicData: []
            },
            {
              label: "合同码",
              prop: "contractCode",
              searchFilterable: true,
              editDisabled: true,
              addDisabled: true,
              placeholder: '自动读取',
              hide: true,
            },
            {
              label: "收款人",
              prop: "payee",
              rules: [{
                required: true,
                validator: inputContentReg,
                trigger: "change",
              }],
              search: true
            },
            {
              label: "收款方式",
              prop: "collectionMethod",
              rules: [{
                required: true,
                validator: inputContentReg,
                trigger: "change",
              }],
              search: true
            },
            {
              label: "收款金额",
              prop: "collectionMoney",
              rules: [
                {
                  required: true,
                  message: "请输入支付金额",
                  trigger: "blur"
                },
                {
                  validator: checkNumber,
                  trigger: "blur"
                }
              ],
              append: '万元',
            },
            {
              label: "收款时间",
              prop: "collectionDate",
              searchFilterable: true,
              type: 'date',
              valueFormat: 'yyyy-MM-dd',
              format: 'yyyy-MM-dd',
              search: true
            },
            {
              label: "收款事项",
              prop: "collectionItems",
              type: 'textarea',
              overHidden: true,
              rules: [{
                validator: inputContentReg,
                trigger: "change",
              }],
              span: 24
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
        attachOnly: false,
        data: []
      };
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
    watch: {
      'form.contractId': {
        handler(newVal, oldVal) {
          if (newVal !== undefined && newVal !== oldVal) {
            for (const tempData of this.contractListData) {
              if (tempData.id === newVal) {
                this.form.contractCode = tempData.contractCode
              }
            }
          }
        },
        deep: true,
        immediate: true
      }
    },
    mounted() {
      if (this.projectId === undefined || this.projectId.trim() === ''){
        this.projectId = this.$route.params.projectId
      }
      this.initData()
    },
    methods: {
      initData() {
        getContractList(this.projectId).then(res => {
          this.contractListData = res.data.data
          const dicData = []
          this.contractListData.forEach(contract => {
            dicData.push({ value: contract.id, label: contract.contractName })
          })
          this.option.column[0].dicData = dicData
        })
      },
      rowSave(row, done, loading) {
        row['projectId'] = this.projectId
        row['projectAttachList'] = this.projectAttachList
        row['projectAttachList'].forEach(attach => {
          attach['createTime'] = ''
          attach['linkType'] = this.linkType
        })
        row['collectionMoney'] = Number(row['collectionMoney']) * 10000 * 100
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
        row['collectionMoney'] = Number(row['collectionMoney']) * 10000 * 100
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
        this.attachOnly = false
        if (["view"].includes(type)) {
          this.attachOnly = true
          getDetail(this.form.id).then(res => {
            this.form = res.data.data;
            this.form.collectionMoney = Number(this.form.collectionMoney) / 10000 / 100
          });
        }
        if (["edit"].includes(type)) {
          getDetail(this.form.id).then(res => {
            this.form = res.data.data;
            this.form.collectionMoney = Number(this.form.collectionMoney) / 10000 / 100
            const sysUserId = JSON.parse(localStorage.getItem('saber-userInfo')).content.user_id
            if( this.form.createUser !== sysUserId){
              this.option.updateBtn = false
              this.$message.error('您没有权限修改')
            }else{
              this.option.updateBtn = true
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
        getContractCollectionList(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
          const data = res.data.data;
          this.page.total = data.total;
          this.data = data.records;
          for (const contract of this.data) {
            contract.collectionMoney = Number(contract.collectionMoney) / 10000 / 100
          }
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
