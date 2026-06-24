import { createRouter, createWebHistory } from 'vue-router'
import TournamentView from './views/TournamentView.vue'
import RankingView from './views/RankingView.vue'
import AdminView from './views/AdminView.vue'
import IdolProfileView from './views/IdolProfileView.vue'
import GroupProfileView from './views/GroupProfileView.vue'

const routes = [
  { path: '/', component: TournamentView },
  { path: '/ranking', component: RankingView },
  { path: '/admin', component: AdminView },
  { path: '/winner', component: TournamentView },
  { path: '/group/:name', component: GroupProfileView }, 
  { path: '/:idolName', component: IdolProfileView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router