<template>
  <basic-container>
    <el-row>
      <el-col :span="4" style="border-right: 1px solid #DCDFE6">
        <el-menu
          default-active="projectInfo"
          class="el-menu-project"
          :unique-opened="true"
          @select="handleSelect">
          <el-menu-item index="projectInfo">
            <span slot="title">基本信息</span>
          </el-menu-item>
          <el-submenu index="nodePlan">
            <template slot="title">
              <span>节点计划</span>
            </template>
            <el-menu-item index="planList">计划列表</el-menu-item>
            <el-menu-item index="gantt">甘特图</el-menu-item>
          </el-submenu>
          <el-submenu index="conceptualDesign">
            <template slot="title">
              <span>方案设计</span>
            </template>
            <el-menu-item index="conceptualList">方案列表</el-menu-item>
            <el-menu-item index="expertReview">专家评审</el-menu-item>
          </el-submenu>
          <el-submenu index="costFinancialEvaluation">
            <template slot="title">
              <span>造价财评</span>
            </template>
            <el-menu-item index="costList">造价</el-menu-item>
            <el-menu-item index="financialEvaluation">财评</el-menu-item>
          </el-submenu>
          <el-menu-item index="inviteTenders">
            <span slot="title">招标管理</span>
          </el-menu-item>
          <el-submenu index="contract">
            <template slot="title">
              <span>合同管理</span>
            </template>
            <el-menu-item index="contractList">合同列表</el-menu-item>
            <el-menu-item index="contractProgress">合同进度</el-menu-item>
            <el-menu-item index="contractPaymentStatus">支付情况</el-menu-item>
            <el-menu-item index="contractCollection">收款情况</el-menu-item>
          </el-submenu>
<!--          <el-submenu index="projectCost">-->
<!--            <template slot="title">-->
<!--              <span>项目进度报告</span>-->
<!--            </template>-->
<!--            <el-menu-item index="costList">造价列表</el-menu-item>-->
<!--            <el-menu-item index="mergedContract">已归并合同</el-menu-item>-->
<!--          </el-submenu>-->
          <el-submenu index="progressReport">
            <template slot="title">
              <span>项目进度报告</span>
            </template>
            <el-menu-item index="personalLog">个人日志</el-menu-item>
            <el-menu-item index="reportList">进度报告</el-menu-item>
<!--            <el-menu-item index="monthlySummary">月总结</el-menu-item>-->
          </el-submenu>
          <el-submenu index="projectImplementation">
            <template slot="title">
              <span>项目实施</span>
            </template>
            <el-menu-item index="implementationPlan">实施计划</el-menu-item>
            <el-menu-item index="finalAcceptance">竣工验收</el-menu-item>
            <!--<el-menu-item index="qualitySafety">质量安全</el-menu-item>-->
<!--            <el-menu-item index="inspectionList">巡检列表</el-menu-item>-->
<!--            <el-menu-item index="toDoInspection">待办巡检</el-menu-item>-->
<!--            <el-menu-item index="inspectionCompleted">已完成巡检</el-menu-item>-->
          </el-submenu>
          <el-submenu index="qualitySafety">
            <template slot="title">
              <span>质量安全</span>
            </template>
            <el-menu-item index="inspectionList">巡检列表</el-menu-item>
            <el-menu-item index="toDoInspection">待办巡检</el-menu-item>
            <el-menu-item index="inspectionCompleted">已完成巡检</el-menu-item>
          </el-submenu>
          <el-menu-item index="settlementReport">
            <span slot="title">结算审计</span>
          </el-menu-item>
          <el-menu-item index="finalAccountReport">
            <span slot="title">决算审计</span>
          </el-menu-item>
          <el-menu-item index="mochaItom">
            <span slot="title">运维管理</span>
          </el-menu-item>
          <el-submenu index="phaseWorkSituation">
            <template slot="title">
              <span>项目阶段工作内容</span>
            </template>
            <el-menu-item index="workSituation">工作情况</el-menu-item>
            <el-menu-item index="phaseChange">发布工作</el-menu-item>
          </el-submenu>
        </el-menu>
      </el-col>
      <el-col :span="20">
          <project-info v-if="menuKey === 'projectInfo'" :project-id.sync="projectId"></project-info>
          <plan-list v-if="menuKey === 'planList'" :project-id.sync="projectId" :project-data.sync="projectData"></plan-list>
          <gantt v-if="menuKey === 'gantt'" :project-id.sync="projectId"></gantt>
          <conceptual-list v-if="menuKey === 'conceptualList'" :project-id.sync="projectId" :project-data.sync="projectData"></conceptual-list>
          <expert-review v-if="menuKey === 'expertReview'" :project-id.sync="projectId"></expert-review>
          <financial-evaluation v-if="menuKey === 'financialEvaluation'" :project-id.sync="projectId"></financial-evaluation>
          <invite-tenders v-if="menuKey === 'inviteTenders'" :project-id.sync="projectId" :project-data.sync="projectData"></invite-tenders>
          <contract-list v-if="menuKey === 'contractList'" :project-id.sync="projectId" :project-data.sync="projectData"></contract-list>
          <contract-progress v-if="menuKey === 'contractProgress'" :project-id.sync="projectId" :project-data.sync="projectData"></contract-progress>
          <contract-paymentStatus v-if="menuKey === 'contractPaymentStatus'" :project-id.sync="projectId" :project-data.sync="projectData"></contract-paymentStatus>
          <cost-list v-if="menuKey === 'costList'" :project-id.sync="projectId"></cost-list>
          <merged-contract v-if="menuKey === 'mergedContract'" :project-id.sync="projectId" :project-data.sync="projectData"></merged-contract>
          <personal-log v-if="menuKey === 'personalLog'" :project-id.sync="projectId" :project-data.sync="projectData"></personal-log>
          <report-list v-if="menuKey === 'reportList'" :project-id.sync="projectId" :project-data.sync="projectData"></report-list>
          <monthly-summary v-if="menuKey === 'monthlySummary'" :project-id.sync="projectId" :project-data.sync="projectData"></monthly-summary>
          <final-acceptance v-if="menuKey === 'finalAcceptance'" :project-id.sync="projectId" :project-data.sync="projectData"></final-acceptance>
          <inspection-list v-if="menuKey === 'inspectionList'" :project-id.sync="projectId" :project-data.sync="projectData"></inspection-list>
          <to-do-inspection v-if="menuKey === 'toDoInspection'" :project-id.sync="projectId" :project-data.sync="projectData"></to-do-inspection>
          <inspection-completed v-if="menuKey === 'inspectionCompleted'" :project-id.sync="projectId" :project-data.sync="projectData"></inspection-completed>
          <work-situation v-if="menuKey === 'workSituation'" :project-id.sync="projectId"></work-situation>
          <phase-change v-if="menuKey === 'phaseChange'" :project-id.sync="projectId" :project-data.sync="projectData"></phase-change>
          <settlement-report v-if="menuKey === 'settlementReport'" :project-id.sync="projectId" :project-data.sync="projectData"></settlement-report>
          <finalAccount-report v-if="menuKey === 'finalAccountReport'" :project-id.sync="projectId" :project-data.sync="projectData"></finalAccount-report>
          <project-data v-if="menuKey === 'projectData'" :project-id.sync="projectId"></project-data>
          <contract-Collection v-if="menuKey === 'contractCollection'" :project-id.sync="projectId"></contract-Collection>
          <mocha-itom v-if="menuKey === 'mochaItom'" :project-id.sync="projectId"></mocha-itom>
          <implementation-plan v-if="menuKey === 'implementationPlan'" :project-data.sync="projectData" :project-id.sync="projectId"></implementation-plan>
          <quality-safety v-if="menuKey === 'qualitySafety'" :project-id.sync="projectId"></quality-safety>
      </el-col>
    </el-row>
  </basic-container>
</template>

<script>
import ProjectInfo from "@/views/project/subPage/projectInfo";
import PlanList from "@/views/project/subPage/planList";
import Gantt from "@/views/project/subPage/gantt";
import ConceptualList from "@/views/project/subPage/conceptualList";
import ExpertReview from "@/views/project/subPage/expertReview";
import FinancialEvaluation from "@/views/project/subPage/financialEvaluation";
import InviteTenders from "@/views/project/subPage/inviteTenders";
import CostList from "@/views/project/subPage/costList";
import ContractList from '@/views/project/subPage/contractList'
import MergedContract from "@/views/project/subPage/mergedContract";
import PersonalLog from "@/views/project/subPage/personalLog";
import ReportList from "@/views/project/subPage/reportList";
import MonthlySummary from "@/views/project/subPage/monthlySummary";
import FinalAcceptance from "@/views/project/subPage/finalAcceptance";
import InspectionList from "@/views/project/subPage/inspectionList";
import ToDoInspection from "@/views/project/subPage/toDoInspection";
import InspectionCompleted from "@/views/project/subPage/inspectionCompleted";
import WorkSituation from "@/views/project/subPage/workSituation";
import PhaseChange from "@/views/project/subPage/phaseChange";
import ProjectData from "@/views/project/subPage/projectData";
import { getProjectDetail } from  '@/api/project/project'
import ContractProgress from "./subPage/contractProgress";
import ContractPaymentStatus from "./subPage/contractPaymentStatus";
import SettlementReport from "./subPage/settlementReport";
import FinalAccountReport from "./subPage/finalAccountReport";
import ContractCollection from "./subPage/contractCollection"
import MochaItom from "./subPage/mochaItom"
import ImplementationPlan from "./subPage/implementationPlan"
import QualitySafety from "./subPage/qualitySafety"

export default {
  name: "ProjectDetail",
  components: {
    FinalAccountReport,
    SettlementReport,
    ContractPaymentStatus,
    ContractProgress,
    ProjectData,
    PhaseChange,
    WorkSituation,
    InspectionCompleted,
    ToDoInspection,
    InspectionList,
    FinalAcceptance,
    MonthlySummary,
    PersonalLog,
    ReportList,
    MergedContract,
    CostList,
    InviteTenders,
    FinancialEvaluation,
    ExpertReview,
    ConceptualList,
    Gantt,
    PlanList,
    ProjectInfo,
    ContractList,
    ContractCollection,
    MochaItom,
    ImplementationPlan,
    QualitySafety
  },
  data() {
    return {
      menuKey: 'projectInfo',
      test: '',
      projectId: '',
      projectData: {}
    }
  },
  watch: {
    '$route' (to) {
      this.projectId = to.params.projectId || '0'
      getProjectDetail(this.projectId).then(res => {
        this.projectData = res.data.data.project
      })
    }
  },
  methods: {
    handleSelect(key) {
      this.menuKey = key
    }
  },
  mounted() {
    this.projectId = this.$route.params.projectId || '0'
    getProjectDetail(this.projectId).then(res => {
      this.projectData = res.data.data.project
    })
  }
}
</script>

<style scoped>
.el-menu-project {
  overflow-y: auto;
  overflow-x: hidden;
  height: calc(100vh - 170px);
}
.el-menu-project .el-submenu {
  min-width: 0px;
}
</style>
