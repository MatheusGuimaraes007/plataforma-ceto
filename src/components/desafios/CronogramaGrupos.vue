<script setup>
import SideMenu from './SideMenu.vue';
import PopUpNovoAgendamento from '../popUps/PopUpNovoAgendamento.vue';
import { useNovoAgendamento } from '../../composables/useNovoAgendamento';
import { useCronogramaGrupos } from '../../composables/useCronogramaGrupos';
import { onMounted, ref } from 'vue';

const { isPopUpNovoAgendamentoOpen, abrirParaCriar, abrirParaEditar } = useNovoAgendamento();

const { agendamentos, fetchAgendamentos, atualizarStatusAgendamento, deletarAgendamento } = useCronogramaGrupos();

const expandedAgendamentoId = ref(null);

onMounted(async () => {
  await fetchAgendamentos();
});

function toggleDetalhes(agendamentoId) {
  expandedAgendamentoId.value = expandedAgendamentoId.value === agendamentoId ? null : agendamentoId;
}

async function handleDelete(item) {
  const confirmado = confirm(`Deseja excluir o agendamento do ${item.dia_do_desafio === -1 ? 'dia de preparação' : 'Dia ' + item.dia_do_desafio}?`);
  if (!confirmado) {
    return;
  }

  try {
    await deletarAgendamento(item.id_cronograma);
    alert('Agendamento excluído com sucesso!');
  } catch (error) {
    alert('Erro ao excluir agendamento: ' + error.message);
  }
}

function formatContent(conteudo) {
  if (!conteudo) {
    return '';
  }
  return conteudo.replace(/\\n/g, '\n');
}
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
        <button @click="abrirParaCriar" class="bg-blue-500 p-3 rounded-2xl text-white cursor-pointer hover:bg-blue-600">+ Agendar Mensagem</button>
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
              <template v-if="agendamentos.length">
                <template v-for="item in agendamentos" :key="item.id_cronograma">
                  <tr class="hover:bg-gray-50 cursor-pointer" @click="toggleDetalhes(item.id_cronograma)">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ item.dia_do_desafio == -1 ? 'Preparação' : `Dia ${item.dia_do_desafio}` }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ item.hora_envio }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ item.mensagens_template?.nome_mensagem || `ID: ${item.id_mensagem}` }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <button
                        type="button"
                        @click.stop="atualizarStatusAgendamento(item.id_cronograma, !item.ativo)"
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
                      <div class="flex justify-end gap-4">
                        <button
                          type="button"
                          @click.stop="abrirParaEditar(item)"
                          class="text-blue-600 hover:text-blue-800"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          @click.stop="handleDelete(item)"
                          class="text-red-600 hover:text-red-800"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="expandedAgendamentoId === item.id_cronograma" class="bg-gray-50/70">
                    <td colspan="5" class="px-6 py-4">
                      <div class="space-y-3">
                        <h4 class="text-sm font-semibold text-gray-800">Conteúdo agendado</h4>
                        <p v-if="!item.mensagens_template?.mensagens_passos?.length" class="text-sm text-gray-500">
                          Este pacote ainda não possui passos cadastrados.
                        </p>
                        <div
                          v-for="passo in item.mensagens_template?.mensagens_passos || []"
                          :key="passo.id_passo"
                          class="p-3 bg-white rounded-md border border-gray-200 shadow-sm"
                        >
                          <div class="flex items-center justify-between">
                            <span class="text-xs font-semibold uppercase text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                              Passo {{ passo.ordem }}: {{ passo.tipo_passo }}
                            </span>
                          </div>
                          <div v-if="passo.conteudo && passo.tipo_passo !== 'enquete'" class="mt-2 bg-green-50 p-2 rounded-md">
                            <p class="text-sm text-gray-700 whitespace-pre-wrap break-words">
                              {{ formatContent(passo.conteudo) }}
                            </p>
                          </div>
                          <p v-if="passo.url" class="mt-2 text-sm text-gray-600 break-words">
                            <span class="font-medium">URL:</span>
                            <a :href="passo.url" target="_blank" class="text-blue-600 hover:underline">{{ passo.url }}</a>
                          </p>
                          <div v-if="passo.tipo_passo === 'enquete'">
                            <p class="mt-2 text-sm text-gray-700 whitespace-pre-wrap break-words bg-green-50 p-2 rounded-md">
                              Pergunta: {{ formatContent(passo.conteudo) }}
                            </p>
                            <ul v-if="passo.poll_opcoes" class="mt-1 list-disc list-inside text-sm text-gray-600">
                              <li v-for="(opcao, idx) in passo.poll_opcoes" :key="idx">{{ formatContent(opcao) }}</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
              </template>

              <tr v-else>
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
