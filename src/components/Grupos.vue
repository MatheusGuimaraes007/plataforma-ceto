<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import SideMenu from './SideMenu.vue'; 
import { useGrupos } from '../composables/useGrupos';

const { grupos, fetchGrupos, atualizarGrupo, isLoading, totalGrupos, page, itensPorPagina } = useGrupos();
const savingState = ref({});
const termoBusca = ref('');
let searchTimeout = null;

onMounted(async () => {
  await fetchGrupos(1);
});

// Watch para pesquisa em tempo real com Debounce
watch(termoBusca, (novoTermo) => {
  // Limpa o timeout anterior se o usuário continuar digitando
  if (searchTimeout) clearTimeout(searchTimeout);
  
  // Define um novo timeout de 500ms
  searchTimeout = setTimeout(() => {
    // Sempre volta para a página 1 ao pesquisar
    fetchGrupos(1, novoTermo);
  }, 500);
});

const handleSalvar = async (grupo) => {
  const id = grupo.id_grupo;
  savingState.value[id] = true;
  const result = await atualizarGrupo(grupo);
  if (!result.success) alert('Erro ao atualizar grupo.');
  setTimeout(() => { savingState.value[id] = false; }, 500);
};

const totalPaginas = computed(() => Math.ceil(totalGrupos.value / itensPorPagina));

const mudarPagina = (novaPagina) => {
  if (novaPagina >= 1 && novaPagina <= totalPaginas.value) {
    // Mantém o termo de busca atual ao mudar de página
    fetchGrupos(novaPagina, termoBusca.value);
  }
};
</script>

<template>
  <div class="flex h-screen w-screen bg-gray-50">
    <SideMenu />
    
    <div class="flex-1 flex flex-col h-screen overflow-hidden">
      
      <!-- Header -->
      <div class="p-6 border-b border-gray-300 bg-white shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Gerenciamento de Grupos</h1>
          <span class="text-gray-500">Edite configurações e acompanhe os {{ totalGrupos }} grupos</span>
        </div>
        
        <div class="flex items-center gap-3 w-full md:w-auto">
            <!-- Campo de Busca -->
            <div class="relative w-full md:w-64">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                    </svg>
                </div>
                <input 
                    v-model="termoBusca"
                    type="text" 
                    placeholder="Buscar por nome..." 
                    class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
            </div>

            <button @click="fetchGrupos(page, termoBusca)" class="text-gray-500 hover:text-blue-600 transition-colors p-2 cursor-pointer" title="Atualizar">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
            </button>
        </div>
      </div>

      <!-- Conteúdo com Scroll -->
      <div class="flex-1 overflow-y-auto p-6">
        <div class="bg-white shadow-md rounded-lg border border-gray-200">
          <table class="min-w-full divide-y divide-gray-200 table-fixed">
            <thead class="bg-gray-100">
              <tr>
                <th scope="col" class="w-[20%] px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Grupo
                </th>
                <th scope="col" class="w-[25%] px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Conexão
                </th>
                <th scope="col" class="w-[15%] px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Métricas
                </th>
                <th scope="col" class="w-[15%] px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" class="w-[15%] px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Datas
                </th>
                <th scope="col" class="w-[10%] px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              
              <tr v-if="isLoading">
                <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                  <div class="flex justify-center items-center gap-2">
                    <svg class="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Carregando...
                  </div>
                </td>
              </tr>

              <tr v-else v-for="grupo in grupos" :key="grupo.id_grupo" class="hover:bg-gray-50 transition-colors">
                
                <!-- Grupo (Nome e ID) -->
                <td class="px-4 py-4 align-top">
                  <div class="text-sm font-bold text-gray-900 leading-tight break-words">
                    {{ grupo.nome_grupo }}
                  </div>
                  <div class="mt-1 text-xs text-gray-400">ID: {{ grupo.id_grupo }}</div>
                </td>

                <!-- Conexão (Wpp e Link) -->
                <td class="px-4 py-4 align-top">
                  <div class="flex flex-col gap-1.5">
                    <div class="text-xs text-gray-600 break-all">
                      <span class="font-semibold text-gray-500 block mb-0.5">Wpp ID:</span>
                      {{ grupo.id_whatsapp || '-' }}
                    </div>
                    
                    <!-- Link do Grupo -->
                    <div class="mt-1">
                        <a v-if="grupo.link_grupo" :href="grupo.link_grupo" target="_blank" class="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1 w-max cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
                            <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
                            <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
                        </svg>
                        Link do Grupo
                        </a>
                        <span v-else class="text-xs text-gray-400 italic flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            Sem Link
                        </span>
                    </div>
                  </div>
                </td>

                <!-- Métricas -->
                <td class="px-4 py-4 align-top">
                   <div class="flex flex-col gap-2">
                      <div class="flex items-center gap-2 bg-gray-50 p-1 rounded border border-gray-100 w-max">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <span class="text-xs font-medium text-gray-700">{{ grupo.quantidade_pessoa || 0 }} membros</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span :class="[
                          'text-[10px] uppercase font-bold px-2 py-0.5 rounded border',
                          grupo.status_abertura === 'Aberto' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                        ]">
                          {{ grupo.status_abertura || 'FECHADO' }}
                        </span>
                      </div>
                   </div>
                </td>

                <!-- Status (Select) -->
                <td class="px-4 py-4 align-top">
                  <select 
                    v-model="grupo.status"
                    class="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1.5 cursor-pointer"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="finalizado">Finalizado</option>
                    <option value="aguardando">Aguardando</option>
                  </select>
                </td>

                <!-- Datas e Dia -->
                <td class="px-4 py-4 align-top space-y-2">
                  <div>
                    <label class="block text-[10px] font-medium text-gray-500 uppercase mb-0.5">Início</label>
                    <input 
                      type="text" 
                      v-model="grupo.data_inicio"
                      placeholder="DD/MM/YYYY"
                      class="block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-1 px-2 text-center"
                    />
                  </div>
                  <div>
                     <label class="block text-[10px] font-medium text-gray-500 uppercase mb-0.5">Dia Atual</label>
                     <input 
                      type="text" 
                      v-model="grupo.dia_atual"
                      class="block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-1 px-2 text-center font-bold text-blue-600"
                    />
                  </div>
                </td>

                <!-- Botão Salvar -->
                <td class="px-4 py-4 align-middle text-center">
                  <button
                    @click="handleSalvar(grupo)"
                    :disabled="savingState[grupo.id_grupo]"
                    :class="[
                      'w-full inline-flex justify-center items-center rounded-md border border-transparent py-2 px-2 text-sm font-medium text-white shadow-sm transition-all cursor-pointer',
                      savingState[grupo.id_grupo] 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md active:transform active:scale-95'
                    ]"
                  >
                    <span v-if="savingState[grupo.id_grupo]" class="text-xs">...</span>
                    <span v-else>Salvar</span>
                  </button>
                </td>

              </tr>

              <tr v-if="!isLoading && grupos.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-sm text-gray-500 bg-gray-50 rounded-lg m-4 border border-dashed border-gray-300">
                  <div v-if="termoBusca">
                    Nenhum grupo encontrado para "<span class="font-bold">{{ termoBusca }}</span>"
                  </div>
                  <div v-else>
                    Nenhum grupo encontrado.
                  </div>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer: Paginação -->
      <div v-if="totalGrupos > 0" class="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between sm:px-6 shrink-0">
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Mostrando
              <span class="font-medium">{{ (page - 1) * itensPorPagina + 1 }}</span>
              a
              <span class="font-medium">{{ Math.min(page * itensPorPagina, totalGrupos) }}</span>
              de
              <span class="font-medium">{{ totalGrupos }}</span>
              resultados
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                @click="mudarPagina(page - 1)"
                :disabled="page === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Anterior
              </button>
              
              <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                Página {{ page }} de {{ totalPaginas }}
              </span>

              <button
                @click="mudarPagina(page + 1)"
                :disabled="page === totalPaginas"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Próximo
              </button>
            </nav>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>