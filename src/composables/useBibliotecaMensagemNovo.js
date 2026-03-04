// composables/useBibliotecaMensagemNovo.js
// Versão duplicada do useBibliotecaMensagem.js utilizada
// pela aba "nova" com suporte a upload de arquivos.
import { ref } from 'vue';
import { supabase } from './useSupabase';

const mensagens = ref([]);

function prepararPassosParaSalvar(passosDoFormulario, pacoteId) {
  return passosDoFormulario.map((passo, index) => {
    let opcoesLimpas = null;
    if (passo.tipo_passo === 'enquete') {
      opcoesLimpas = (passo.poll_opcoes || []).filter((opt) => opt && opt.trim() !== '');
      if (opcoesLimpas.length === 0) {
        throw new Error(`A Enquete no Passo ${index + 1} precisa de pelo menos uma opção.`);
      }
    }

    return {
      id_mensagem: pacoteId,
      ordem: index + 1,
      tipo_passo: passo.tipo_passo,
      conteudo: passo.conteudo || null,
      url: passo.url || null,
      poll_opcoes: opcoesLimpas,
    };
  });
}

export function useBibliotecaMensagemNovo() {
  async function fetchMessages() {
    const { data, error } = await supabase
      .from('mensagens_template')
      .select(`
        id_mensagem,
        nome_mensagem,
        created_at,
        mensagens_passos ( * ) 
      `)
      .order('id_mensagem', { ascending: true })
      .order('ordem', { referencedTable: 'mensagens_passos', ascending: true });

    if (error) {
      console.error('Erro ao buscar pacotes e passos:', error);
      return;
    }
    mensagens.value = data;
  }

  async function criarPacoteDeMensagens(nomePacote, passosDoFormulario) {
    const { data: pacoteData, error: pacoteError } = await supabase
      .from('mensagens_template')
      .insert({ nome_mensagem: nomePacote })
      .select()
      .single();
    if (pacoteError) throw pacoteError;
    const novoPacoteId = pacoteData.id_mensagem;

    try {
      const passosParaSalvar = prepararPassosParaSalvar(passosDoFormulario, novoPacoteId);
      const { error: passosError } = await supabase
        .from('mensagens_passos')
        .insert(passosParaSalvar);
      if (passosError) throw passosError;
      await fetchMessages();
    } catch (error) {
      console.error("Erro ao salvar passos, fazendo rollback...", error);
      await supabase.from('mensagens_template').delete().eq('id_mensagem', novoPacoteId);
      throw error;
    }
  }

  async function atualizarPacoteMensagem(pacoteId, nomePacote, passosDoFormulario) {
    const { error: updateTemplateError } = await supabase
      .from('mensagens_template')
      .update({ nome_mensagem: nomePacote })
      .eq('id_mensagem', pacoteId);
    if (updateTemplateError) {
      throw updateTemplateError;
    }

    const { error: deletePassosError } = await supabase
      .from('mensagens_passos')
      .delete()
      .eq('id_mensagem', pacoteId);
    if (deletePassosError) {
      throw deletePassosError;
    }

    const passosParaSalvar = prepararPassosParaSalvar(passosDoFormulario, pacoteId);

    const { error: insertNovosPassosError } = await supabase
      .from('mensagens_passos')
      .insert(passosParaSalvar);
    if (insertNovosPassosError) {
      throw insertNovosPassosError;
    }

    await fetchMessages();
  }

  async function deletarPacoteMensagem(pacoteId) {
    const { error } = await supabase
      .from('mensagens_template')
      .delete()
      .eq('id_mensagem', pacoteId);
    if (error) {
      console.error('Erro ao deletar pacote:', error);
      throw error;
    }
    mensagens.value = mensagens.value.filter(
      pacote => pacote.id_mensagem !== pacoteId
    );
  }

  return {
    mensagens,
    fetchMessages,
    criarPacoteDeMensagens,
    atualizarPacoteMensagem,
    deletarPacoteMensagem
  };
}
