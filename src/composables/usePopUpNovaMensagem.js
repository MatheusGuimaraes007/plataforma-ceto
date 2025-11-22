// composables/usePopUpNovaMensagem.js
import { ref } from 'vue';
import { useBibliotecaMensagem } from './useBibliotecaMensagem';

const { criarPacoteDeMensagens } = useBibliotecaMensagem();

// --- Estado do Pop-up ---
const isPopUpNovaMensagemOpen = ref(false);
const messageName = ref('');
const passos = ref([]); 

export function usePopUpNovaMensagem() {

  function togglePopUp() {
    isPopUpNovaMensagemOpen.value = !isPopUpNovaMensagemOpen.value;
    if (isPopUpNovaMensagemOpen.value) {
      messageName.value = '';
      passos.value = [{ tipo_passo: 'texto', conteudo: '' }];
    }
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
      novoPasso.conteudo = '';      // Pergunta
      novoPasso.poll_opcoes = ['']; // Opções
    }
    
    passos.value.push(novoPasso);
  }

  function removerPasso(index) {
    if (passos.value.length > 1) {
      passos.value.splice(index, 1);
    }
  }

  function adicionarOpcaoEnquete(passoIndex) {
    passos.value[passoIndex].poll_opcoes.push('');
  }

  function removerOpcaoEnquete(passoIndex, optionIndex) {
    if (passos.value[passoIndex].poll_opcoes.length > 1) {
      passos.value[passoIndex].poll_opcoes.splice(optionIndex, 1);
    }
  }

  // --- Função de Salvar (AGORA COM CONVERSÃO DE QUEBRA DE LINHA) ---
  async function submitNewMessage() {
    if (!messageName.value) {
      alert('Por favor, dê um "Código" (Nome) para este pacote.');
      return;
    }

    // 1. Processa os passos para substituir '\n' literais por '\\n'
    const passosProcessados = passos.value.map(passo => {
      // Cria uma cópia rasa do passo
      const passoModificado = { ...passo };

      // O campo 'conteudo' é usado para texto, legenda (video/imagem) e pergunta (enquete).
      if (passoModificado.conteudo) {
        // Regex para substituir todas as quebras de linha literais (o que o textarea retorna)
        // pela string de escape '\\n' (o que o servidor precisa para salvar a formatação)
        passoModificado.conteudo = passoModificado.conteudo.replace(/\n/g, '\\n');
      }

      // Se for enquete, processa as opções também
      if (passoModificado.tipo_passo === 'enquete' && passoModificado.poll_opcoes) {
        passoModificado.poll_opcoes = passoModificado.poll_opcoes.map(opcao => 
          opcao ? opcao.replace(/\n/g, '\\n') : opcao
        );
      }
      
      return passoModificado;
    });

    try {
      // 2. Passa os dados processados para a função de criação
      await criarPacoteDeMensagens(messageName.value, passosProcessados);
      
      alert('Pacote de mensagens salvo com sucesso!');
      togglePopUp();
    } catch (error) {
      console.error('Erro ao salvar o pacote:', error);
      alert('Erro ao salvar: ' + error.message);
    }
  }

  // Exporta tudo que a UI precisa
  return {
    isPopUpNovaMensagemOpen,
    messageName,
    passos,
    togglePopUp,
    adicionarPasso,
    removerPasso,
    adicionarOpcaoEnquete,
    removerOpcaoEnquete,
    submitNewMessage
  };
}