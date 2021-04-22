<template>
  <basic-container>
    <el-row>
      <avue-crud :data="data"
                 :option="contractListOption"
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
        <template slot="menuLeft">
          <el-button type="danger"
                     size="mini"
                     icon="el-icon-delete"
                     plain
                     @click="handleDelete">删 除
          </el-button>
        </template>
        <template slot="contractPaymentListForm" slot-scope="scope">
          <avue-crud :option="paymentOption" :data="form.contractPaymentList">
          </avue-crud>
        </template>
        <template slot="contractCollectionListForm" slot-scope="scope">
          <avue-crud :option="collectionsOption" :data="form.contractCollectionList">
          </avue-crud>
        </template>
        <template slot="contractProgressListForm" slot-scope="scope">
          <avue-crud :option="progressOption" :data="form.contractProgressList">
          </avue-crud>
        </template>
        <template slot="contractRelevanceForm" slot-scope="scope">
          <avue-crud :option="unitOption"
                     v-model="contractRelevanceForm"
                     ref="contractRelevanceForm"
                     :data="contractRelevanceData"
                     :page.sync="pageDetail"
                     @row-save="contractRelevanceSave"
                     @row-update="contractUpdate"
                     @row-del="contractRemove"
                     @current-change="contractRelevanceCurrentChange"
                     @size-change="contractRelevanceSizeChange"
                     @refresh-change="contractRelevanceOnload">
          </avue-crud>
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
<<<<<<< HEAD
  import projectUpload from "@/components/file-upload/project-upload";
=======
import projectUpload from "@/components/file-upload/project-upload";
>>>>>>> 02ebf0b... 修改合同列表附件
  import {getContractPage, getDetail, add, update, remove} from '@/api/project/contract'
  import {
    getContractRelevancePage,
    contractRelevanceAdd,
    contractRelevanceUpdate,
    contractRelevanceRemove
  } from '@/api/project/contractRelevance'
  import {getBinddingList} from '@/api/project/bidding'
  import {mapGetters} from "vuex";
  //<!---->
  export default {
    components: {projectUpload},
    name: "ContractList",
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
      // //校验联系电话
      // const constReg = (rule, value, callback) => {
      //   const phoneExp = /^((0\d{2,3}-\d{7,8})|(1[3584]\d{9}))$/;
      //   setTimeout(() => {
      //     if (value !== undefined && value !== '') {
      //       if ((!phoneExp.test(value)) && value !== '') {
      //         callback(new Error('请输入正确的格式！'));
      //       } else {
      //         callback();
      //       }
      //     } else {
      //       callback()
      //     }
      //   }, 100)
      // }
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
      // 校验履行开始日期必须在合同签订日期之后 方法规则
      const checkContractSigningDate = (rule, value, callback) => {
        setTimeout(() => {
          // 只有当竣工日期选择了之后才进行校验
          if (value !== undefined && value !== '') {
            // 获取签订日期
            const {contractSigningDate} = this.form
            // 判断是否已经选择了开工日期，没有则提示请先选择开工日期
            if (contractSigningDate !== undefined && contractSigningDate !== '') {
              const begin = new Date(contractSigningDate);
              const end = new Date(value);
              if (end - begin < 0) {
                callback(new Error('履行开始日期必须在签订日期之后'))
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
      // 校验履行结束日期必须在开始日期之后 方法规则
      const checkContractEndDate = (rule, value, callback) => {
        setTimeout(() => {
          // 只有当竣工日期选择了之后才进行校验
          if (value !== undefined && value !== '') {
            // 获取开始日期
            const {contractStartDate} = this.form
            // 判断是否已经选择了开工日期，没有则提示请先选择开工日期
            if (contractStartDate !== undefined && contractStartDate !== '') {
              const begin = new Date(contractStartDate);
              const end = new Date(value);
              if (end - begin < 0) {
                callback(new Error('履行结束日期必须在开始日期之后'))
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
        test: '合同管理',
        page: {
          pageSize: 10,
          currentPage: 1,
          total: 0
        },
        linkType: 'contractList',
        query: {
          projectId: ''
        },
        queryPeople: {contractRelevanceId: ''},
        form: {
          projectId: '',
          contractPaymentList: [],
          contractCollectionList: [],
          contractProgressList: [],
          biddingId: '',
          contractMethod: ''
        },
        contractRelevanceForm: {}, //合同相关方
        contractRelevanceData: [],
        pageDetail: {
          pageSize: 10,
          currentPage: 1,
          total: 0,
          layout: ' total, prev, pager, next'
        },
        projectAttachList: [],//附件集合
        selectionList: [],
        biddingList: [],//招标列表
        data: [],
        contractListOption: {
          index: true,
          indexLabel: '序号',
          // indexWidth:40,
          selectionWidth: 40,
          addTitle: '添加合同',
          dialogDrag: true,
          dialogTop: 15,
          dialogWidth: '55%',
          dialogHeight: 600,
          columnBtn: false,
          selection: true,
          tip: false,
          align: 'center',
          border: true,
          labelWidth: 140,
          delBtn: false,
          viewBtn: true,
          size: 'mini',
          searchMenuSpan: 6,
          searchLabelWidth: 80,
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
              hide: true,
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
              label: "关联招标",
              prop: "biddingId",
              filterable: true,
              type: 'select',
              dicData: [],
              editDisabled: true
            },
            {
              label: '发包方式',
              prop: 'contractMethod',
              type: 'select',
              editDisabled: true,
              hide: true,
              dicUrl: "/api/blade-system/dict-biz/dictionary?code=contract_method",
              props: {
                label: "dictValue",
                value: "dictKey"
              },
            },
            {
              label: "合同名称",
              prop: "contractName",
              rules: [{
                required: true,
                validator: inputContentReg,
                trigger: "change",
              }],
              search: true
            },
            {
              label: "合同码",
              prop: "contractCode",
              rules: [{
                required: true,
                validator: inputContentReg,
                trigger: "change",
              }],
              search: true
            },
            {
              label: "合同类型",
              prop: "contractType",
              search: true,
              type: "select",
              dicUrl: "/api/blade-system/dict-biz/dictionary?code=contract_type",
              props: {
                label: "dictValue",
                value: "dictKey"
              },
            },
            {
              label: "合同方式",
              prop: "contractWay",
              search: true,
              type: "select",
              dicUrl: "/api/blade-system/dict-biz/dictionary?code=contract_mode",
              props: {
                label: "dictValue",
                value: "dictKey"
              },
            },
            {
              label: "合同金额",
              prop: "contractPrice",
              rules: [
                {
                  required: true,
                  message: "请输入合同金额",
                  trigger: "blur"
                },
                {
                  validator: checkNumber,
                  trigger: "blur"
                }
              ],
              append: '万元'
            },
            {
              label: "合同状态",
              prop: "contractorStatus",
              type: 'select',
              width: 70,
              dicData: [
                {value: "临时合同"},
                {value: "有效合同"}
              ]
            },
            {
              label: '',
              labelWidth: 10,
              prop: 'divider',
              component: 'elDivider',//ele分割线
              span: 24,
              hide: true
              // editDisplay: false,
              // addDisplay: false,
            },
            // {
            //   label: "建设单位",
            //   prop: "constructionUnit",
            //   rules: [{
            //     required: true,
            //     validator:inputContentReg,
            //     trigger: "change",
            //   }]
            // },
            // {
            //   label: "建设单位联系人",
            //   prop: "constructionUnitContacts",
            //   rules: [{
            //     required: true,
            //     validator:inputContentReg,
            //     trigger: "change",
            //   }],
            //   hide:true
            // },
            // {
            //   label: "联系电话",
            //   prop: "constructionUnitPhone",
            //   rules: [{
            //     required: true,
            //     validator:constReg,
            //     trigger: "change",
            //   }],
            //   hide: true
            // },
            {
              label: "签订时间",
              prop: "contractSigningDate",
              type: 'date',
              valueFormat: 'yyyy-MM-dd',
              format: 'yyyy-MM-dd',
              width: 85,
              search: true
            },
            {
              label: "付款条件",
              prop: "contractTermPayment",
              rules: [{
                validator: inputContentReg,
                trigger: "change",
              }]
            },
            {
              label: "是否合同结算",
              prop: "isContractSettlement",
              hide: true,
              type: 'select',
              dicUrl: "/api/blade-system/dict-biz/dictionary?code=is_whether",
              props: {
                label: "dictValue",
                value: "dictKey"
              },
            },
            {
              label: "合同履行开始时间",
              prop: "contractStartDate",
              type: 'date',
              rules: [
                {
                  validator: checkContractSigningDate,
                  trigger: "change"
                }
              ],
              valueFormat: 'yyyy-MM-dd',
              format: 'yyyy-MM-dd',
              hide: true
            },
            {
              label: "合同履行结束时间",
              prop: "contractEndDate",
              rules: [
                {
                  validator: checkContractEndDate,
                  trigger: "change"
                }
              ],
              type: 'date',
              valueFormat: 'yyyy-MM-dd',
              format: 'yyyy-MM-dd',
              hide: true
            },
            {
              label: "是否缴纳保证金",
              prop: "isDeposit",
              hide: true,
              type: 'select',
              dicUrl: "/api/blade-system/dict-biz/dictionary?code=is_whether",
              props: {
                label: "dictValue",
                value: "dictKey"
              },
            },
            {
              label: "支付事项",
              prop: "contractPaymentMatters",
              rules: [{
                validator: inputContentReg,
                trigger: "change",
              }],
              hide: true
            },
            {
              label: "支付方式",
              prop: "contractPaymentType",
              hide: true
            },
            {
              label: '',
              labelWidth: 10,
              prop: 'divider',
              component: 'elDivider',//ele分割线
              params: {
                html: '<p style="font-size: 18px">合同进度</p>',
                contentPosition: "left",
              },
              hide: true,
              span: 24,
              addDisplay: false
            },
            {
              labelWidth: 0,
              label: '',
              prop: 'contractProgressList',
              span: 24,
              hide: true,
              formslot: true,
              addDisplay: false
            },
            {
              label: '',
              labelWidth: 10,
              prop: 'divider',
              component: 'elDivider',//ele分割线
              params: {
                html: '<p style="font-size: 18px">支付情况</p>',
                contentPosition: "left",
              },
              hide: true,
              span: 24,
              addDisplay: false
            },
            {
              labelWidth: 0,
              label: '',
              prop: 'contractPaymentList',
              span: 24,
              hide: true,
              formslot: true,
              addDisplay: false
            },
            {
              label: '',
              labelWidth: 10,
              prop: 'divider',
              component: 'elDivider',//ele分割线
              params: {
                html: '<p style="font-size: 18px">收款情况</p>',
                contentPosition: "left",
              },
              hide: true,
              span: 24,
              addDisplay: false
            },
            {
              labelWidth: 0,
              label: '',
              prop: 'contractCollectionList',
              span: 24,
              hide: true,
              formslot: true,
              addDisplay: false
            },
            {
              label: '',
              labelWidth: 10,
              prop: 'divider',
              component: 'elDivider',//ele分割线
              params: {
                html: '<p style="font-size: 18px">合同相关方</p>',
                contentPosition: "left",
              },
              hide: true,
              span: 24,
              editDisplay: false,
              addDisplay: false
            },
            {
              labelWidth: 0,
              label: '',
              prop: 'contractRelevance',
              span: 24,
              hide: true,
              formslot: true
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
        },
        progressOption: {
          header: false,
          border: true,
          editBtn: false,
          delBtn: false,
          viewBtn: true,
          menuWidth: 80,
          labelWidth: 100,
          dialogWidth: '40%',
          dialogHeight: 450,
          dialogTop: 20,
          align: 'center',
          column: [
            {
              label: "进度日期",
              prop: "progressDate",
              type: 'date'
            },
            {
              label: "计划投资",
              prop: "planInvestment",
              rules: [
                {
                  message: "请输入数字",
                  trigger: "blur"
                },
                {
                  validator: checkNumber,
                  trigger: "blur"
                }
              ],
              append: '万元'
            },
            {
              label: "计划形象进度",
              prop: "planImageProgress",
              type: 'textarea',
              overHidden: true,
              span: 24
            },
            {
              label: "总结完成投资",
              prop: "summarizeCompleteInvestment",
              rules: [
                {
                  message: "请输入数字",
                  trigger: "blur"
                },
                {
                  validator: checkNumber,
                  trigger: "blur"
                }
              ],
              append: '万元'
            },
            {
              label: "总结形象进度",
              prop: "summarizeImageProgress",
              type: 'textarea',
              overHidden: true,
              span: 24
            },
          ]
        },
        paymentOption: {
          header: false,
          border: true,
          editBtn: false,
          delBtn: false,
          viewBtn: true,
          menuWidth: 80,
          dialogWidth: '40%',
          dialogHeight: 450,
          dialogTop: 20,
          align: 'center',
          column: [
            {
              label: "支付人",
              prop: "paymentPerson",
            },
            {
              label: "支付方式",
              prop: "paymentMode",
            },
            {
              label: "支付金额",
              prop: "paymentMoney",
              append: '万元'
            },
            {
              label: "未支付金额",
              prop: "unpaidMoney",
              append: '万元'
            },
            {
              label: "支付时间",
              prop: "paymentDate",
              type: 'date',
            },
            {
              label: "支付事项",
              prop: "paymentMatters",
              type: 'textarea',
              span: 24
            },
            {
              label: "疑难问题",
              prop: "problem",
              type: 'textarea',
              span: 24
            },
          ]
        },
        collectionsOption: {
          header: false,
          border: true,
          editBtn: false,
          delBtn: false,
          viewBtn: true,
          menuWidth: 80,
          dialogTop: 20,
          align: 'center',
          column: [
            {
              label: "收款人",
              prop: "payee"
            },
            {
              label: "收款方式",
              prop: "collectionMethod"
            },
            {
              label: "收款金额",
              prop: "collectionMoney",
              append: '万元',
            },
            {
              label: "收款时间",
              prop: "collectionDate",
              searchFilterable: true,
              type: 'date'
            },
            {
              label: "收款事项",
              prop: "collectionItems"
            }
          ]
        },
        unitOption: {
          addBtn: true,
          editBtn: true,
          // addRowBtn:true,
          addBtnText: '添加合同相关方',
          // cellBtn:true,
          viewDisabled: true,
          border: true,
          dialogWidth: '40%',
          size: 'mini',
          labelWidth: 100,
          column: [
            {
              label: '单位名称',
              prop: 'unitName',
              rules: [{
                required: true,
                validator: inputContentReg,
                trigger: "change",
              }]
            },
            {
              label: '单位联系人',
              prop: 'unitContact',
              rules: [{
                required: true,
                validator: inputContentReg,
                trigger: "change",
              }]
            },
            {
              label: '联系方式',
              prop: 'contactMobile',
              rules: [{
                required: true,
                trigger: "change",
              }]
            },
            {
              label: '单位类型',
              prop: 'unitType',
              type: "select",
              dicUrl: "/api/blade-system/dict-biz/dictionary?code=project_unit_type",
              props: {
                label: "dictValue",
                value: "dictKey"
              }
            },
            {
              label: '备注',
              prop: 'remarks',
              rules: [{
                validator: inputContentReg,
                trigger: "change",
              }],
              span: 24
            }
          ]
        },
        attachOnly: false
      }
    },
    watch: {
      //监听招标带出发包方式
      'projectId': function (newVal, oldVal) {
        if (newVal !== oldVal) {
          this.onLoad(this.page)
          this.initData()
        }
      },
      'form.biddingId': {
        handler(newVal, oldVal) {
          if (newVal !== undefined && newVal !== oldVal) {
            for (const tempData of this.biddingList) {
              if (tempData.id === newVal) {
                this.form.contractMethod = tempData.contractMethod
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
        //关联招标
        getBinddingList(this.projectId).then(res => {
          this.biddingList = res.data.data
          console.log("=============", this.biddingList)
          const dicData = []
          this.biddingList.forEach(bidding => {
            dicData.push({value: bidding.id, label: bidding.biddingName})
          })
          this.contractListOption.column[5].dicData = dicData
        })
      },
      beforeOpenDialog(done, type) {
        // 表单打开前方法
        this.attachOnly = false
        if (this.projectData !== undefined) {
          this.form['projectName'] = this.projectData['name']
          this.form['projectId'] = this.projectData['id']
          this.form['stage'] = this.projectData['stage']
          this.form['classification'] = this.projectData['classification']
          this.form['code'] = this.projectData['code']
        }
        this.unitOption.menu = false
        this.unitOption.columnBtn = false
        this.unitOption.refreshBtn = false
        this.unitOption.header = true
        this.unitOption.addBtn = true
        if (["view"].includes(type)) {
          this.attachOnly = true
          this.unitOption.header = false
        }
        if (type === 'add') {
          this.projectAttachList = []
        }
        if (["edit"].includes(type)) {
          this.unitOption.menu = true
          this.unitOption.refreshBtn = true
          getDetail(this.form.id).then(() => {
            const localUserId = JSON.parse(localStorage.getItem('saber-userInfo')).content.user_id
            if (this.form.createUser !== localUserId) {
              this.$message.error('您没有权限修改')
              this.contractListOption.updateBtn = false
              this.unitOption.addBtn = false
              console.log('00909998978',this.form , localUserId)
            } else {
              this.contractListOption.updateBtn = true
            }
          })
        }
        if (["add"].includes(type)) {
          this.projectAttachList = []
          this.unitOption.menu = true
          this.contractRelevanceData = []
        } else {
          getDetail(this.form.id).then(res => {
            this.form = Object.assign(this.form, res.data.data.detail)
            this.form.contractPrice = Number(this.form.contractPrice) / 10000 / 100
            this.contractRelevanceData = res.data.data.contractRelevances || []
          });
        }
        done()
      },
      rowUpdate(row, index, done, loading) {
        row['contractPrice'] = Number(row['contractPrice']) * 10000 * 100
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
      rowSave(row, done, loading) {
        row['projectId'] = this.projectId
        row['projectAttachList'] = this.projectAttachList
        row['projectAttachList'].forEach(attach => {
          attach['createTime'] = ''
          attach['linkType'] = this.linkType
        })
        row['contractPrice'] = Number(row['contractPrice']) * 10000 * 100
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
        getContractPage(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
          const data = res.data.data;
          this.page.total = data.total;
          this.data = data.records;
          for (const contractList of this.data) {
            contractList.contractPrice = Number(contractList.contractPrice) / 10000 / 100
          }
          // console.log(this.data)
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
      },
      //合同相关方列表加载
      contractRelevanceOnload() {
        this.loading = true;
        this.query.projectId = this.projectId
        if (this.form.id !== undefined && this.form.id !== '') {
          // 编辑查看合同表单 中合同相关方刷新方法
          const query = {
            projectId: this.projectId,
            contractId: this.form.id
          }
          getContractRelevancePage(this.pageDetail.currentPage, this.pageDetail.pageSize, query).then(res => {
            const data = res.data.data;
            this.pageDetail.total = data.total;
            this.contractRelevanceData = data.records;
            this.loading = false;
          });
        } else {
          // 新增查看合同表单 中合同相关方刷新方法
          this.loading = false;
        }
      },
      contractRelevanceSave(row, done, loading) {
        row['projectId'] = this.projectId
        row['contractId'] = this.form.id || ''
        contractRelevanceAdd(row).then((res) => {
          if (this.form.id !== undefined && this.form.id !== '') {
            // 编辑合同中增加合同相关方
            this.contractRelevanceOnload(this.pageDetail);
            this.$message({
              type: "success",
              message: "操作成功!"
            });
            done();
          } else {
            // 新增合同中增加合同相关方
            this.contractRelevanceData.push(res.data.data)
            done()
          }

        }, error => {
          loading();
          window.console.log(error);
        });
      },
      contractRemove(row, index, done, loading) {
        // if (this.form.id === undefined || this.form.id === '') {
        //   this.contractRelevanceData.splice(index, 0)
        // }
        contractRelevanceRemove(row.id).then(() => {
          this.contractRelevanceOnload(this.pageDetail)
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
      contractUpdate(row, index, done, loading) {
        contractRelevanceUpdate(row).then(() => {
          this.contractRelevanceOnload(this.pageDetail);
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
      contractRelevanceSizeChange(pageSize) {
        this.pageDetail.pageSize = pageSize;
      },
      contractRelevanceCurrentChange(currentPage) {
        this.pageDetail.currentPage = currentPage;
      }
    }
  }
</script>

<style scoped>
</style>
