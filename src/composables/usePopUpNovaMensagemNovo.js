// composables/usePopUpNovaMensagemNovo.js
// Variante do pop-up que faz upload de arquivos para o bucket PlataformaCS antes de salvar.
import { computed, ref } from 'vue';
import { useBibliotecaMensagemNovo } from './useBibliotecaMensagemNovo';
import { supabase } from './useSupabase';

const { criarPacoteDeMensagens, atualizarPacoteMensagem } = useBibliotecaMensagemNovo();

// --- Estado do Pop-up ---
const isPopUpNovaMensagemOpen = ref(false);
const messageName = ref('');
const passos = ref([]); // começa vazio, o usuário adiciona os passos manualmente
const editingPacoteId = ref(null);
const isEditando = computed(() => Boolean(editingPacoteId.value));

function normalizarTexto(valor) {
  return valor ? valor.replace(/\n/g, '\n') : '';
}

function resetFormulario() {
  messageName.value = '';
  passos.value = []; // nenhum passo por padrão
  editingPacoteId.value = null;
}

function abrirParaCriar() {
  resetFormulario();
  isPopUpNovaMensagemOpen.value = true;
}

// garantir que ao abrir o pop-up (especialmente após edição) a lista de passos esteja limpa
import { watch } from 'vue';
watch(isPopUpNovaMensagemOpen, (val) => {
  if (val && !isEditando.value) {
    resetFormulario();
  }
});

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

// Funções da UI (mesmas do original)
function adicionarPasso(tipo) {
  const novoPasso = { tipo_passo: tipo };
  if (tipo === 'texto') {
    novoPasso.conteudo = '';
  }
  if (['video', 'imagem'].includes(tipo)) {
    novoPasso.file = null;
    novoPasso.conteudo = '';
  }
  if (['documento', 'audio'].includes(tipo)) {
    novoPasso.file = null;
  }
  if (tipo === 'enquete') {
    novoPasso.conteudo = '';
    novoPasso.poll_opcoes = [''];
  }
  passos.value.push(novoPasso);
}

function removerPasso(index) {
  // Permite remover qualquer passo (inclusive o último), voltando à tela de seleção
  passos.value.splice(index, 1);
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

// upload helper
async function uploadIfNeeded(passo, pacoteId) {
  if (!passo.file) return;
  const ext = passo.file.name.split('.').pop();
  const fileName = `PlataformaCS/${pacoteId || 'temp'}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { error: upErr } = await supabase
       .storage
       .from('PlataformaCS')
       .upload(fileName, passo.file);
  if (upErr) throw upErr;
  const { data: { publicUrl } } =
        supabase.storage.from('PlataformaCS').getPublicUrl(fileName);
  passo.url = publicUrl;
  delete passo.file;
}

// Função de Salvar (com upload)
async function submitMessage() {
  if (!messageName.value) {
    alert('Por favor, dê um "Código" (Nome) para este pacote.');
    return;
  }

  if (!passos.value || passos.value.length === 0) {
    alert('Adicione pelo menos um passo antes de salvar.');
    return;
  }

  // validação adicional: cada passo deve conter algo significativo
  const temConteudo = passos.value.some((p) => {
    if (p.tipo_passo === 'texto') return p.conteudo && p.conteudo.trim() !== '';
    if (['video','imagem','documento','audio'].includes(p.tipo_passo)) {
      return ((p.url && p.url.trim() !== '') || p.file) && !p.error;
    }
    if (p.tipo_passo === 'enquete') {
      return Array.isArray(p.poll_opcoes) && p.poll_opcoes.some(o => o && o.trim() !== '');
    }
    return false;
  });
  if (!temConteudo) {
    alert('Preencha o conteúdo de pelo menos um passo antes de salvar.');
    return;
  }

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
    // upload de arquivos antes de enviar:
    for (const passo of passosProcessados) {
      await uploadIfNeeded(passo, editingPacoteId.value || null);
    }

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

export function usePopUpNovaMensagemNovo() {
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
