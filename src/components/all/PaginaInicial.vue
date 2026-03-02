<script setup>
import logo from '../../assets/icon.png';
const supabaseUrl = import.meta.env.VITE_LOCALSTORAGE_KEY
const userStorage = JSON.parse(localStorage.getItem(supabaseUrl)) || { nome: 'Usuário' }
</script>

<template>
  <div class="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-center p-6">
    
    <div class="flex flex-col items-center gap-3 mb-12">
      <img :src="logo" alt="Logo" class="w-16 h-16 object-contain drop-shadow-md" />
      
      <h1 class="text-2xl md:text-3xl font-bold text-gray-800 text-center">
        Seja bem-vindo, <span class="text-green-600">{{ userStorage.nome }}</span>!
      </h1>
      <p class="text-gray-500 text-sm md:text-base">Selecione uma das opções abaixo para continuar</p>
    </div>

    <div class="flex flex-col md:flex-row gap-6">
      <router-link 
        to="/dashboard" 
        class="w-64 h-24 bg-green-300 hover:bg-green-400 flex items-center justify-center rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
      >
        <span class="font-bold text-xl text-gray-900 text-center px-4">Desafios</span>
      </router-link>
      
      <router-link 
        to="/dashboard" 
        class="w-64 h-24 bg-green-300 hover:bg-green-400 flex items-center justify-center rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
      >
        <span class="font-bold text-xl text-gray-900 text-center px-4">Contador de Carbo</span>
      </router-link>
      
      <router-link 
        to="/dashboard" 
        class="w-64 h-24 bg-green-300 hover:bg-green-400 flex items-center justify-center rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
      >
        <span class="font-bold text-xl text-gray-900 text-center px-4">Lead Score</span>
      </router-link>
    </div>
    
  </div>
</template>