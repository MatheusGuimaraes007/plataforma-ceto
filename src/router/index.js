import { createRouter, createWebHistory } from "vue-router";
import BibliotecaMensagem from "../components/BibliotecaMensagem.vue";

const routes = [
  {
    path: '/mensagens',
    name: 'BibliotecaMensagem',
    component: BibliotecaMensagem,
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;