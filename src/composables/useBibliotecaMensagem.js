// composables/useBibliotecaMensagem.js
import { ref } from 'vue';
import { supabase } from './useSupabase';

const mensagens = ref([]); 

export function useBibliotecaMensagem() {
  
  async function fetchMessages() {
    // Busca o "pacote" E TODOS os dados dos "passos"
    const { data, error } = await supabase
      .from('mensagens_template')
      .select(`
        id_mensagem,
        nome_mensagem,
        created_at,
        mensagens_passos ( * ) 
      `)
      .order('id_mensagem', { ascending: true }) // Mantém a ordenação por ID na API (a ordenação alfabética será feita no Vue)
      .order('ordem', { referencedTable: 'mensagens_passos', ascending: true }); 
      
    if (error) {
      console.error('Erro ao buscar pacotes e passos:', error); 
      return;
    }
    mensagens.value = data;
  }
  
  async function criarPacoteDeMensagens(nomePacote, passosDoFormulario) {
    // 1. Cria o Pacote
    const { data: pacoteData, error: pacoteError } = await supabase
      .from('mensagens_template')
      .insert({ nome_mensagem: nomePacote }) 
      .select()
      .single();
    if (pacoteError) throw pacoteError;
    const novoPacoteId = pacoteData.id_mensagem;

    // 2. Tenta salvar os Passos
    try {
      const passosParaSalvar = passosDoFormulario.map((passo, index) => {
        let opcoesLimpas = null;
        if (passo.tipo_passo === 'enquete') {
          opcoesLimpas = passo.poll_opcoes.filter(opt => opt && opt.trim() !== '');
          if (opcoesLimpas.length === 0) {
            throw new Error(`A Enquete no Passo ${index + 1} precisa de pelo menos uma opção.`);
          }
        }
        return {
          id_mensagem: novoPacoteId,
          ordem: index + 1,
          tipo_passo: passo.tipo_passo,
          conteudo: passo.conteudo || null,
          url: passo.url || null,
          poll_opcoes: opcoesLimpas
        };
      });

      // 3. Salva todos os Passos
      const { error: passosError } = await supabase
        .from('mensagens_passos')
        .insert(passosParaSalvar);
      if (passosError) throw passosError;
      
      await fetchMessages(); // Atualiza a lista na UI

    } catch (error) {
      // Rollback
      console.error("Erro ao salvar passos, fazendo rollback...", error);
      await supabase.from('mensagens_template').delete().eq('id_mensagem', novoPacoteId);
      throw error; 
    }
  }

  // Função para deletar um pacote
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
    deletarPacoteMensagem 
  }
}