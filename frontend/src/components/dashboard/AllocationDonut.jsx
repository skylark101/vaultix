import { useState } from 'react'
import { Link } from 'react-router-dom'
import { fmtCurrency } from '../../lib/format'
import { ALLOCATION_COLORS } from '../../lib/allocationColors'
import { cn } from '../../lib/cn'

const CX = 50
const CY = 50
const R_OUTER = 42
const R_INNER = 28

function polarToCartesian(angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: CX + R_OUTER * Math.cos(rad),
    y: CY + R_OUTER * Math.sin(rad),
  }
}

function innerPolar(angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: CX + R_INNER * Math.cos(rad),
    y: CY + R_INNER * Math.sin(rad),
  }
}

function arcPath(startAngle, endAngle) {
  if (endAngle - startAngle >= 359.99) endAngle = startAngle + 359.99
  const outerStart = polarToCartesian(startAngle)
  const outerEnd = polarToCartesian(endAngle)
  const innerEnd = innerPolar(endAngle)
  const innerStart = innerPolar(startAngle)
  const large = endAngle - startAngle > 180 ? 1 : 0
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${R_OUTER} ${R_OUTER} 0 ${large} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${R_INNER} ${R_INNER} 0 ${large} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ')
}

export function AllocationDonut({ segments, totalInvested }) {
  const [active, setActive] = useState(null)

  if (!segments.length) return null

  const arcs = segments.reduce(
    (acc, seg, i) => {
      const start = acc.cursor
      const sweep = (seg.pct / 100) * 360
      const end = start + sweep
      acc.items.push({
        ...seg,
        path: arcPath(start, end),
        color: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length],
        index: i,
      })
      acc.cursor = end
      return acc
    },
    { cursor: 0, items: [] }
  ).items

  return (
    <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
      <div className="relative w-full max-w-[220px] mx-auto sm:mx-0 shrink-0">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-auto"
          role="img"
          aria-label="Portfolio allocation by asset type"
        >
          {arcs.map((arc) => (
            <path
              key={arc.type}
              d={arc.path}
              fill={arc.color}
              className={cn(
                'transition-opacity duration-150 cursor-pointer focus:outline-none',
                active !== null && active !== arc.index && 'opacity-40'
              )}
              tabIndex={0}
              onMouseEnter={() => setActive(arc.index)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(arc.index)}
              onBlur={() => setActive(null)}
              onClick={() => setActive(arc.index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setActive(arc.index)
              }}
            />
          ))}
        </svg>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4"
          aria-hidden
        >
          <span className="text-[10px] uppercase tracking-wider text-vault-subtle">
            Total invested
          </span>
          <span className="text-sm sm:text-base font-mono font-semibold tabular-nums text-vault-text leading-tight">
            {fmtCurrency(totalInvested)}
          </span>
        </div>
      </div>

      {/* Accessible data table + legend */}
      <div className="flex-1 w-full min-w-0">
        <table className="w-full text-sm hidden sm:table">
          <caption className="sr-only">Allocation by type</caption>
          <thead>
            <tr className="text-left text-xs text-vault-subtle uppercase tracking-wider">
              <th className="pb-2 font-medium">Type</th>
              <th className="pb-2 font-medium text-right">Amount</th>
              <th className="pb-2 font-medium text-right w-16">Share</th>
            </tr>
          </thead>
          <tbody>
            {arcs.map((arc) => (
              <tr
                key={arc.type}
                className={cn(
                  'border-t border-vault-border first:border-0',
                  active === arc.index && 'bg-vault-muted/20'
                )}
                onMouseEnter={() => setActive(arc.index)}
                onMouseLeave={() => setActive(null)}
              >
                <td className="py-2 pr-2">
                  <Link
                    to={`/app/assets?type=${encodeURIComponent(arc.type)}`}
                    className="inline-flex items-center gap-2 min-h-[44px] sm:min-h-0 text-vault-text hover:text-vault-link focus-ring rounded"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: arc.color }}
                      aria-hidden
                    />
                    <span className="truncate">{arc.type}</span>
                  </Link>
                </td>
                <td className="py-2 text-right font-mono tabular-nums text-vault-secondary whitespace-nowrap">
                  {fmtCurrency(arc.amount)}
                </td>
                <td className="py-2 text-right font-mono tabular-nums text-vault-subtle whitespace-nowrap">
                  {arc.pct.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile list (non-table fallback visible) */}
        <ul className="sm:hidden space-y-2">
          {arcs.map((arc) => (
            <li key={arc.type}>
              <Link
                to={`/app/assets?type=${encodeURIComponent(arc.type)}`}
                className="flex items-center justify-between gap-2 py-2 min-h-[44px] focus-ring rounded"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: arc.color }}
                  />
                  <span className="text-sm text-vault-text truncate">
                    {arc.type}
                  </span>
                </span>
                <span className="text-xs font-mono tabular-nums text-vault-subtle shrink-0">
                  {arc.pct.toFixed(1)}%
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}