import { createRouter, createWebHistory } from "vue-router";
import BibliotecaMensagem from "../components/BibliotecaMensagem.vue";
import CronogramaGrupos from "../components/CronogramaGrupos.vue";
import Grupos from "../components/Grupos.vue";

const routes = [
  {
    path: '/mensagens',
    name: 'BibliotecaMensagem',
    component: BibliotecaMensagem,
  },
  {
    path: '/cronograma',
    name: 'CronogramaGrupos',
    component: CronogramaGrupos,
  },
  {
    path: '/grupos',
    name: 'Grupos',
    component: Grupos,
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;