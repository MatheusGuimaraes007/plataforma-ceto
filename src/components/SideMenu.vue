<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
// 1. Importe o seu logo (icon.png)
// O caminho '../assets/icon.png' assume que este componente está em 'src/components/'
import logo from '../assets/icon.png';

// 2. Estado reativo para controlar o menu (mobile)
const isMenuOpen = ref(false);
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// 3. Lógica de rota ativa
const route = useRoute();
const isActive = (path) => {
  return route.path === path;
};

// 4. Função para fechar o menu ao clicar no link (bom para mobile)
const navigate = () => {
  if (isMenuOpen.value) {
    toggleMenu();
  }
};

// 5. Função de Logout (exemplo)
const logout = () => {
  console.log("Usuário clicou em Sair");
  // Adicione aqui sua lógica de logout
  // Ex: limpar token, redirecionar para /login
  toggleMenu(); // Fecha o menu se estiver no mobile
};
</script>

<template>
  <!-- 1. Header Mobile -->
  <header class="md:hidden bg-white/95 backdrop-blur-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-20 flex items-center justify-between p-4">
    <button
      @click="toggleMenu"
      class="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
      aria-label="Abrir menu"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
    
    <img :src="logo" alt="Logo" class="h-8 w-8" />
  </header>

  <!-- 2. Menu Lateral (Sidebar) -->
  <aside
    :class="{
      '-translate-x-full': !isMenuOpen, // Esconde no mobile
      'translate-x-0': isMenuOpen      // Mostra no mobile
    }"
    class="fixed md:static inset-y-0 left-0 z-30
           w-72 md:w-64 h-screen bg-white border-r border-gray-200
           flex flex-col
           transform transition-transform duration-300 ease-in-out
           md:translate-x-0"
  >
    <!-- Logo Principal -->
    <div class="flex justify-center items-center p-6 border-b border-gray-200">
      <img :src="logo" alt="Logo Principal" class="w-24 h-24" />
    </div>

    <!-- Links de Navegação (ATUALIZADOS) -->
    <nav class="flex-1 p-4 space-y-2">
      
      <!-- Link 1: Dashboard -->
      <router-link
        to="/"
        @click="navigate"
        class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        :class="{ 'bg-indigo-50 text-indigo-700 font-medium': isActive('/') }"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10 0h3a1 1 0 001-1V10M9 20v-6a2 2 0 012-2h2a2 2 0 012 2v6" />
        </svg>
        <span>Dashboard</span>
      </router-link>

      <!-- Link 2: Grupos -->
      <router-link
        to="/grupos"
        @click="navigate"
        class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        :class="{ 'bg-indigo-50 text-indigo-700 font-medium': isActive('/grupos') }"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1h-3" />
        </svg>
        <span>Grupos</span>
      </router-link>

      <!-- Link 3: Biblioteca de Mensagens -->
      <router-link
        to="/mensagens"
        @click="navigate"
        class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        :class="{ 'bg-indigo-50 text-indigo-700 font-medium': isActive('/mensagens') }"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span>Biblioteca de Mensagens</span>
      </router-link>

      <!-- Link 4: Cronograma -->
      <router-link
        to="/cronograma"
        @click="navigate"
        class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        :class="{ 'bg-indigo-50 text-indigo-700 font-medium': isActive('/cronograma') }"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>Cronograma</span>
      </router-link>

      <!-- Link 5: Log de Envios -->
      <router-link
        to="/log"
        @click="navigate"
        class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        :class="{ 'bg-indigo-50 text-indigo-700 font-medium': isActive('/log') }"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <span>Log de Envios</span>
      </router-link>

    </nav>

    <!-- Botão Sair (no rodapé do menu) -->
    <div class="p-4 border-t border-gray-200">
      <button 
        @click="logout" 
        class="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-left text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span>Sair</span>
      </button>
    </div>
  </aside>

  <!-- 3. Overlay (Fundo escuro no mobile) -->
  <div
    v-if="isMenuOpen"
    @click="toggleMenu"
    class="fixed inset-0 bg-black/40 z-20 md:hidden"
    aria-hidden="true"
  />
</template>
