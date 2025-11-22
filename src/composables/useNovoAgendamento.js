import { ref } from "vue";
import { useCronogramaGrupos } from "./useCronogramaGrupos";

const { criarAgendamento } = useCronogramaGrupos();

// ✨ 1. CORRIGIDO: Erro de digitação 'ip' -> 'is'
const isPopUpNovoAgendamentoOpen = ref(false); 
const mensagemId = ref(null);
const diaDoDesafio = ref(null); 
const horaEnvio = ref('');
const ativo = ref(true);

export function useNovoAgendamento() {

  async function togglePopUp() {
    // ✨ 2. CORRIGIDO: Usando o nome da variável correta
    isPopUpNovoAgendamentoOpen.value = !isPopUpNovoAgendamentoOpen.value;
  }
  
  async function clearFields() {
    mensagemId.value = null;
    diaDoDesafio.value = null;
    horaEnvio.value = '';
    ativo.value = true;
  }

  async function submitNewAgendamento() {
    if (!mensagemId.value || diaDoDesafio.value === null || diaDoDesafio.value === undefined || !horaEnvio.value) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    const novoAgendamento = {
      id_mensagem: mensagemId.value,
      dia_do_desafio: diaDoDesafio.value,
      hora_envio: horaEnvio.value,
      ativo: ativo.value,
      // ✨ 3. CORRIGIDO: Removida a linha 'created_at'.
      //    É melhor deixar o Supabase definir isso com now().
    };
    
    try {
      await criarAgendamento(novoAgendamento);
      clearFields();
      alert("Agendamento criado com sucesso!");
      togglePopUp();
    } catch (error) {
      alert("Erro ao criar o agendamento: " + error.message);
    }
  }

  return {
    // ✨ 4. CORRIGIDO: Exportando o nome correto
    isPopUpNovoAgendamentoOpen,
    mensagemId,
    diaDoDesafio,
    horaEnvio,
    ativo,
    togglePopUp,
    submitNewAgendamento
  }
}
