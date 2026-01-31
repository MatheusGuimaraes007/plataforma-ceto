// composables/usePopUpNovaMensagem.js
import { computed, ref } from 'vue';
import { useBibliotecaMensagem } from './useBibliotecaMensagem';

const { criarPacoteDeMensagens, atualizarPacoteMensagem } = useBibliotecaMensagem();

// --- Estado do Pop-up ---
const isPopUpNovaMensagemOpen = ref(false);
const messageName = ref('');
const passos = ref([{ tipo_passo: 'texto', conteudo: '' }]);
const editingPacoteId = ref(null);
const isEditando = computed(() => Boolean(editingPacoteId.value));

function normalizarTexto(valor) {
  return valor ? valor.replace(/\\n/g, '\n') : '';
}

function resetFormulario() {
  messageName.value = '';
  passos.value = [{ tipo_passo: 'texto', conteudo: '' }];
  editingPacoteId.value = null;
}

function abrirParaCriar() {
  resetFormulario();
  isPopUpNovaMensagemOpen.value = true;
}

function abrirParaEditar(pacote) {
  if (!pacote) {
    return;
  }
  editingPacoteId.value = pacote.id_mensagem;
  messageName.value = pacote.nome_mensagem || '';

  const passosNormalizados = (pacote.mensagens_passos || [])
    .slice()
    .sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
    .map((passo) => {
      const passoNormalizado = {
        tipo_passo: passo.tipo_passo,
        conteudo: normalizarTexto(passo.conteudo),
      };

      if (['video', 'imagem', 'documento', 'audio'].includes(passo.tipo_passo)) {
        passoNormalizado.url = passo.url || '';
      }

      if (passo.tipo_passo === 'enquete') {
        const opcoes = Array.isArray(passo.poll_opcoes) && passo.poll_opcoes.length
          ? passo.poll_opcoes
          : [''];
        passoNormalizado.poll_opcoes = opcoes.map((opcao) => normalizarTexto(opcao));
      }

      if (!passoNormalizado.conteudo && passo.tipo_passo === 'texto') {
        passoNormalizado.conteudo = '';
      }

      return passoNormalizado;
    });

  passos.value = passosNormalizados.length ? passosNormalizados : [{ tipo_passo: 'texto', conteudo: '' }];
  isPopUpNovaMensagemOpen.value = true;
}

function fecharPopUp() {
  isPopUpNovaMensagemOpen.value = false;
  resetFormulario();
}

// --- Funções da UI ---
function adicionarPasso(tipo) {
  const novoPasso = { tipo_passo: tipo };

  if (tipo === 'texto') {
    novoPasso.conteudo = '';
  }

  // O 'conteudo' serve para legenda em video/imagem
  if (['video', 'imagem'].includes(tipo)) {
    novoPasso.url = '';
    novoPasso.conteudo = '';
  }

  if (['documento', 'audio'].includes(tipo)) {
    novoPasso.url = '';
  }

  if (tipo === 'enquete') {
    novoPasso.conteudo = '';
    novoPasso.poll_opcoes = [''];
  }

  passos.value.push(novoPasso);
}

function removerPasso(index) {
  if (passos.value.length > 1) {
    passos.value.splice(index, 1);
  }
}

function adicionarOpcaoEnquete(passoIndex) {
  if (!passos.value[passoIndex].poll_opcoes) {
    passos.value[passoIndex].poll_opcoes = [''];
  }
  passos.value[passoIndex].poll_opcoes.push('');
}

function removerOpcaoEnquete(passoIndex, optionIndex) {
  if (passos.value[passoIndex].poll_opcoes.length > 1) {
    passos.value[passoIndex].poll_opcoes.splice(optionIndex, 1);
  }
}

// --- Função de Salvar (AGORA COM CONVERSÃO DE QUEBRA DE LINHA) ---
async function submitMessage() {
  if (!messageName.value) {
    alert('Por favor, dê um "Código" (Nome) para este pacote.');
    return;
  }

  // 1. Processa os passos para substituir '\n' literais por '\\n'
  const passosProcessados = passos.value.map((passo) => {
    const passoModificado = { ...passo };

    if (passoModificado.conteudo) {
      passoModificado.conteudo = passoModificado.conteudo.replace(/\n/g, '\\n');
    }

    if (passoModificado.tipo_passo === 'enquete' && passoModificado.poll_opcoes) {
      passoModificado.poll_opcoes = passoModificado.poll_opcoes.map((opcao) =>
        opcao ? opcao.replace(/\n/g, '\\n') : opcao
      );
    }

    return passoModificado;
  });

  try {
    if (isEditando.value) {
      await atualizarPacoteMensagem(editingPacoteId.value, messageName.value, passosProcessados);
      alert('Pacote de mensagens atualizado com sucesso!');
    } else {
      await criarPacoteDeMensagens(messageName.value, passosProcessados);
      alert('Pacote de mensagens salvo com sucesso!');
    }

    fecharPopUp();
  } catch (error) {
    console.error('Erro ao salvar o pacote:', error);
    alert('Erro ao salvar: ' + error.message);
  }
}

export function usePopUpNovaMensagem() {
  return {
    isPopUpNovaMensagemOpen,
    isEditando,
    messageName,
    passos,
    abrirParaCriar,
    abrirParaEditar,
    fecharPopUp,
    adicionarPasso,
    removerPasso,
    adicionarOpcaoEnquete,
    removerOpcaoEnquete,
    submitMessage,
  };
}