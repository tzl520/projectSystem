<template>
  <basic-container>
    <div>
      <div class="wel__header">
        <div class="wel__info">
          <img :src="userInfo.avatar"
               alt=""
               class="wel__info-img">
          <div class="wel__info-content">
            <div class="wel__info-title">
              {{ username }}
              <router-link class="user-info__setting" :to="{path:'/info/index'}">个人设置</router-link>
            </div>
            <div class="wel__info-subtitle">
              {{ userInfo.orgNamePath }}
            </div>
          </div>
          <div  class="wel__extra">
            <div  class="wel__extra-item" v-if = "fileName4 != '' ">
              <p  class="wel__extra-title"><router-link  :to="{path: fielUrl4}">{{fileName4}}</router-link></p>
              <p  class="wel__extra-subtitle">{{fileNum4}}</p>
            </div>
            <div  class="wel__extra-item" v-if = "fileName != '' ">
              <p  class="wel__extra-title"><router-link  :to="{path: fielUrl}">{{fileName}}</router-link></p>
              <p  class="wel__extra-subtitle">{{fileNum}}</p>
            </div>
            <div  class="wel__extra-item" v-if = "fileName1 != '' ">
              <p  class="wel__extra-title"><router-link  :to="{path: fielUrl1}">{{fileName1}}</router-link></p>
              <p  class="wel__extra-subtitle">{{fileNum1}}</p>
            </div>
            <div  class="wel__extra-item" v-if = "fileName2 != '' ">
              <p  class="wel__extra-title"><router-link  :to="{path: fielUrl2}">{{fileName2}}</router-link></p>
              <p  class="wel__extra-subtitle">{{fileNum2}}</p>
            </div>
            <div  class="wel__extra-item" v-if = "fileName3 != '' ">
              <p  class="wel__extra-title"><router-link  :to="{path: fielUrl3}">{{fileName3}}</router-link></p>
              <p  class="wel__extra-subtitle">{{fileNum3}}</p>
            </div>
            <div  class="wel__extra-item" v-if = "fileName5 != '' ">
              <p  class="wel__extra-title"><router-link  :to="{path: fielUrl5}">{{fileName5}}</router-link></p>
              <p  class="wel__extra-subtitle">{{fileNum5}}</p>
            </div>
            <div  class="wel__extra-item" v-if = "fileName6 != '' ">
              <p  class="wel__extra-title"><router-link  :to="{path: fielUrl6}">{{fileName6}}</router-link></p>
              <p  class="wel__extra-subtitle">{{fileNum6}}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="wel" style="display:flex;flex-wrap:wrap;width:1200px;margin:0 auto;">
        <basic-block v-for="(menu,index) in pageList" :key="menu.id"
                     :ext="true"
                     :width="230"
                     :height="120"
                     :icon="menu.source"
                     :text="menu.name"
                     :dept="menu.remark"
                     :time="index+10"
                     :to="menu.path"
                     :color="menu.bgColor"
        />
      </div>
    </div>
  </basic-container>
</template>

<script>
import { getRoutes } from "@/api/system/menu";
import { mapGetters } from "vuex";

export default {
  name: "wel",
  data() {
    return {
      speedList: [],
      username: '',
      pageList: [],
      colorName: '',
      fileName6: '',//借阅记录
      fielUrl6: '',
      fileNum6: '',
      fileName5: '',//不通过审核
      fielUrl5: '',
      fileNum5: '',
      fileName4: '',//未归档审核
      fielUrl4: '',
      fileNum4: '',//未审核数量
      fileName: '',//部门审核
      fielUrl: '',
      fileName1: '',//归档审核
      fielUrl1: '',
      fileName2: '',//借阅审核
      fielUrl2: '',
      fileName3: '',//编研审核
      fielUrl3: '',
      fileNum: '',//部门审核数量
      fileNum1: '',//归档审核数量
      fileNum2: '',//借阅审核数量
      fileNum3: '',//编研审核数量
    }
  },
  computed: {
    ...mapGetters(["userInfo"])
  },
  created() {
    this.username = JSON.parse(localStorage.getItem('saber-userInfo')).content.nick_name
    this.getMenu()
  },
  methods: {
    getMenu(){
      getRoutes().then(res =>{
        var colorList=['#56b69b','#d44858','#613cbd','#da542e','#DA70D6','#94DBFF','#008080','#C7A3ED','#CC9898','#8AC007','#CCC007','#0000FF','#FF8C00','#DDA0DD'];
        this.pageList = []
        for(var arr of res.data.data){
          for(var data of arr.children){
            //console.log(data)
            var color = colorList[colorList.length * Math.random() << 0];//随机自定义的颜色
            this.pageList.push({source: data.source, name: data.name ,remarck: data.remarck, path: data.path , bgColor : color})
            if(data.id == '1290858632472256514'){
              this.fileName = data.name
              this.fielUrl = data.path
            }
            if(data.id == '1291285388320624642'){
              this.fileName1 = data.name
              this.fielUrl1 = data.path
            }
            if(data.id == '1292767452085731330'){
              this.fileName2 = data.name
              this.fielUrl2 = data.path
            }
            if(data.id == '1293727206450753538'){
              this.fileName3 = data.name
              this.fielUrl3 = data.path
            }
            if(data.id == '1290843541689425921'){
              this.fileName4 = data.name
              this.fielUrl4 = data.path
            }
            if(data.id == '1310068638996250626'){
              this.fileName5 = data.name
              this.fielUrl5 = data.path

            }
            if(data.id == '1292768057609011201'){
              this.fileName6 = data.name
              this.fielUrl6 = data.path
            }
          }
        }
      })
    }
  }
};
</script>

<style scoped="scoped" lang="scss">
.wel {
  &__header {
    padding: 25px 40px;
    border-bottom: 1px solid #e8e8e8;
    background-color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  &__info {
    display: flex;
    align-items: center;
    &-img {
      border-radius: 72px;
      display: block;
      width: 72px;
      height: 72px;
      img {
        width: 100%;
        height: 100%;
        display: block;
      }
    }
    &-content {
      position: relative;
      margin-left: 24px;
      color: rgba(0, 0, 0, 0.45);
      line-height: 22px;
    }
    &-title {
      font-size: 20px;
      line-height: 28px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.85);
      margin-bottom: 12px;
    }
    &-subtitle {
      position: relative;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.45);
      line-height: 22px;
    }
  }
  &__extra {
    padding-left: 400px;
    &-item {
      position: relative;
      padding: 0 32px;
      display: inline-block;
      &:last-child {
        &::after {
          display: none;
        }
      }
      &:after {
        background-color: #e8e8e8;
        position: absolute;
        top: 30px;
        right: 0;
        width: 1px;
        height: 40px;
        content: "";
      }
    }
    &-title {
      color: rgba(0, 0, 0, 0.45);
      font-size: 14px;
      line-height: 22px;
      margin-bottom: 4px;
    }
    &-subtitle {
      color: rgba(255, 0, 0, 0.8);
      font-size: 30px;
      line-height: 38px;
      margin: 0;
      text-align: center;
      span {
        color: rgba(0, 0, 0, 0.45);
        font-size: 20px;
      }
    }
  }

}
.user-info__setting {
  display: inline;
  font-size: 12px;
  color: #409eff;
  text-align: center;
}
.wel-page {
  display: flex;
  flex-wrap: wrap;
  width: 900px;
  margin: 0 auto;
}
.fileType {
  width: 24px;
  height: 24px;
  display: block;
}
.attachment-icon {
  width: 40px;
  height: 40px;
}
.attachment-a {
  height:107px;
  overflow-x:auto;
  overflow-y:hidden;
  white-space: nowrap;
}
.attachment-p {
  color: #409eff;
  font-size: 14px;
}
.attachment-a>div{
  display: inline-block;
  text-align: center;
  position: relative;
  margin-top: 10px;
  margin-right:15px;
  min-width: 80px;
  max-width: 140px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.attachment-more-icon {
  width: 40px;
  height: 40px;
}
.attachment-more-div {
  height:120px;
  overflow-x:auto;
  overflow-y:hidden;
  white-space: nowrap;
}
.attachment-more-div>div{
  display: inline-block;
  text-align: center;
  position: relative;
  margin-top: 10px;
  margin-right:15px;
  min-width: 80px;
  max-width: 120px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

 /deep/.basic-block .box:hover{
  background-color: #FFF;
  -webkit-transition: none;
  transition: none;
  transform: none;
}
.basic-block .box {
  position: relative;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  padding: 15px;
  width: 100%;
  height: 100%;
  /* -webkit-transition: all 1s; */
  /* transition: all 1s; */
  background-size: cover;
}

.basic-block {
  opacity: 0;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  color: #fff;
  // -webkit-animation: mymove 1s;
  // animation: mymove 1s;
  // -webkit-animation-fill-mode: forwards;
  // animation-fill-mode: forwards;
}
.el-card {
  border-radius: 4px;
  border: 1px solid #EBEEF5;
  background-color: #FFF;
  overflow: hidden;
  color: #303133;
  // -webkit-transition: .3s;
  // transition: .3s;
}
</style>
