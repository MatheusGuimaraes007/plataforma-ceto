import { ref } from "vue";
import { supabase } from "./useSupabase";

const agendamentos = ref([]);

export function useCronogramaGrupos() {

  async function fetchAgendamentos() {
    const { data, error } = await supabase
      .from('cronograma')
      .select(`
        *,
        mensagens_template (
          nome_mensagem,
          mensagens_passos (* )
        ) 
      `)
      .order('dia_do_desafio', { ascending: true })
      .order('hora_envio', { ascending: true });

    if (error) {
      console.error('Erro ao buscar agendamentos:', error);
      return;
    }
    agendamentos.value = (data || []).map((item) => ({
      ...item,
      mensagens_template: item.mensagens_template
        ? {
            ...item.mensagens_template,
            mensagens_passos: (item.mensagens_template.mensagens_passos || []).slice().sort(
              (a, b) => (a.ordem || 0) - (b.ordem || 0)
            ),
          }
        : null,
    }));
  }

  async function criarAgendamento(novoAgendamento) {
    const { data, error } = await supabase
      .from('cronograma')
      .insert(novoAgendamento)
      .select();
      
    if (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }
    
    if (data && data.length > 0) {
      await fetchAgendamentos(); 
    }
  }

  async function atualizarStatusAgendamento(id, novoStatus) {
    const { error } = await supabase
      .from('cronograma')
      .update({ ativo: novoStatus })
      .eq('id_cronograma', id);

    if (error) {
      console.error('Erro ao atualizar status:', error);
      return;
    }
    const item = agendamentos.value.find(ag => ag.id_cronograma === id);
    if (item) {
      item.ativo = novoStatus;
    }
  }

  async function atualizarAgendamento(id, dadosAtualizados) {
    const { error } = await supabase
      .from('cronograma')
      .update(dadosAtualizados)
      .eq('id_cronograma', id);

    if (error) {
      console.error('Erro ao atualizar agendamento:', error);
      throw error;
    }

    await fetchAgendamentos();
  }

  async function deletarAgendamento(id) {
    const { error } = await supabase
      .from('cronograma')
      .delete()
      .eq('id_cronograma', id);

    if (error) {
      console.error('Erro ao excluir agendamento:', error);
      throw error;
    }

    agendamentos.value = agendamentos.value.filter(
      (agendamento) => agendamento.id_cronograma !== id
    );
  }

  return {
    agendamentos,
    fetchAgendamentos,
    criarAgendamento,
    atualizarStatusAgendamento,
    atualizarAgendamento,
    deletarAgendamento,
  }
}
