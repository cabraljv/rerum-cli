import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/HomePage.vue'),
      },
      @begin_module@{
        path: '#moduleName#'.toLowerCase(),
        name: '#moduleName#',
        component: () => import('@/views/#moduleName#Page.vue'),
      },
      @end_module@
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
