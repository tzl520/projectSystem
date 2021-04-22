<template>
  <div>
    {{ test }}
  </div>
</template>

<script>
export default {
  name: "qualitySafety",
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
      test: '质量安全'
    }
  }
}
</script>

<style scoped>

</style>
