import { ref } from "vue";
import { supabase } from "./useSupabase";

const grupos = ref([]);
const isLoading = ref(false);
const totalGrupos = ref(0);
const page = ref(1);
const itensPorPagina = 50;

export function useGrupos() {

  async function fetchGrupos(paginaAtual = 1, busca = '') {
    isLoading.value = true;
    page.value = paginaAtual;
    
    const from = (paginaAtual - 1) * itensPorPagina;
    const to = from + itensPorPagina - 1;

    try {
      // 1. Query Base (Comum para contagem e dados)
      // Usamos 'let' para poder adicionar filtros condicionalmente
      let queryBase = supabase.from('grupos');

      // Prepara o filtro se houver busca
      const termoBusca = busca && busca.trim() !== '' ? `%${busca}%` : null;

      // --- A. QUERY DE CONTAGEM (TOTAL) ---
      let countQuery = queryBase.select('*', { count: 'exact', head: true });
      
      if (termoBusca) {
        countQuery = countQuery.ilike('nome_grupo', termoBusca);
      }

      // --- B. QUERY DE DADOS (PAGINADOS) ---
      let dataQuery = queryBase.select('*');
      
      if (termoBusca) {
        dataQuery = dataQuery.ilike('nome_grupo', termoBusca);
      }

      // Ordenação e Paginação
      // CORREÇÃO: Usando 'id_grupo' pois 'created_at' não existe na tabela
      dataQuery = dataQuery
        .order('id_grupo', { ascending: false }) 
        .range(from, to);

      // Executa as duas requisições em paralelo
      const [countResult, dataResult] = await Promise.all([
        countQuery,
        dataQuery
      ]);

      // Verifica erros
      if (countResult.error) throw countResult.error;
      if (dataResult.error) throw dataResult.error;

      // Atualiza estado
      totalGrupos.value = countResult.count;
      grupos.value = dataResult.data;

    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
    } finally {
      isLoading.value = false;
    }
  }

  async function atualizarGrupo(grupo) {
    const updates = {
      status: grupo.status,
      data_inicio: grupo.data_inicio,
      dia_atual: grupo.dia_atual,
    };

    try {
      const { error } = await supabase
        .from('grupos')
        .update(updates)
        .eq('id_grupo', grupo.id_grupo);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar grupo:', error);
      return { success: false, error };
    }
  }

  return {
    grupos,
    isLoading,
    totalGrupos,
    page,
    itensPorPagina,
    fetchGrupos,
    atualizarGrupo
  };
}