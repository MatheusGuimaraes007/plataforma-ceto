import { ref } from "vue";
import { supabase } from "./useSupabase";

export function useMembersGroups() {
  const leadsFreeCleaning = ref([]);
  const paginatedLeads = ref([]);
  const totalLeads = ref(0);
  const page = ref(1);
  const itemsPerPage = 50;
  const freeCleaningDailyCounts = ref({});
  const utmCampaignCounts = ref({});

  // cria consulta base com filtro FreeCleaning + plataforma LP
  function baseQuery() {
    return supabase
      .from('compradores')
      .select('*', { count: 'exact' })
      .eq('plataforma', 'LP')
      
  }

  // busca todos os leads (sem paginação) para gerar o gráfico e o total geral
  async function fetchAllFreeCleaningLeads() {
    const { data, error } = await baseQuery();
    if (error) {
      console.error('Erro ao carregar todos os leads FreeCleaning:', error);
      return;
    }
    leadsFreeCleaning.value = data || [];
  }

  // busca apenas a página atual de leads e atualiza total
  async function fetchPaginatedFreeCleaningLeads(p = 1) {
    page.value = p;
    const from = (p - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    let query = baseQuery().range(from, to);
    const { data, count, error } = await query;
    if (error) {
      console.error('Erro ao buscar leads paginados FreeCleaning:', error);
      return;
    }

    paginatedLeads.value = data || [];
    totalLeads.value = count || 0;
  }

  // agrupa os leads carregados em contagens por dia
  function computeFreeCleaningDailyCounts() {
    const counts = {};
    const list = Array.isArray(leadsFreeCleaning.value) ? leadsFreeCleaning.value : [];

    console.log('computing counts for', list.length, 'leads');

    const campaignCounts = {};
    list.forEach((lead) => {
      let dateKey = null;
      // usamos diretamente data_compra para garantir formato dd/mm/yyyy
      if (lead?.data_compra) {
        dateKey = lead.data_compra;
      }
      // se não existir, caímos em created_at como backup
      if (!dateKey && lead?.created_at) {
        const d = new Date(lead.created_at);
        if (!isNaN(d)) {
          dateKey = d.toLocaleDateString('pt-BR');
        }
      }
      if (!dateKey) {
        dateKey = 'Sem data';
      }
      console.log('lead', lead.id || lead.email || '(no id)', 'parsed dateKey', dateKey);
      counts[dateKey] = (counts[dateKey] || 0) + 1;

      // also count by utm_campaign
      const camp = lead?.utm_campaign || 'unknown';
      campaignCounts[camp] = (campaignCounts[camp] || 0) + 1;
    });
    utmCampaignCounts.value = campaignCounts;

    freeCleaningDailyCounts.value = counts;
    console.log('final counts object', counts);
  }

  // função auxiliar que carrega e processa todos os dados para o gráfico
  async function fetchFreeCleaningDailyCounts() {
    await fetchAllFreeCleaningLeads();
    computeFreeCleaningDailyCounts();
  }

  return {
    leadsFreeCleaning,
    paginatedLeads,
    totalLeads,
    page,
    itemsPerPage,
    freeCleaningDailyCounts,
    utmCampaignCounts,
    fetchAllFreeCleaningLeads,
    fetchPaginatedFreeCleaningLeads,
    fetchFreeCleaningDailyCounts,
  };
}