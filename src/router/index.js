import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export const constantRoutes = [
  {
    path: '/',
    name: 'index',
    component: () => import('@/views/login/index')
  },
  {
    path: '/phoneDemo',
    component: () => import('@/phoneDemo/phoneDemo.vue')
  },
  {
    path: '/login',
    component: () => import('@/views/login/index')
  }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
