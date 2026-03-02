import { ref } from "vue";
import { supabaseCC } from "../useSupabase";

export function useUsers() {
const users = ref([]);

async function fetchUsers() {
  const { data: dataUsers, error: errorUsers } = await supabaseCC.from('contatos').select('*');
  if (errorUsers) {
    console.error('Erro ao buscar usuários:', errorUsers);
    return;
  }
  users.value = dataUsers;
}


  return { 
    users,
    fetchUsers
  }
}