import { computed, ref } from "vue";
import { useCronogramaGrupos } from "./useCronogramaGrupos";

const { criarAgendamento, atualizarAgendamento } = useCronogramaGrupos();

const isPopUpNovoAgendamentoOpen = ref(false);
const mensagemId = ref(null);
const diaDoDesafio = ref(null);
const horaEnvio = ref('');
const ativo = ref(true);
const editingAgendamentoId = ref(null);
const isEditando = computed(() => Boolean(editingAgendamentoId.value));

function resetCampos() {
  mensagemId.value = null;
  diaDoDesafio.value = null;
  horaEnvio.value = '';
  ativo.value = true;
  editingAgendamentoId.value = null;
}

function abrirParaCriar() {
  resetCampos();
  isPopUpNovoAgendamentoOpen.value = true;
}

function abrirParaEditar(agendamento) {
  if (!agendamento) {
    return;
  }
  editingAgendamentoId.value = agendamento.id_cronograma;
  mensagemId.value = agendamento.id_mensagem;
  diaDoDesafio.value = agendamento.dia_do_desafio;
  horaEnvio.value = (agendamento.hora_envio || '').slice(0, 5);
  ativo.value = Boolean(agendamento.ativo);
  isPopUpNovoAgendamentoOpen.value = true;
}

function fecharPopUp() {
  isPopUpNovoAgendamentoOpen.value = false;
  resetCampos();
}

function camposValidos() {
  return (
    mensagemId.value &&
    diaDoDesafio.value !== null &&
    diaDoDesafio.value !== undefined &&
    Boolean(horaEnvio.value)
  );
}

async function submitAgendamento() {
  if (!camposValidos()) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }

  const payload = {
    id_mensagem: mensagemId.value,
    dia_do_desafio: diaDoDesafio.value,
    hora_envio: horaEnvio.value,
    ativo: ativo.value,
  };

  try {
    if (isEditando.value) {
      await atualizarAgendamento(editingAgendamentoId.value, payload);
      alert("Agendamento atualizado com sucesso!");
    } else {
      await criarAgendamento(payload);
      alert("Agendamento criado com sucesso!");
    }
    fecharPopUp();
  } catch (error) {
    alert("Erro ao salvar o agendamento: " + error.message);
  }
}

export function useNovoAgendamento() {
  return {
    isPopUpNovoAgendamentoOpen,
    isEditando,
    mensagemId,
    diaDoDesafio,
    horaEnvio,
    ativo,
    abrirParaCriar,
    abrirParaEditar,
    fecharPopUp,
    submitAgendamento,
  };
}
