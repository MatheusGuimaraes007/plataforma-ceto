<script setup>
import SideMenu from './SideMenu.vue';
import PopUpNovoAgendamento from './popUps/PopUpNovoAgendamento.vue';
import { useNovoAgendamento } from '../composables/useNovoAgendamento';
import { useCronogramaGrupos } from '../composables/useCronogramaGrupos';
import { onMounted } from 'vue';

// ✨ CORRIGIDO: Erro de digitação 'ip' -> 'is'
const { isPopUpNovoAgendamentoOpen, togglePopUp } = useNovoAgendamento();

const { agendamentos, fetchAgendamentos, atualizarStatusAgendamento } = useCronogramaGrupos();

onMounted(async () => {
  await fetchAgendamentos();
});
</script>

<template>
  <div class="flex h-screen w-screen bg-gray-50">
    <SideMenu />
    <!-- ✨ CORRIGIDO: v-if usando a variável correta -->
    <PopUpNovoAgendamento v-if="isPopUpNovoAgendamentoOpen"/>
    
    <div class="flex-1 overflow-y-auto md:pt-0">
      
      <div class="p-6 flex justify-between items-center border-b border-gray-300 bg-white sticky top-0 z-10">
        <div>
          <h1 class="text-3xl font-bold">Cronograma de Mensagens</h1>
          <span>Gerencie o Cronograma de Mensagem</span>
        </div>
        <button @click="togglePopUp" class="bg-blue-500 p-3 rounded-2xl text-white cursor-pointer hover:bg-blue-600">+ Agendar Mensagem</button>
      </div>

      <div class="p-6">
        <div class="bg-white shadow-md rounded-lg overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-100">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dia
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hora
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mensagem (Pacote)
                </th>
                <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ativo
                </th>
                <th scope="col" class="relative px-6 py-3">
                  <span class="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              
              <tr v-if="agendamentos.length > 0" v-for="item in agendamentos" :key="item.id_cronograma">
                
                <td v-if="item.dia_do_desafio == -1" class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Preparação
                </td>

                <td v-else class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Dia {{ item.dia_do_desafio }}
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ item.hora_envio }}
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <!-- 
                    A coluna 'nome_mensagem' vem da tabela 'mensagens_template'
                    que buscamos no 'fetchAgendamentos'
                  -->
                  {{ item.mensagens_template?.nome_mensagem || `ID: ${item.id_mensagem}` }}
                </td>

                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <button
                    type="button"
                    @click="atualizarStatusAgendamento(item.id_cronograma, !item.ativo)"
                    :class="[
                      'w-20',
                      'px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2',
                      item.ativo
                        ? 'bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500' 
                        : 'bg-red-100 text-red-800 hover:bg-red-200 focus:ring-red-500'
                    ]"
                  >
                    {{ item.ativo ? 'Ativo' : 'Inativo' }}
                  </button>
                </td>

                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href="#" class="text-blue-600 hover:text-blue-900">Editar</a>
                </td>
              </tr>

              <tr v-if="agendamentos.length === 0">
                <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
                  Nenhum agendamento encontrado.
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
