<template>
  <div>
    {{ test }}
  </div>
</template>

<script>
export default {
  name: "mochaItom",
  props: {
    projectId: {
      type: String,
      default: '0'
    },
    projectData: {
      type: Object,
      default: undefined
    },
    attachList:{
      type: Object,
      default: undefined
    }
  },
  data() {
    return {
      test: '运维管理'
    }
  }
}
</script>

<style scoped>

</style>
