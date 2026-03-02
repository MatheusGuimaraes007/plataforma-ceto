import { createRouter, createWebHistory } from "vue-router";
import BibliotecaMensagem from "../components/desafios/BibliotecaMensagem.vue";
import CronogramaGrupos from "../components/desafios/CronogramaGrupos.vue";
import Grupos from "../components/desafios/Grupos.vue";
import Dashboard from "../components/all/Dashboard.vue";
import Login from "../components/Login.vue";
import PaginaInicial from "../components/all/PaginaInicial.vue";
import FaxinaGratis from "../components/desafios/FaxinaGratis.vue";
import { useAuth } from "../composables/useAuth";

const routes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/mensagens',
    name: 'BibliotecaMensagem',
    component: BibliotecaMensagem,
    meta: { requiresAuth: true },
  },
  {
    path: '/cronograma',
    name: 'CronogramaGrupos',
    component: CronogramaGrupos,
    meta: { requiresAuth: true },
  },
  {
    path: '/grupos',
    name: 'Grupos',
    component: Grupos,
    meta: { requiresAuth: true },
  },
  {
    path: '/pagina-inicial',
    name: 'PaginaInicial',
    component: PaginaInicial,
    meta: {requiresAuth: true },
  },
  {
    path: '/faxina-gratis',
    name: 'FaxinaGratis',
    component: FaxinaGratis,
    meta: { requiresAuth: true },
  },
  {
    path: '/',
    name: 'Login',
    component: Login,
    meta: { guestOnly: true },
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const auth = useAuth();

  if (to.meta?.requiresAuth && !auth.isAutenticado.value) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
    return;
  }

  if (to.meta?.guestOnly && auth.isAutenticado.value) {
    const redirectTarget = typeof to.query.redirect === 'string' ? to.query.redirect : '/dashboard';
    next(redirectTarget);
    return;
  }

  next();
});

export default router;