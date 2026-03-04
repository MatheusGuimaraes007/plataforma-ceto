<script setup>
import { computed, ref } from 'vue';
import { usePopUpNovaMensagemNovo } from '../../composables/usePopUpNovaMensagemNovo.js';

const {
  isPopUpNovaMensagemOpen,
  isEditando,
  messageName,
  passos,
  fecharPopUp,
  adicionarPasso,
  removerPasso,
  adicionarOpcaoEnquete,
  removerOpcaoEnquete,
  submitMessage
} = usePopUpNovaMensagemNovo();

const tituloModal = computed(() =>
  isEditando.value ? 'Editar Pacote de Mensagens (novo)' : 'Criar Pacote de Mensagens (novo)'
);

const textoBotaoPrincipal = computed(() =>
  isEditando.value ? 'Atualizar Pacote' : 'Salvar Pacote'
);

const podeSalvar = computed(() => {
  if (!messageName.value || !messageName.value.trim()) return false;
  if (!passos.value || passos.value.length === 0) return false;
  return passos.value.some((p) => {
    if (p.tipo_passo === 'texto') return p.conteudo && p.conteudo.trim() !== '';
    if (['video','imagem','documento','audio'].includes(p.tipo_passo)) {
      return (p.url && p.url.trim() !== '') || p.file;
    }
    if (p.tipo_passo === 'enquete') {
      return Array.isArray(p.poll_opcoes) && p.poll_opcoes.some(o => o && o.trim() !== '');
    }
    return false;
  });
});

// Drag & drop helpers
const dropHover = ref({});
function preventAndStop(e) {
  e.preventDefault();
  e.stopPropagation();
}
function onDragEnter(index, e) {
  preventAndStop(e);
  dropHover.value[index] = true;
}
function onDragLeave(index, e) {
  preventAndStop(e);
  dropHover.value[index] = false;
}
function onDropFile(e, index) {
  preventAndStop(e);
  dropHover.value[index] = false;
  const files = e.dataTransfer?.files;
  if (files && files.length) {
    handleSelectedFile(files[0], index);
  }
}
function onFileChange(e, index) {
  const files = e.target.files;
  if (files && files.length) handleSelectedFile(files[0], index);
}
function openFileSelector(index) {
  const el = document.getElementById(`passo_file_input_${index}`);
  if (el) el.click();
}
function getAcceptFor(tipo) {
  if (tipo === 'video') return 'video/mp4';
  if (tipo === 'imagem') return 'image/png';
  if (tipo === 'audio') return 'audio/mpeg';
  if (tipo === 'documento') return 'application/pdf';
  return '';
}

// validação de arquivo (tipo e tamanho)
function validateFile(file, tipo) {
  if (!file) return { ok: false, message: 'Ficheiro inválido.' };
  const sizeMB = file.size / (1024 * 1024);
  if (tipo === 'video') {
    if (file.type !== 'video/mp4') return { ok: false, message: 'Vídeo deve ser MP4.' };
    if (sizeMB > 99) return { ok: false, message: 'Vídeo excede 99 MB.' };
  }
  if (tipo === 'imagem') {
    if (!file.type.startsWith('image/') || file.type !== 'image/png') return { ok: false, message: 'Imagem deve ser PNG.' };
  }
  if (tipo === 'audio') {
    if (file.type !== 'audio/mpeg' && file.type !== 'audio/mp3') return { ok: false, message: 'Áudio deve ser MP3.' };
  }
  if (tipo === 'documento') {
    if (file.type !== 'application/pdf') return { ok: false, message: 'Documento deve ser PDF.' };
  }
  return { ok: true };
}

function handleSelectedFile(file, index) {
  const tipo = passos.value[index]?.tipo_passo;
  const result = validateFile(file, tipo);
  // limpa erro anterior
  if (!passos.value[index]) return;
  passos.value[index].error = null;
  if (!result.ok) {
    passos.value[index].file = null;
    passos.value[index].error = result.message;
    return;
  }
  passos.value[index].file = file;
  passos.value[index].error = null;
}
</script>

<template>
  <div v-if="isPopUpNovaMensagemOpen" class="fixed inset-0 z-40 bg-black/85 flex items-center justify-center overflow-y-auto">
    <div class="w-full max-w-2xl bg-white rounded-lg p-6 max-h-[90vh] flex flex-col">
      <div class="mb-4">
        <h2 class="text-2xl font-bold">{{ tituloModal }}</h2>
        <span>Crie uma sequência de mensagens para agendar (nova aba).</span>
        <p class="mt-2 text-sm text-gray-600">
          Observação: vídeos devem ser em <strong>MP4</strong> (até 99 MB). Imagens em <strong>PNG</strong>.
          Áudios em <strong>MP3</strong>. Documentos em <strong>PDF</strong>.
          Se precisar reduzir ou converter arquivos, use
          <a href="https://www.compress2go.com/pt" target="_blank" class="text-blue-600 hover:underline">Compress2Go</a>.
        </p>
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
              <label class="text-sm font-medium">Arquivo ({{ passo.tipo_passo }})</label>
              <div
                :class="['mt-2 p-4 rounded-md flex items-center justify-between', dropHover[index] ? 'border-2 border-dashed border-blue-400 bg-blue-50' : 'border border-gray-300']"
                @dragover.prevent="preventAndStop($event)"
                @dragenter="onDragEnter(index, $event)"
                @dragleave="onDragLeave(index, $event)"
                @drop="onDropFile($event, index)"
              >
                <div class="flex-1 text-sm text-gray-700 cursor-pointer" @click="openFileSelector(index)">
                  <div class="font-medium">Arraste e solte ou clique para escolher</div>
                  <div class="text-xs text-gray-500 mt-1">{{ passo.file ? passo.file.name : 'Nenhum ficheiro selecionado' }}</div>
                </div>
                <button @click="openFileSelector(index)" type="button" class="ml-4 px-3 py-1 bg-white border rounded-md text-sm hover:bg-gray-100 cursor-pointer">Selecionar</button>
                <input
                  :id="`passo_file_input_${index}`"
                  type="file"
                  class="hidden"
                  :accept="getAcceptFor(passo.tipo_passo)"
                  @change="e => onFileChange(e, index)"
                />
              </div>
              <p v-if="passo.error" class="text-xs text-red-600 mt-1">{{ passo.error }}</p>
              <p class="text-xs text-gray-500 mt-1">
                Para vídeos use <strong>MP4</strong> (máx. 99 MB). Para imagens use <strong>PNG</strong>.
                Se precisar reduzir ou converter, acesse
                <a href="https://www.compress2go.com/pt" target="_blank" class="text-blue-600 hover:underline">Compress2Go</a>.
              </p>
            </div>
            <div>
              <label :for="'passo_legenda_' + index" class="text-sm">Legenda (Opcional)</label>
              <textarea :id="'passo_legenda_' + index" v-model="passo.conteudo" class="border rounded-lg p-3 resize-none h-[70px] w-full" placeholder="Escreva uma legenda opcional..."></textarea>
            </div>
          </div>
          
          <div v-if="['documento', 'audio'].includes(passo.tipo_passo)" class="flex flex-col">
            <label class="text-sm font-medium">Arquivo ({{ passo.tipo_passo }})</label>
            <div
              :class="['mt-2 p-4 rounded-md flex items-center justify-between', dropHover[index] ? 'border-2 border-dashed border-blue-400 bg-blue-50' : 'border border-gray-300']"
              @dragover.prevent="preventAndStop($event)"
              @dragenter="onDragEnter(index, $event)"
              @dragleave="onDragLeave(index, $event)"
              @drop="onDropFile($event, index)"
            >
              <div class="flex-1 text-sm text-gray-700 cursor-pointer" @click="openFileSelector(index)">
                <div class="font-medium">Arraste e solte ou clique para escolher</div>
                <div class="text-xs text-gray-500 mt-1">{{ passo.file ? passo.file.name : 'Nenhum ficheiro selecionado' }}</div>
              </div>
              <button @click="openFileSelector(index)" type="button" class="ml-4 px-3 py-1 bg-white border rounded-md text-sm hover:bg-gray-100 cursor-pointer">Selecionar</button>
              <input
                :id="`passo_file_input_${index}`"
                type="file"
                class="hidden"
                :accept="getAcceptFor(passo.tipo_passo)"
                @change="e => onFileChange(e, index)"
              />
            </div>
            <p v-if="passo.error" class="text-xs text-red-600 mt-1">{{ passo.error }}</p>
            <p class="text-xs text-gray-500 mt-1">
              Para áudios use <strong>MP3</strong>. Para documentos use <strong>PDF</strong>.
              Se precisar reduzir ou converter, acesse
              <a href="https://www.compress2go.com/pt" target="_blank" class="text-blue-600 hover:underline">Compress2Go</a>.
            </p>
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
        <button @click="fecharPopUp" type="button" class="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200">Cancelar</button>
        <button @click.prevent="submitMessage" type="submit" :disabled="!podeSalvar" class="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
          {{ textoBotaoPrincipal }}
        </button>
      </div>
    </div>
  </div>
</template>
