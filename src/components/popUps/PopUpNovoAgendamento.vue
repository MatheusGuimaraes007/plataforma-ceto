<script setup>
import { onMounted } from 'vue';
import { useNovoAgendamento } from '../../composables/useNovoAgendamento.js';
import { useBibliotecaMensagem } from '../../composables/useBibliotecaMensagem.js';

// ✨ CORRIGIDO: Erro de digitação 'ip' -> 'is'
const {
  ativo,
  diaDoDesafio,
  horaEnvio,
  mensagemId,
  submitNewAgendamento,
  togglePopUp, 
  isPopUpNovoAgendamentoOpen // <-- Nome correto
} = useNovoAgendamento();

const {fetchMessages, mensagens} = useBibliotecaMensagem();

onMounted(async () => {
  await fetchMessages();
});
</script>


<template>
  <!-- 
    O 'v-if' que controla este pop-up está no componente pai (CronogramaGrupos.vue),
    então o 'isPopUpNovoAgendamentoOpen' não é usado aqui,
    mas corrigimos a importação mesmo assim.
  -->
  <div class="fixed inset-0 z-40 bg-black/85 flex items-center justify-center overflow-y-auto">
    <div class="w-[60%] bg-white rounded-lg p-6">
      <div class="mb-4">
        <h2 class="text-2xl font-bold">Criar Novo Horário</h2>
        <span>Preencha os dados do Agendamento</span>
      </div>
      <form>
        <div class="flex gap-4 mt-6 flex-col">
          
          <div>
            <label for="message" class="block text-sm font-medium text-gray-700">Mensagem (Pacote)</label>
            <select name="message" id="message" class="mt-1 w-full px-3 py-2 rounded-md shadow-sm bg-white cursor-pointer border border-gray-300" v-model="mensagemId">
              <option :value="null" disabled>Selecione um pacote</option>
              <!-- 
                A variável 'mensagens' (da useBibliotecaMensagem) contém
                a lista de "Pacotes" (ex: "DIA01", "DIA02")
              -->
              <option v-for="msg in mensagens" :key="msg.id_mensagem" :value="msg.id_mensagem">
                {{ msg.nome_mensagem }}
              </option>
            </select>
          </div>

          <div class="flex gap-4 w-full">
            <div class="flex-1">
              <label for="dia_do_desafio" class="block text-sm font-medium text-gray-700">Dia do Desafio</label>
              <select id="dia_do_desafio" v-model="diaDoDesafio" class="mt-1 w-full px-3 py-2 rounded-md shadow-sm bg-white cursor-pointer border border-gray-300">
                <option :value="null" disabled>Selecione o dia</option>
                <option :value="-1">Preparação</option>
                <option v-for="dia in 13" :key="dia - 1" :value="dia - 1">
                  Dia {{dia - 1}}
                </option>
              </select>
            </div>
            
            <div class="flex-1">
              <label for="hora_envio" class="block text-sm font-medium text-gray-700">Hora de Envio</label>
              <input type="time" id="hora_envio" v-model="horaEnvio" class="mt-1 w-full px-3 py-2 rounded-md shadow-sm border border-gray-300">
            </div>
          </div>

          <div class="flex items-center mt-2">
            <input type="checkbox" id="ativo" v-model="ativo" class="h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer">
            <label for="ativo" class="ml-2 block text-sm text-gray-900 cursor-pointer select-none">Agendamento Ativo</label>
          </div>

          <div class="justify-end flex gap-4 mt-4">
            <button @click="togglePopUp" type="button" class="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 cursor-pointer">
              Cancelar
            </button>
            <button @click.prevent="submitNewAgendamento" type="submit" class="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer">
              Salvar Agendamento
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
