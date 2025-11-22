<script setup>
import { usePopUpNovaMensagem } from '../../composables/usePopUpNovaMensagem.js';

const {
  isPopUpNovaMensagemOpen,
  messageName,
  passos,
  togglePopUp,
  adicionarPasso,
  removerPasso,
  adicionarOpcaoEnquete,
  removerOpcaoEnquete,
  submitNewMessage
} = usePopUpNovaMensagem();
</script>

<template>
  <div v-if="isPopUpNovaMensagemOpen" class="fixed inset-0 z-40 bg-black/85 flex items-center justify-center overflow-y-auto">
    <div class="w-full max-w-2xl bg-white rounded-lg p-6 max-h-[90vh] flex flex-col">
      <div class="mb-4">
        <h2 class="text-2xl font-bold">Criar Pacote de Mensagens</h2>
        <span>Crie uma sequência de mensagens para agendar.</span>
      </div>

      <form class="flex-1 overflow-y-auto pr-2">
        <div class="mb-4">
          <label for="messageName" class="font-medium">Código do Pacote</label>
          <input type="text" id="messageName" placeholder="EX: DIA03" class="border px-4 py-2 w-full rounded-md mt-1" v-model="messageName">
        </div>
        <hr class="my-4">

        <div v-for="(passo, index) in passos" :key="index" class="p-4 border border-gray-200 rounded-lg mb-4 bg-gray-50">
          
          <div class="flex justify-between items-center mb-2">
            <span class="font-medium text-gray-800">Passo {{ index + 1 }} ({{ passo.tipo_passo }})</span>
            <button @click.prevent="removerPasso(index)" type="button" class="text-sm text-red-500 hover:text-red-700">Remover</button>
          </div>

          <div v-if="passo.tipo_passo === 'texto'" class="flex flex-col">
            <label :for="'passo_texto_' + index" class="text-sm">Conteúdo do Texto</label>
            <textarea :id="'passo_texto_' + index" v-model="passo.conteudo" class="border rounded-lg p-3 resize-none h-[100px]" placeholder="Utilize * para negrito..."></textarea>
          </div>
          
          <div v-if="['video', 'imagem'].includes(passo.tipo_passo)" class="flex flex-col gap-3">
            <div>
              <label :for="'passo_url_' + index" class="text-sm font-medium">URL ({{ passo.tipo_passo }})</label>
              <input type="text" :id="'passo_url_' + index" v-model="passo.url" class="border px-4 py-2 w-full rounded-md mt-1" placeholder="https://...">
            </div>
            <div>
              <label :for="'passo_legenda_' + index" class="text-sm">Legenda (Opcional)</label>
              <textarea :id="'passo_legenda_' + index" v-model="passo.conteudo" class="border rounded-lg p-3 resize-none h-[70px] w-full" placeholder="Escreva uma legenda opcional..."></textarea>
            </div>
          </div>
          
          <div v-if="['documento', 'audio'].includes(passo.tipo_passo)" class="flex flex-col">
            <label :for="'passo_url_' + index" class="text-sm font-medium">URL ({{ passo.tipo_passo }})</label>
            <input type="text" :id="'passo_url_' + index" v-model="passo.url" class="border px-4 py-2 w-full rounded-md mt-1" placeholder="https://...">
          </div>
          
          <div v-if="passo.tipo_passo === 'enquete'" class="flex flex-col gap-2">
            <label :for="'passo_enquete_pergunta_' + index" class="text-sm font-medium">Pergunta da Enquete</label>
            <input type="text" :id="'passo_enquete_pergunta_' + index" v-model="passo.conteudo" class="border px-4 py-2 w-full rounded-md" placeholder="Ex: Você está gostando?">
            
            <label class="text-sm font-medium mt-2">Opções da Enquete</label>
            <div v-for="(opcao, optionIndex) in passo.poll_opcoes" :key="optionIndex" class="flex items-center gap-2">
              <input type="text" :id="'passo_enquete_opcao_' + index + '_' + optionIndex" v-model="passo.poll_opcoes[optionIndex]" class="border px-4 py-2 w-full rounded-md" :placeholder="'Opção ' + (optionIndex + 1)">
              <button @click.prevent="removerOpcaoEnquete(index, optionIndex)" type="button" class="text-sm text-red-500 hover:text-red-700 p-1 rounded-full">Remover</button>
            </div>
            <button @click.prevent="adicionarOpcaoEnquete(index)" type="button" class="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm self-start mt-2">+ Adicionar Opção</button>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <button @click.prevent="adicionarPasso('texto')" class="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm">+ Texto</button>
          <button @click.prevent="adicionarPasso('video')" class="bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm">+ Vídeo</button>
          <button @click.prevent="adicionarPasso('imagem')" class="bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm">+ Imagem</button>
          <button @click.prevent="adicionarPasso('documento')" class="bg-gray-100 text-gray-800 px-3 py-1 rounded-md text-sm">+ Documento</button>
          <button @click.prevent="adicionarPasso('audio')" class="bg-gray-100 text-gray-800 px-3 py-1 rounded-md text-sm">+ Áudio</button>
          <button @click.prevent="adicionarPasso('enquete')" class="bg-purple-100 text-purple-800 px-3 py-1 rounded-md text-sm">+ Enquete</button>
        </div>
      </form>
      
      <div class="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-200">
        <button @click="togglePopUp" type="button" class="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200">Cancelar</button>
        <button @click.prevent="submitNewMessage" type="submit" class="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">Salvar Pacote</button>
      </div>
    </div>
  </div>
</template>