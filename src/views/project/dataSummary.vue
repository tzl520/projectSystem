<template>
  <div>
    <project-summary></project-summary>
    <statistical-report></statistical-report>
    <time-statistics></time-statistics>
  </div>
</template>

<script>
import timeStatistics from "@/views/project/timeStatistics"
import ProjectSummary from "@/views/project/projectSummary";
import statisticalReport from "@/views/project/statisticalReport";
  export default {
    name: "dataSummary",
    components: {ProjectSummary,timeStatistics,statisticalReport},
    props: {
      projectId: {
        type: String,
        default: '0'
      }
    },
    data() {
      return {
        test: '数据汇总'
      }
    },
    created() {
      console.log(this.test, 'created')
    },
    mounted() {
      console.log(this.test, 'mounted')
    }
  }
</script>

<style scoped>

</style>
