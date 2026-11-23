/** Matches backend/asset list total logic for recurring assets. */
export function calculateTotal(asset) {
  if (!asset?.isRecurring || !asset.recurringAmount || !asset.startDate) {
    return asset?.amountInvested ?? 0
  }

  function toLocalDate(input) {
    const d = input instanceof Date ? input : new Date(input)
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
  }

  const start = toLocalDate(asset.startDate)
  const now = toLocalDate(new Date())

  if (now < start) return asset.amountInvested

  let cycles = 0

  switch (asset.recurringType) {
    case 'daily': {
      cycles = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1
      break
    }
    case 'monthly': {
      let months =
        (now.getFullYear() - start.getFullYear()) * 12 +
        (now.getMonth() - start.getMonth())
      if (now.getDate() < start.getDate()) months -= 1
      cycles = Math.max(0, months) + 1
      break
    }
    case 'quarterly': {
      let months =
        (now.getFullYear() - start.getFullYear()) * 12 +
        (now.getMonth() - start.getMonth())
      if (now.getDate() < start.getDate()) months -= 1
      cycles = Math.floor(Math.max(0, months) / 3) + 1
      break
    }
    case 'semiannual': {
      let months =
        (now.getFullYear() - start.getFullYear()) * 12 +
        (now.getMonth() - start.getMonth())
      if (now.getDate() < start.getDate()) months -= 1
      cycles = Math.floor(Math.max(0, months) / 6) + 1
      break
    }
    case 'yearly': {
      let years = now.getFullYear() - start.getFullYear()
      if (
        now.getMonth() < start.getMonth() ||
        (now.getMonth() === start.getMonth() && now.getDate() < start.getDate())
      )
        years -= 1
      cycles = Math.max(0, years) + 1
      break
    }
    case 'custom': {
      if (asset.recurringInterval) {
        const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24))
        cycles = Math.floor(diffDays / asset.recurringInterval) + 1
      }
      break
    }
    default:
      break
  }

  return asset.amountInvested + cycles * asset.recurringAmount
}