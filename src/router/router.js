/**
 * 全站路由配置
 *
 * meta参数说明
 * keepAlive是否缓冲页面
 * isTab是否加入到tag导航
 * isAuth是否需要授权
 */
import Vue from 'vue';
import VueRouter from 'vue-router';
import PageRouter from './page/' // 页面路由
import ViewsRouter from './views/' // 页面路由
import AvueRouter from './avue-router'; //封装的路由控制方法
import i18n from '@/lang' // Internationalization 国际化 多语言
import Store from '../store/'; // vuex
Vue.use(VueRouter)
//创建路由
export const createRouter = () => new VueRouter({
  // https://router.vuejs.org/zh/guide/advanced/scroll-behavior.html#%E5%BC%82%E6%AD%A5%E6%BB%9A%E5%8A%A8
  // 这个方法 是控制滚动条
  // 如果 retuen falsy || {} ,则不发生滚动
  scrollBehavior (to, from, savedPosition) {
    // savedPosition 这个参数当且仅当导航 (通过浏览器的 前进/后退 按钮触发) 时才可用  效果和 router.go() 或 router.back()
    if (savedPosition) {
      // 返回savedPosition 其实就是 当用户点击 返回的话，保持之前游览的高度
      return savedPosition
    } else {
      if (from.meta.keepAlive) {
        from.meta.savedPosition = document.body.scrollTop
      }
      return {
        x: 0,
        y: to.meta.savedPosition || 0
      }
    }
  },
  routes: [...PageRouter, ...ViewsRouter]
})
const Router = createRouter() // 获得 route 实例
AvueRouter.install(Vue, Router, Store, i18n);  // 初始化和注册 AvueRouter
Router.$avueRouter.formatRoutes(Store.state.user.menuAll, true); // 动态路由核心方法
Router.addRoutes([...PageRouter, ...ViewsRouter]);
export function resetRouter () {  // 重置路由 比如用于身份验证失败，需要重新登录时 先清空当前的路有权限
  const newRouter = createRouter()
  Router.matcher = newRouter.matcher // reset router
  AvueRouter.install(Vue, Router, Store, i18n);
}
export default Router
