import { ref } from "vue";
import { supabase } from "./useSupabase";

const grupos = ref([]);
const isLoading = ref(false);

export function useGrupos() {

  async function fetchGrupos() {
    isLoading.value = true;
    try {
      const { data, error } = await supabase
        .from('grupos')
        .select('*')
        .order('id_grupo', { ascending: true });

      if (error) throw error;
      
      grupos.value = data;
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
    } finally {
      isLoading.value = false;
    }
  }

  async function atualizarGrupo(grupo) {
    // Prepara o objeto apenas com os campos permitidos para edição
    const updates = {
      status: grupo.status,
      data_inicio: grupo.data_inicio,
      dia_atual: grupo.dia_atual,
      // Adicione outros campos aqui se decidir liberar mais edições no futuro
    };

    try {
      const { error } = await supabase
        .from('grupos')
        .update(updates)
        .eq('id_grupo', grupo.id_grupo);

      if (error) throw error;

      // Retorna sucesso para controle de UI
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar grupo:', error);
      return { success: false, error };
    }
  }

  return {
    grupos,
    isLoading,
    fetchGrupos,
    atualizarGrupo
  };
}