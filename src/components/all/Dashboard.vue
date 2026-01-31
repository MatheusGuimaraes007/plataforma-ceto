<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import Chart from 'chart.js/auto';
import SideMenu from '../desafios/SideMenu.vue';
import { supabase } from '../../composables/useSupabase';

const carregando = ref(true);
const erro = ref('');
const grupos = ref([]);
const ultimaAtualizacao = ref(null);
const chartStatusCanvas = ref(null);
const chartDiasCanvas = ref(null);
let chartStatusInstance = null;
let chartDiasInstance = null;

const statusCatalogo = [
  { key: 'ativo', label: 'Ativos', color: '#16a34a' },
  { key: 'aguardando', label: 'Aguardando', color: '#facc15' },
  { key: 'inativo', label: 'Inativos', color: '#f97316' },
  { key: 'finalizado', label: 'Finalizados', color: '#475569' },
];

const estatisticas = computed(() => {
  const resumo = {
    totalGrupos: grupos.value.length,
    totalMembros: 0,
    pessoasSemanaUm: 0,
    pessoasSemanaDois: 0,
    totalNoDesafio: 0,
    porStatus: statusCatalogo.reduce((acc, { key }) => {
      acc[key] = 0;
      return acc;
    }, { outros: 0 }),
  };

  grupos.value.forEach((grupo) => {
    const membros = Number(grupo.quantidade_pessoa) || 0;
    resumo.totalMembros += membros;

    const statusNormalizado = (grupo.status || 'outros').toLowerCase();
    if (resumo.porStatus[statusNormalizado] === undefined) {
      resumo.porStatus.outros = (resumo.porStatus.outros || 0) + 1;
    } else {
      resumo.porStatus[statusNormalizado] += 1;
    }

    if (statusNormalizado === 'ativo') {
      resumo.totalNoDesafio += membros;
    }

    const diaAtual = Number(grupo.dia_atual);
    if (!Number.isNaN(diaAtual)) {
      if (diaAtual >= 0 && diaAtual <= 5) {
        resumo.pessoasSemanaUm += membros;
      } else if (diaAtual >= 6) {
        resumo.pessoasSemanaDois += membros;
      }
    }
  });

  resumo.gruposAtivos = resumo.porStatus.ativo || 0;
  resumo.gruposInativos = resumo.porStatus.inativo || 0;

  return resumo;
});

const ultimaAtualizacaoHora = computed(() =>
  ultimaAtualizacao.value ? ultimaAtualizacao.value.toLocaleTimeString('pt-BR') : '--:--:--'
);

const ultimaAtualizacaoData = computed(() =>
  ultimaAtualizacao.value ? ultimaAtualizacao.value.toLocaleDateString('pt-BR') : 'Aguardando dados'
);

const chartDataset = computed(() =>
  statusCatalogo.map(({ key }) => estatisticas.value.porStatus[key] || 0)
);

const statusPermitidosDia = new Set(['ativo', 'aguardando']);

const diasDistribuicao = computed(() => {
  const mapa = {};

  grupos.value.forEach((grupo) => {
    const statusNormalizado = (grupo.status || '').toLowerCase();
    if (!statusPermitidosDia.has(statusNormalizado)) {
      return;
    }

    const numeroDia = Number(grupo.dia_atual);
    let label;

    if (Number.isNaN(numeroDia)) {
      label = 'Sem dia';
    } else if (numeroDia === -1) {
      label = 'Preparação';
    } else {
      label = `Dia ${numeroDia}`;
    }

    mapa[label] = (mapa[label] || 0) + 1;
  });

  return mapa;
});

const diasLabels = computed(() => Object.keys(diasDistribuicao.value));
const diasDataset = computed(() => diasLabels.value.map((label) => diasDistribuicao.value[label]));
const diaColors = ['#0ea5e9', '#f472b6', '#c084fc', '#facc15', '#34d399', '#f97316', '#94a3b8', '#a78bfa'];

const atualizarStatusChart = () => {
  if (!chartStatusCanvas.value) {
    return;
  }

  const context = chartStatusCanvas.value.getContext('2d');

  if (chartStatusInstance) {
    chartStatusInstance.destroy();
  }

  chartStatusInstance = new Chart(context, {
    type: 'doughnut',
    data: {
      labels: statusCatalogo.map((item) => item.label),
      datasets: [
        {
          data: chartDataset.value,
          backgroundColor: statusCatalogo.map((item) => item.color),
          borderWidth: 1,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    },
  });
};

const atualizarDiasChart = () => {
  if (!chartDiasCanvas.value || !diasLabels.value.length) {
    if (chartDiasInstance) {
      chartDiasInstance.destroy();
      chartDiasInstance = null;
    }
    return;
  }

  const context = chartDiasCanvas.value.getContext('2d');

  if (chartDiasInstance) {
    chartDiasInstance.destroy();
  }

  chartDiasInstance = new Chart(context, {
    type: 'pie',
    data: {
      labels: diasLabels.value,
      datasets: [
        {
          data: diasDataset.value,
          backgroundColor: diasLabels.value.map((_, idx) => diaColors[idx % diaColors.length]),
          borderWidth: 1,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    },
  });
};

const carregarGrupos = async () => {
  carregando.value = true;
  erro.value = '';

  try {
    const { data, error } = await supabase
      .from('grupos')
      .select('id_grupo, nome_grupo, status, quantidade_pessoa, data_inicio, dia_atual')
      .order('nome_grupo', { ascending: true });

    if (error) {
      throw error;
    }

    grupos.value = data || [];
    ultimaAtualizacao.value = new Date();
  } catch (fetchError) {
    erro.value = fetchError.message || 'Não foi possível carregar os grupos.';
    grupos.value = [];
  } finally {
    carregando.value = false;
  }
};

onMounted(async () => {
  await carregarGrupos();
});

watch(
  () => ({ ready: Boolean(chartStatusCanvas.value), dataset: chartDataset.value }),
  ({ ready }) => {
    if (!ready) {
      return;
    }
    atualizarStatusChart();
  },
  { deep: true }
);

watch(
  () => ({ ready: Boolean(chartDiasCanvas.value), dataset: diasDataset.value }),
  ({ ready }) => {
    if (!ready) {
      return;
    }
    atualizarDiasChart();
  },
  { deep: true }
);

onBeforeUnmount(() => {
  if (chartStatusInstance) {
    chartStatusInstance.destroy();
    chartStatusInstance = null;
  }
  if (chartDiasInstance) {
    chartDiasInstance.destroy();
    chartDiasInstance = null;
  }
});
</script>

<template>
  <div class="dashboard">
    <SideMenu />
    <main class="dashboard__content">
      <header class="dashboard__header">
        <div>
          <p class="dashboard__eyebrow">Visão geral</p>
          <h1>Dashboard</h1>
          <p class="dashboard__subtitle">
            Monitoramento rápido dos grupos e status de operação.
          </p>
        </div>
        <div class="dashboard__actions">
          <button class="dashboard__refresh" @click="carregarGrupos" :disabled="carregando">
            {{ carregando ? 'Atualizando...' : 'Recarregar dados' }}
          </button>
          <p class="dashboard__updated">
            Última atualização:
            <strong>{{ ultimaAtualizacaoHora }}</strong>
            <span>{{ ultimaAtualizacaoData }}</span>
          </p>
        </div>
      </header>

      <section v-if="erro" class="dashboard__alert">
        {{ erro }}
      </section>

      <section class="cards">
        <article class="card">
          <p>Total de grupos</p>
          <strong>{{ estatisticas.totalGrupos }}</strong>
          <span> {{ estatisticas.gruposAtivos }} ativos agora </span>
        </article>
        <article class="card">
          <p>Pessoas na semana 1</p>
          <strong>{{ estatisticas.pessoasSemanaUm }}</strong>
          <span>Dias 0 ao 5</span>
        </article>
        <article class="card">
          <p>Pessoas na semana 2+</p>
          <strong>{{ estatisticas.pessoasSemanaDois }}</strong>
          <span>Do dia 6 em diante</span>
        </article>
        <article class="card">
          <p>Total de pessoas no desafio</p>
          <strong>{{ estatisticas.totalNoDesafio }}</strong>
          <span>Soma de todos os grupos</span>
        </article>
      </section>

      <section class="panel-row">
        <article class="panel">
          <header>
            <h3>Grupos por status</h3>
          </header>
          <div class="panel__chart">
            <canvas ref="chartStatusCanvas"></canvas>
          </div>
        </article>
        <article class="panel">
          <header>
            <h3>Distribuição por dia do desafio</h3>
            <p class="panel__hint">Somente grupos ativos ou aguardando (dia -1 = Preparação).</p>
          </header>
          <div class="panel__chart">
            <canvas ref="chartDiasCanvas"></canvas>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  min-height: 100vh;
  height: 100vh;
  background: #f8fafc;
  overflow: hidden; /* impede que o layout completo role junto com o menu */
}

.dashboard__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  gap: 1.5rem;
  height: 100vh;
  overflow-y: auto; /* aplica scroll apenas no conteúdo principal */
}

.dashboard__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.dashboard__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.45rem;
}

.dashboard__updated {
  margin: 0;
  font-size: 0.85rem;
  color: #475569;
  text-align: right;
}

.dashboard__updated strong {
  margin-left: 0.25rem;
  color: #0f172a;
}

.dashboard__updated span {
  display: block;
  font-size: 0.75rem;
  color: #94a3b8;
}

.dashboard__header h1 {
  margin: 0.25rem 0;
  font-size: 2rem;
  color: #0f172a;
}

.dashboard__eyebrow {
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  color: #94a3b8;
}

.dashboard__subtitle {
  margin: 0;
  color: #475569;
}

.dashboard__refresh {
  border: none;
  border-radius: 999px;
  padding: 0.65rem 1.5rem;
  background: #0ea5e9;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.dashboard__refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dashboard__alert {
  padding: 1rem 1.25rem;
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
  border-radius: 0.75rem;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 1rem;
}

.card {
  background: #fff;
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 10px 35px rgba(15, 23, 42, 0.08);
}

.card p {
  margin: 0;
  font-size: 0.85rem;
  color: #94a3b8;
}

.card strong {
  display: block;
  margin: 0.35rem 0;
  font-size: 1.8rem;
  color: #0f172a;
}

.card span {
  font-size: 0.85rem;
  color: #64748b;
}

.panel-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.panel {
  background: #fff;
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 10px 35px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
}

.panel header {
  margin-bottom: 1rem;
}

.panel h3 {
  margin: 0;
  font-size: 1rem;
  color: #0f172a;
}

.panel__chart {
  flex: 1;
  min-height: 260px;
}

.panel__hint {
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
  color: #94a3b8;
}

@media (max-width: 768px) {
  .dashboard__content {
    padding: 5rem 1.25rem 1.5rem; /* compensa o header fixo do menu mobile */
  }

  .dashboard__header {
    flex-direction: column;
  }

  .dashboard__actions {
    width: 100%;
    align-items: flex-start;
  }

  .dashboard__updated {
    text-align: left;
  }
}
</style>
