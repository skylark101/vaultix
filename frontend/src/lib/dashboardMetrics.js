import { calculateTotal } from './calculateTotal'

const MS_PER_DAY = 1000 * 60 * 60 * 24
const DAYS_PER_YEAR = 365.25

export function parseAssetStartDate(startDate) {
  if (!startDate) return null
  const d = new Date(startDate)
  if (Number.isNaN(d.getTime())) return null
  const normalized = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  return normalized
}

export function tenureDaysFromStart(startDate, asOf = new Date()) {
  const start = parseAssetStartDate(startDate)
  if (!start) return null
  const today = new Date(asOf.getFullYear(), asOf.getMonth(), asOf.getDate())
  if (start > today) return null
  return Math.round((today - start) / MS_PER_DAY)
}

export function formatTenureDays(days) {
  if (days == null || days < 0) return '—'
  if (days < 60) return `${days} days`
  const years = days / DAYS_PER_YEAR
  if (years < 1) {
    const months = Math.round(days / 30.44)
    return months <= 1 ? 'About 1 month' : `About ${months} months`
  }
  if (years < 10) {
    const y = Math.floor(years)
    const remMonths = Math.round((years - y) * 12)
    if (remMonths < 1) return y === 1 ? '1 year' : `${y} years`
    return `${y}y ${remMonths}m`
  }
  return `${years.toFixed(1)} years`
}

export function allocationSegments(byType, totalInvested) {
  if (!byType || totalInvested <= 0) return []
  return Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .map(([type, amount]) => ({
      type,
      amount,
      pct: (amount / totalInvested) * 100,
    }))
}

export function portfolioInsights(assets, byType, totalInvested) {
  const segments = allocationSegments(byType, totalInvested)
  const categoryCount = segments.length
  const top = segments[0]
  let highestAsset = null
  let highestValue = 0
  const valued = []
  for (const a of assets) {
    const v = calculateTotal(a)
    valued.push({ asset: a, value: v })
    if (v > highestValue) {
      highestValue = v
      highestAsset = a
    }
  }
  valued.sort((a, b) => b.value - a.value)
  const top3Sum = valued.slice(0, 3).reduce((s, row) => s + row.value, 0)
  const top3HoldingsPct =
    totalInvested > 0 ? (top3Sum / totalInvested) * 100 : 0

  const recurringAssets = assets.filter(
    (a) => a.isRecurring && a.recurringAmount > 0
  )
  const monthlyOnlySum = recurringAssets
    .filter((a) => a.recurringType === 'monthly')
    .reduce((s, a) => s + a.recurringAmount, 0)

  return {
    categoryCount,
    topCategory: top?.type ?? '—',
    topCategoryPct: top?.pct ?? 0,
    topCategoryAmount: top?.amount ?? 0,
    highestAsset,
    highestValue,
    top3HoldingsPct,
    recurringCount: recurringAssets.length,
    monthlyRecurringSum: monthlyOnlySum,
    hasMonthlyRecurring: monthlyOnlySum > 0,
  }
}

const TENURE_BUCKETS = [
  { key: 'under1', label: 'Under 1 year', maxDays: DAYS_PER_YEAR },
  { key: 'oneToThree', label: '1–3 years', minDays: DAYS_PER_YEAR, maxDays: DAYS_PER_YEAR * 3 },
  { key: 'over3', label: 'Over 3 years', minDays: DAYS_PER_YEAR * 3 },
]

export function investmentTenure(assets) {
  const withTenure = []
  let missingStartDate = 0

  for (const a of assets) {
    const days = tenureDaysFromStart(a.startDate)
    if (days == null) {
      missingStartDate += 1
      continue
    }
    withTenure.push({ asset: a, days, start: parseAssetStartDate(a.startDate) })
  }

  const bucketCounts = {
    under1: 0,
    oneToThree: 0,
    over3: 0,
  }

  for (const row of withTenure) {
    if (row.days < DAYS_PER_YEAR) bucketCounts.under1 += 1
    else if (row.days < DAYS_PER_YEAR * 3) bucketCounts.oneToThree += 1
    else bucketCounts.over3 += 1
  }

  const totalWithDates = withTenure.length
  const buckets = TENURE_BUCKETS.map((b) => {
    const count = bucketCounts[b.key]
    return {
      ...b,
      count,
      pct: totalWithDates > 0 ? (count / totalWithDates) * 100 : 0,
    }
  })

  let averageDays = null
  if (withTenure.length > 0) {
    const sum = withTenure.reduce((s, r) => s + r.days, 0)
    averageDays = Math.round(sum / withTenure.length)
  }

  let oldest = null
  if (withTenure.length > 0) {
    oldest = withTenure.reduce((acc, r) =>
      r.days > acc.days ? r : acc
    )
  }

  return {
    buckets,
    totalWithDates,
    missingStartDate,
    averageDays,
    averageLabel: formatTenureDays(averageDays),
    oldestAsset: oldest?.asset ?? null,
    oldestStartDate: oldest?.start ?? null,
    oldestDays: oldest?.days ?? null,
  }
}

/** Interest rates are optional annual % (0–100) on individual assets — not portfolio returns. */
export function interestRateOverview(assets) {
  const withRate = []
  let withoutRate = 0

  for (const a of assets) {
    if (a.interestRate != null && !Number.isNaN(Number(a.interestRate))) {
      withRate.push({
        id: a.id,
        name: a.name,
        type: a.type,
        rate: Number(a.interestRate),
      })
    } else {
      withoutRate += 1
    }
  }

  withRate.sort((a, b) => b.rate - a.rate)

  let highest = withRate[0] ?? null

  const byTypeMap = new Map()
  for (const row of withRate) {
    if (!byTypeMap.has(row.type)) {
      byTypeMap.set(row.type, [])
    }
    byTypeMap.get(row.type).push(row)
  }

  const byType = [...byTypeMap.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([type, items]) => ({
      type,
      count: items.length,
      items: items.sort((a, b) => b.rate - a.rate),
    }))

  return {
    recordedCount: withRate.length,
    withoutRateCount: withoutRate,
    highest,
    byType,
    hasRates: withRate.length > 0,
  }
}