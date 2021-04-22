<template>
  <basic-container>
    <give-form :submit-loading.sync="submitLoading" @submit="handleReserve"></give-form>
  </basic-container>
</template>

<script>
import {creatWorkAdd} from "@/api/workorder/give";
import GiveForm from "@/views/workorder/form/giveForm";
import Fileupload from "@/components/file-upload/fileupload";
export default {
  components: {Fileupload, GiveForm},
  data() {
    return {
      submitLoading: false,
      linkType: 'workOrder'
    }
  },
  methods: {
    // 这是表单进行保存的方法
    handleReserve(submitData) {
      submitData['projectAttachList'] = submitData['projectAttachList'] || []
      submitData['projectAttachList'].forEach(attach => {
        attach['createTime'] = ''
        attach['linkType'] = this.linkType
      })
      this.submitLoading = true
      creatWorkAdd(submitData).then(res => {
        //res. data. Success 存在就给type赋值success,否则就赋值error
        const type = res.data.success ? 'success' : 'error'
        this.$confirm(res.data.msg, {
          confirmButtonText: "确定",
          showCancelButton: false,
          closeOnClickModal: false,
          closeOnPressEscape: false,
          showClose: false,
          type: type
        }).then(() => {
          this.submitLoading = false
        })
      },error => {
        this.$message({
          type: "error",
          message: error
        });
        this.submitLoading = false
      })
    }
  }
}
</script>

<style>
</style>
