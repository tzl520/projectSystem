import Vue from 'vue'
import store from './store';
Vue.mixin({
  beforeRouteLeave: function (to, from, next) {
    if (this.$route.meta.keepAlive === true) {
      const result = this.$route.meta.keepAlive === true && store.state.tags.tagList.some(ele => {
        return ele.value === this.$route.fullPath;
      });
      if (this.$vnode && !result) {
        if (this.$vnode.parent && this.$vnode.parent.componentInstance && this.$vnode.parent.componentInstance.cache) {
          if (this.$vnode.componentOptions) {
            let key = this.$vnode.key == null
              ? this.$vnode.componentOptions.Ctor.cid + (this.$vnode.componentOptions.tag ? `::${this.$vnode.componentOptions.tag}` : '')
              : this.$vnode.key;
            let cache = this.$vnode.parent.componentInstance.cache;
            let keys = this.$vnode.parent.componentInstance.keys;
            if (cache[key]) {
              if (keys.length) {
                let index = keys.indexOf(key);
                if (index > -1) {
                  keys.splice(index, 1);
                }
              }
              delete cache[key];
            }
          }
        }
      }
    }
    next();
  },
});
