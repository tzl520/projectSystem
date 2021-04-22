<template>
  <basic-container>
    <div>项目资料</div>
  </basic-container>
</template>

<script>
export default {
  name: "ProjectData",
  props: {
    projectId: {
      type: String,
      default: '0'
    }
  },
  data() {
    return {
      test: '项目资料',

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
