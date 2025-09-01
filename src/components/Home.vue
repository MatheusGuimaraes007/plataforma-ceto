<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../composables/useSupabase'
import ChartCard from './ChartCard.vue'
import { groupCount, topN, byDateCount, conversionByKey } from '../composables/useAggs'

// estado/abas
const tab = ref('geral')

// dados
const all = ref([])
const buyers = ref([])
const loading = ref(true)
const errorMsg = ref('')

// campos que tentaremos usar (se algum não existir, tratamos como "Não informado")
const SELECT_FIELDS = `*` // ou liste só o que precisa
const PAGE_SIZE = 1000

async function fetchAll(table, buildFilter) {
  const rows = []
  let from = 0
  while (true) {
    let q = supabase.from(table).select(SELECT_FIELDS).range(from, from + PAGE_SIZE - 1)
    if (buildFilter) q = buildFilter(q)
    const { data, error } = await q
    if (error) throw error
    rows.push(...(data || []))
    if (!data || data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }
  return rows
}

onMounted(async () => {
  try {
    loading.value = true

    // Geral (tudo)
    all.value = await fetchAll('respostas_anamnese_padronizadas')

    // Compradores (true)
    buyers.value = await fetchAll(
      'respostas_anamnese_padronizadas',
      q => q.eq('comprou_metaflex', true)
    )
  } catch (e) {
    errorMsg.value = e.message || String(e)
  } finally {
    loading.value = false
  }
})


// KPIs
const kpis = computed(() => {
  const total = all.value.length
  const comp = buyers.value.length
  const taxa = total ? (comp / total) * 100 : 0
  return { total, comp, taxa: +taxa.toFixed(2) }
})

// datasets dinâmicos (Geral vs Compradores)
const dataset = computed(() => (tab.value === 'compradores' ? buyers.value : all.value))

// gráficos
const g_utmSource = computed(() => topN(groupCount(dataset.value, 'utm_source', { label: 'utm_source' }), 8))
const g_utmCampaign = computed(() => topN(groupCount(dataset.value, 'utm_campaign', { label: 'utm_campaign' }), 10))
const g_origem = computed(() => topN(groupCount(dataset.value, 'por_onde_conheceu', { label: 'Origem (form)' }), 10))
const g_renda = computed(() => groupCount(dataset.value, 'renda_familiar', { label: 'Renda' }))
const g_tempo = computed(() => groupCount(dataset.value, 'tempo_conhece', { label: 'Tempo que conhece' }))
const g_exercicio = computed(() => groupCount(dataset.value, 'exercicio_fisico', { label: 'Exercício físico' }))
const g_fase = computed(() => groupCount(dataset.value, 'fase_da_vida', { label: 'Fase da vida' }))
const g_porDia = computed(() => byDateCount(dataset.value, 'created_at'))

// tabela de conversão por UTM (só faz sentido na aba Geral)
const conv_utm_source = computed(() => conversionByKey(all.value, buyers.value, 'utm_source'))
const conv_utm_campaign = computed(() => conversionByKey(all.value, buyers.value, 'utm_campaign'))

// paginação simples da tabela raw
const page = ref(1)
const perPage = 25
const rows = computed(() => {
  const arr = dataset.value
  const start = (page.value - 1) * perPage
  return arr.slice(start, start + perPage)
})
const totalPages = computed(() => Math.max(1, Math.ceil(dataset.value.length / perPage)))
</script>

<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold">Dashboard — Anamnese</h1>

    <div v-if="errorMsg" class="p-3 bg-red-100 text-red-700 rounded">{{ errorMsg }}</div>
    <div v-if="loading">Carregando…</div>

    <div v-else class="space-y-6">
      <!-- Abas -->
      <div class="inline-flex rounded-2xl overflow-hidden border">
        <button
          class="px-4 py-2 text-sm"
          :class="tab==='geral' ? 'bg-black text-white' : 'bg-white hover:bg-gray-50'"
          @click="tab='geral'">Geral</button>
        <button
          class="px-4 py-2 text-sm border-l"
          :class="tab==='compradores' ? 'bg-black text-white' : 'bg-white hover:bg-gray-50'"
          @click="tab='compradores'">Compradores Metaflex</button>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-2xl shadow p-4">
          <div class="text-xs text-gray-500">Leads totais</div>
          <div class="text-2xl font-bold">{{ kpis.total }}</div>
        </div>
        <div class="bg-white rounded-2xl shadow p-4">
          <div class="text-xs text-gray-500">Compradores Metaflex</div>
          <div class="text-2xl font-bold">{{ kpis.comp }}</div>
        </div>
        <div class="bg-white rounded-2xl shadow p-4">
          <div class="text-xs text-gray-500">Taxa de conversão</div>
          <div class="text-2xl font-bold">{{ kpis.taxa }}%</div>
        </div>
      </div>

      <!-- Linha de gráficos principais -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="UTM Source (Top 8)" :data="g_utmSource" type="bar" />
        <ChartCard title="UTM Campaign (Top 10)" :data="g_utmCampaign" type="bar" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Origem (Formulário)" :data="g_origem" type="pie" />
        <ChartCard title="Renda Familiar" :data="g_renda" type="bar" />
        <ChartCard title="Tempo que conhece" :data="g_tempo" type="bar" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Exercício Físico" :data="g_exercicio" type="pie" />
        <ChartCard title="Fase da Vida" :data="g_fase" type="bar" />
        <ChartCard title="Leads por dia" :data="g_porDia" type="line" />
      </div>

      <!-- Conversão por UTM (só na aba Geral) -->
      <div v-if="tab==='geral'" class="bg-white rounded-2xl shadow p-4">
        <div class="text-sm font-semibold mb-3">Conversão por UTM</div>
        <div class="overflow-auto">
          <table class="min-w-[800px] w-full text-sm">
            <thead>
              <tr class="bg-gray-50">
                <th class="text-left p-2 border">Dimensão</th>
                <th class="text-right p-2 border">Total</th>
                <th class="text-right p-2 border">Compradores</th>
                <th class="text-right p-2 border">Taxa (%)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r,i) in conv_utm_source" :key="'src'+i">
                <td class="p-2 border">utm_source: {{ r.dim }}</td>
                <td class="p-2 border text-right">{{ r.total }}</td>
                <td class="p-2 border text-right">{{ r.compradores }}</td>
                <td class="p-2 border text-right font-semibold">{{ r.taxa }}</td>
              </tr>
              <tr class="bg-gray-100"><td colspan="4" class="p-2 border font-semibold">utm_campaign</td></tr>
              <tr v-for="(r,i) in conv_utm_campaign" :key="'cmp'+i">
                <td class="p-2 border">utm_campaign: {{ r.dim }}</td>
                <td class="p-2 border text-right">{{ r.total }}</td>
                <td class="p-2 border text-right">{{ r.compradores }}</td>
                <td class="p-2 border text-right font-semibold">{{ r.taxa }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tabela de dados (paginada) -->
      <div class="bg-white rounded-2xl shadow p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="text-sm font-semibold">Dados ({{ tab==='geral' ? 'Geral' : 'Compradores' }})</div>
          <div class="flex items-center gap-2">
            <button class="px-3 py-1 border rounded" :disabled="page<=1" @click="page--">◀</button>
            <div class="text-sm">Página {{ page }} / {{ totalPages }}</div>
            <button class="px-3 py-1 border rounded" :disabled="page>=totalPages" @click="page++">▶</button>
          </div>
        </div>
        <div class="overflow-auto">
          <table class="min-w-[1000px] w-full text-xs">
            <thead>
              <tr class="bg-gray-50">
                <th class="p-2 border text-left">created_at</th>
                <th class="p-2 border text-left">utm_source</th>
                <th class="p-2 border text-left">utm_medium</th>
                <th class="p-2 border text-left">utm_campaign</th>
                <th class="p-2 border text-left">por_onde_conheceu</th>
                <th class="p-2 border text-left">renda_familiar</th>
                <th class="p-2 border text-left">tempo_conhece</th>
                <th class="p-2 border text-left">exercicio_fisico</th>
                <th class="p-2 border text-left">fase_da_vida</th>
                <th class="p-2 border text-left">comprou_metaflex</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in rows" :key="r.id">
                <td class="p-2 border">{{ r.created_at?.slice(0,19).replace('T',' ') || '' }}</td>
                <td class="p-2 border">{{ r.utm_source ?? 'Não informado' }}</td>
                <td class="p-2 border">{{ r.utm_medium ?? 'Não informado' }}</td>
                <td class="p-2 border">{{ r.utm_campaign ?? 'Não informado' }}</td>
                <td class="p-2 border">{{ r.por_onde_conheceu ?? 'Não informado' }}</td>
                <td class="p-2 border">{{ r.renda_familiar ?? 'Não informado' }}</td>
                <td class="p-2 border">{{ r.tempo_conhece ?? 'Não informado' }}</td>
                <td class="p-2 border">{{ r.exercicio_fisico ?? 'Não informado' }}</td>
                <td class="p-2 border">{{ r.fase_da_vida ?? 'Não informado' }}</td>
                <td class="p-2 border">{{ r.comprou_metaflex ? 'Sim' : 'Não' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>
