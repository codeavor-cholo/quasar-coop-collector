
const routes = [
  {
    path: '/collections',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: '/addpayment', component: () => import('pages/AddPayment.vue') },
      { path: '/addpaymentcopy/:memberIDs', props:true, component: () => import('pages/AddPaymentCopy.vue') },
      { path: '/attendance', component: () => import('pages/DailyMonitoring.vue') },
      { path: '/monitor', component: () => import('pages/MonitorMembers.vue') }
    ]
  },
  {
    path: '/',
    component: () => import('layouts/NoLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Login.vue') },
    ],
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
