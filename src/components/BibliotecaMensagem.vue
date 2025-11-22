<script setup>
import SideMenu from './SideMenu.vue';
import PopUpNovaMensagem from './popUps/PopUpNovaMensagem.vue';
import {usePopUpNovaMensagem} from '../composables/usePopUpNovaMensagem.js';
import {useBibliotecaMensagem} from '../composables/useBibliotecaMensagem.js';
import {onMounted, ref, computed} from 'vue';

const {isPopUpNovaMensagemOpen, togglePopUp} = usePopUpNovaMensagem();
const {fetchMessages, mensagens, deletarPacoteMensagem} = useBibliotecaMensagem();

const expandedPacoteId = ref(null);
const filterNome = ref(''); // Mantém apenas o filtro por nome
// Removido: const filterData = ref('');

onMounted(() => {
  fetchMessages();
});

// PROPRIEDADE COMPUTADA PARA FILTRAR POR NOME E DEPOIS ORDENAR
const mensagensFiltradasESOrdenadas = computed(() => {
    let lista = mensagens.value || [];

    // 1. Filtragem por Nome (case insensitive e parcial)
    if (filterNome.value) {
        const termo = filterNome.value.toLowerCase();
        lista = lista.filter(msg =>
            msg.nome_mensagem && msg.nome_mensagem.toLowerCase().includes(termo)
        );
    }

    // Removido: Lógica de Filtragem por Data
    
    // 2. Ordenação Alfabética por Nome
    return [...lista].sort((a, b) => {
        const nomeA = a.nome_mensagem ? a.nome_mensagem.toLowerCase() : '';
        const nomeB = b.nome_mensagem ? b.nome_mensagem.toLowerCase() : '';
        return nomeA.localeCompare(nomeB);
    });
});


function toggleDetails(pacoteId) {
  if (expandedPacoteId.value === pacoteId) {
    expandedPacoteId.value = null;
  } else {
    expandedPacoteId.value = pacoteId;
  }
}

async function handleDeletar(pacote) {
  const confirmed = confirm(`Tem certeza que deseja excluir o pacote "${pacote.nome_mensagem}"?`);
  if (confirmed) {
    try {
      await deletarPacoteMensagem(pacote.id_mensagem);
    } catch (error) {
      alert('Erro ao deletar: ' + error.message);
    }
  }
}

function formatarData(dataISO) {
  if (!dataISO) return '—';
  try {
    const data = new Date(dataISO);
    if (isNaN(data.getTime())) throw new Error('Data inválida');
    const options = {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    };
    return new Intl.DateTimeFormat('pt-BR', options).format(data);
  } catch (error) {
    return 'Data inválida';
  }
}

function formatContent(content) {
  if (!content) return '';
  return content.replace(/\\n/g, '\n');
}
</script>

<template>
  <div class="flex h-screen w-screen bg-gray-50">
    <SideMenu/>
    <PopUpNovaMensagem v-if="isPopUpNovaMensagemOpen"/>
    <div class="flex-1 overflow-y-auto md:pt-0">
      <div class="p-6 flex justify-between items-center border-b border-gray-300 bg-white sticky top-0 z-10">
        <div>
          <h1 class="text-3xl font-bold">Biblioteca de Mensagens</h1>
          <span>Gerencie os pacotes de mensagens</span>
        </div>
        <button @click="togglePopUp" class="bg-blue-500 p-3 rounded-2xl text-white cursor-pointer hover:bg-blue-600">+ Criar Novo Pacote</button>
      </div>
      <div class="p-6">
        
        <div class="mb-4 flex flex-col md:flex-row gap-4">
            <input 
                type="text" 
                v-model="filterNome" 
                placeholder="Filtrar por nome do pacote..."
                class="flex-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
            </div>
        
        <div class="bg-white shadow-md rounded-lg overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-100">
              <tr>
                <th scope="col" class="px-2 py-3 w-10"><span class="sr-only">Expandir</span></th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome (Pacote)
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qtd. Passos
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data de Criação
                </th>
                <th scope="col" class="relative px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="mensagens.length === 0">
                <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
                  Nenhum pacote de mensagem encontrado.
                </td>
              </tr>
              <template v-else v-for="msg in mensagensFiltradasESOrdenadas" :key="msg.id_mensagem">
                <tr @click="toggleDetails(msg.id_mensagem)" class="hover:bg-gray-50 cursor-pointer">
                  <td class="px-2 py-4 w-10 text-center">
                    <svg :class="{'rotate-90': expandedPacoteId === msg.id_mensagem}" class="w-5 h-5 text-gray-400 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ msg.nome_mensagem || 'Sem nome' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ msg.mensagens_passos.length }} passo(s)
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatarData(msg.created_at) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button @click.stop="handleDeletar(msg)" class="text-red-600 hover:text-red-900 cursor-pointer">
                      Excluir
                    </button>
                  </td>
                </tr>
                <tr v-if="expandedPacoteId === msg.id_mensagem" class="bg-gray-50/50">
                  <td colspan="5" class="px-4 py-4 md:px-10">
                    <div class="space-y-3">
                      <h4 class="text-sm font-medium text-gray-900">Passos do Pacote:</h4>
                      <div v-for="passo in msg.mensagens_passos" :key="passo.id_passo" class="p-3 bg-white rounded-md border border-gray-200 shadow-sm">
                        <span class="text-xs font-semibold uppercase text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                          Passo {{ passo.ordem }}: {{ passo.tipo_passo }}
                        </span>
                        
                        <div v-if="passo.conteudo && passo.tipo_passo !== 'enquete'" class="mt-2 flex items-start bg-green-50 p-2 rounded-md">
                          <p class="font-medium text-sm text-gray-900 flex-shrink-0 mr-1">Conteúdo:</p>
                          <p class="text-sm text-gray-700 whitespace-pre-wrap break-words flex-1">
                            {{ formatContent(passo.conteudo) }}
                          </p>
                        </div>

                        <p v-if="passo.url" class="mt-2 text-sm text-gray-500">
                          <span class="font-medium">URL:</span> <a :href="passo.url" target="_blank" class="text-blue-600 hover:underline break-words">{{ passo.url }}</a>
                        </p>
                        
                        <div v-if="passo.tipo_passo === 'enquete'">
                          <p class="mt-2 text-sm text-gray-700 whitespace-pre-wrap break-words bg-green-50 p-2 rounded-md">
                            Conteúdo: {{ formatContent(passo.conteudo) }}
                          </p>
                          <ul v-if="passo.poll_opcoes" class="mt-1 list-disc list-inside text-sm text-gray-600">
                            <li v-for="(opt, i) in passo.poll_opcoes" :key="i">{{ opt }}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>