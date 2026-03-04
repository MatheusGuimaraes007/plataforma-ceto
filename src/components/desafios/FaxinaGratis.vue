<script setup>
import { onMounted, computed, ref, watch, onBeforeUnmount } from 'vue';
import Chart from 'chart.js/auto';
import SideMenu from './SideMenu.vue';
import { useMembersGroups } from '../../composables/useMembersGroups';

// utility para formatar horário a partir de timestamp ISO
function formatTime(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  if (isNaN(d)) return '';
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

const {
  paginatedLeads,
  totalLeads,
  page,
  itemsPerPage,
  freeCleaningDailyCounts,
  utmCampaignCounts,
  fetchPaginatedFreeCleaningLeads,
  fetchFreeCleaningDailyCounts,
} = useMembersGroups();

const loading = ref(true);
const daysChartCanvas = ref(null);
let daysChartInstance = null;
const pieChartCanvas = ref(null);
let pieChartInstance = null;
let refreshInterval = null;

// Load both paginated data and all data for counts
onMounted(async () => {
  await Promise.all([
    fetchFreeCleaningDailyCounts(),
    fetchPaginatedFreeCleaningLeads(page.value),
  ]);
  loading.value = false;
  // garantir renderização inicial dos gráficos
  renderDaysChart();
  renderPieChart();
  // caso ainda não tenha desenhado por algum motivo, tenta novamente em breve
  setTimeout(() => { renderDaysChart(); renderPieChart(); }, 100);
  
  // atualizar dados em tempo real a cada 5 segundos
  refreshInterval = setInterval(async () => {
    await Promise.all([
      fetchFreeCleaningDailyCounts(),
      fetchPaginatedFreeCleaningLeads(page.value),
    ]);
  }, 5000);
});

// limpar intervalo ao desmontar o componente
onBeforeUnmount(() => {
  if (refreshInterval) clearInterval(refreshInterval);
});

watch(page, (p) => {
  fetchPaginatedFreeCleaningLeads(p);
});

// chart helpers
const sortedDates = computed(() => {
  const obj = freeCleaningDailyCounts.value || {};
  return Object.keys(obj).sort((a, b) => {
    const toIso = (str) => {
      const parts = str.split('/');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
      }
      return str;
    };
    const ia = toIso(a);
    const ib = toIso(b);
    return ia.localeCompare(ib);
  });
});

// campaigns pie
const campaignLabels = computed(() => Object.keys(utmCampaignCounts.value || {}));
const campaignDataset = computed(() => campaignLabels.value.map(l => utmCampaignCounts.value[l] || 0));

const daysDataset = computed(() => {
  const ds = sortedDates.value.map((d) => freeCleaningDailyCounts.value?.[d] || 0);
  console.log('computed daysDataset', sortedDates.value, ds);
  return ds;
});

const totalPages = computed(() =>
  Math.ceil(totalLeads.value / itemsPerPage)
);

function renderDaysChart() {
  if (!daysChartCanvas.value) return;
  console.log('renderDaysChart:', sortedDates.value, daysDataset.value);
  const ctx = daysChartCanvas.value.getContext('2d');
  if (daysChartInstance) daysChartInstance.destroy();
  daysChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: sortedDates.value,
      datasets: [
        {
          label: 'Leads por dia',
          data: daysDataset.value,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Leads por Dia (Tempo Real)',
          font: { size: 16 }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    },
  });
}

function renderPieChart() {
  if (!pieChartCanvas.value) return;
  console.log('renderPieChart:', campaignLabels.value, campaignDataset.value);
  const ctx = pieChartCanvas.value.getContext('2d');
  if (pieChartInstance) pieChartInstance.destroy();
  pieChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: campaignLabels.value,
      datasets: [{ data: campaignDataset.value, backgroundColor: ['#3b82f6','#f87171','#34d399','#facc15','#a78bfa'] }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'UTM Campaign',
          font: { size: 16 }
        }
      }
    },
  });
}

// ensure chart re-renders whenever underlying counts or labels change
watch([freeCleaningDailyCounts, sortedDates, daysDataset, utmCampaignCounts, campaignLabels, campaignDataset], () => {
  console.log('watch triggered', { sortedDates: sortedDates.value, daysDataset: daysDataset.value, campaignLabels: campaignLabels.value, campaignDataset: campaignDataset.value });
  renderDaysChart();
  renderPieChart();
});
</script>
<!-- duplicated script block removed; formatTime moved into top script -->

<template>
  <div class="flex h-screen w-screen bg-gray-50">
    <SideMenu />

    <div class="flex-1 flex flex-col h-screen overflow-hidden">
      <div class="p-6 border-b border-gray-300 bg-white">
        <h1 class="text-3xl font-bold text-gray-800">Desafio Faxina Grátis</h1>
        <span class="text-gray-500">
          Contagem de membros por dia para o desafio de faxina grátis
        </span>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        <div v-if="loading" class="text-gray-500">
          Carregando dados...
        </div>
        <div v-else>
          <!-- total geral -->
          <div class="mb-4">
            <span class="text-gray-700 font-semibold">Total de leads:</span> {{ totalLeads }}
          </div>

          <!-- gráficos lado a lado -->
          <div class="flex gap-4 mb-6">
            <div class="flex-1 h-64">
              <canvas ref="daysChartCanvas" class="w-full h-full"></canvas>
            </div>
            <div class="flex-1 h-64">
              <canvas ref="pieChartCanvas" class="w-full h-full"></canvas>
            </div>
          </div>

          <!-- tabela de distribuição diária simples para acessibilidade -->
          <table v-if="sortedDates.length" class="min-w-full divide-y divide-gray-200 bg-white shadow rounded-lg mb-6">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Data
                </th>
                <th class="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Quantidade de pessoas
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(date, idx) in sortedDates" :key="date">
                <td class="px-4 py-2 text-sm text-gray-800">{{ date }}</td>
                <td class="px-4 py-2 text-sm text-gray-800">
                  {{ daysDataset[idx] || 0 }}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- compradores paginados -->
          <div>
            <table class="min-w-full divide-y divide-gray-200 bg-white shadow rounded-lg">
              <thead class="bg-gray-100">
                <tr>
                  <th class="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Nome</th>
                  <th class="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Email</th>
                  <th class="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Data Compra</th>
                  <th class="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Horário</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="lead in paginatedLeads" :key="lead.id">
                  <td class="px-4 py-2 text-sm text-gray-800">{{ lead.nome }}</td>
                  <td class="px-4 py-2 text-sm text-gray-800">{{ lead.email }}</td>
                  <td class="px-4 py-2 text-sm text-gray-800">{{ lead.data_compra }}</td>
                  <td class="px-4 py-2 text-sm text-gray-800">{{ formatTime(lead.created_at) }}</td>
                </tr>
              </tbody>
            </table>

            <!-- paginação -->
            <div class="flex justify-between items-center mt-4">
              <button
                class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                :disabled="page <= 1"
                @click="page--"
              >Anterior</button>
              <span>página {{ page }} de {{ totalPages }}</span>
              <button
                class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                :disabled="page >= totalPages"
                @click="page++"
              >Próxima</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>