export function groupCount(rows, key, opts = {}) {
  const label = opts.label || key
  const map = new Map()
  for (const r of rows) {
    const v = (r?.[key] ?? 'Não informado') || 'Não informado'
    map.set(v, (map.get(v) || 0) + 1)
  }
  const entries = [...map.entries()].sort((a,b)=>b[1]-a[1])
  return {
    labels: entries.map(([k]) => String(k)),
    datasets: [{ label, data: entries.map(([,v])=>v) }]
  }
}

export function topN(chartData, n = 10) {
  const { labels, datasets } = chartData
  const arr = labels.map((l, i) => ({ l, v: datasets[0].data[i] }))
  arr.sort((a,b)=>b.v-a.v)
  const top = arr.slice(0, n)
  return {
    labels: top.map(x => x.l),
    datasets: [{ ...datasets[0], data: top.map(x => x.v) }]
  }
}

export function byDateCount(rows, dateKey = 'created_at') {
  const map = new Map()
  for (const r of rows) {
    const d = r?.[dateKey] ? new Date(r[dateKey]) : null
    if (!d) continue
    const day = d.toISOString().slice(0,10) // YYYY-MM-DD
    map.set(day, (map.get(day) || 0) + 1)
  }
  const entries = [...map.entries()].sort((a,b)=>a[0].localeCompare(b[0]))
  return {
    labels: entries.map(([k])=>k),
    datasets: [{ label: 'Leads por dia', data: entries.map(([,v])=>v) }]
  }
}

export function conversionByKey(allRows, buyersRows, key) {
  // gera tabela de conversão por dimensão (ex.: utm_source)
  const all = new Map()
  const buy = new Map()
  for (const r of allRows) {
    const v = (r?.[key] ?? 'Não informado') || 'Não informado'
    all.set(v, (all.get(v) || 0) + 1)
  }
  for (const r of buyersRows) {
    const v = (r?.[key] ?? 'Não informado') || 'Não informado'
    buy.set(v, (buy.get(v) || 0) + 1)
  }
  const keys = [...new Set([...all.keys(), ...buy.keys()])]
  const lines = keys.map(k => {
    const total = all.get(k) || 0
    const conv = buy.get(k) || 0
    return { dim: k, total, compradores: conv, taxa: total ? +(conv/total*100).toFixed(2) : 0 }
  }).sort((a,b)=>b.taxa - a.taxa || b.compradores - a.compradores)
  return lines
}
