import { createRouter, createWebHistory } from 'vue-router'
import TournamentView from './views/TournamentView.vue'
import RankingView from './views/RankingView.vue'
import AdminView from './views/AdminView.vue'

const routes = [
  { path: '/', component: TournamentView },
  { path: '/ranking', component: RankingView },
  { path: '/admin', component: AdminView },
  { path: '/winner', component: TournamentView },
  { path: '/:idolName', component: TournamentView } // Musi być na samym końcu!
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router