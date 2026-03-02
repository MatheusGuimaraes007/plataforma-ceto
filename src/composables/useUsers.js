import { ref } from 'vue';
import { supabase } from './useSupabase';

export function useUsers() {
  const users = ref([]);

  async function fetchUsers() {
    const { data: dataUsers, error: errorUsers } = await supabase.from('usuarios').select('*') 
  }

  return {

  }
}