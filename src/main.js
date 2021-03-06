import Vue from 'vue'
import App from './App.vue'

import "@frontend/libs/metronic-admin/global/plugins/font-awesome/css/font-awesome.min.css"
import "@frontend/libs/metronic-admin/global/plugins/bootstrap/css/bootstrap.min.css"
import "@frontend/assets/css/admin.css"

import apolloProvider from './plugins/apolloClient'

import VueRouter from 'vue-router'
import routers from './routes'

import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

import VTooltip from 'v-tooltip'
import 'v-tooltip/dist/v-tooltip.css'

import VueLoading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';


Vue.use(VTooltip)
Vue.use(VueLoading)
Vue.use(Toast, {});
Vue.use(VueRouter)

Vue.config.productionTip = false

const router = new VueRouter({
  mode: 'history',
  routes: routers,
})


function nextFactory(context, middleware, index) {
  const subsequentMiddleware = middleware[index];
  if (!subsequentMiddleware) return context.next;
  return (...parameters) => {
    context.next(...parameters);
    const nextMiddleware = nextFactory(context, middleware, index + 1);
    subsequentMiddleware({ ...context, next: nextMiddleware });
  }
}

router.beforeEach((to, from, next) => {
  if (to.meta.middleware) { 
    const middleware = Array.isArray(to.meta.middleware)
                      ? to.meta.middleware
                      : [to.meta.middleware];
    const context = {
      from,
      next,
      router,
      to
    }
    const nextMiddleware = nextFactory(context, middleware, 1);

    return middleware[0]({ ...context, next: nextMiddleware });
  }
  return next();
});

new Vue({
  apolloProvider,
  router,
  render: h => h(App), 
}).$mount('#app')
