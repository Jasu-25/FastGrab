// FastGrab's monthly progressive commission (see the business plan).
// Each rate applies only to the sales inside its band; the counter resets monthly.

export const SLABS = [
  { from: 0, to: 50000, rate: 0 },
  { from: 50000, to: 100000, rate: 0.01 },
  { from: 100000, to: 200000, rate: 0.015 },
  { from: 200000, to: Infinity, rate: 0.02 },
]

/** Commission for a month's completed FastGrab sales, band by band. */
export function calcCommission(sales) {
  const bands = SLABS.map((slab) => {
    const inBand = Math.max(0, Math.min(sales, slab.to) - slab.from)
    return { ...slab, inBand, amount: Math.round(inBand * slab.rate) }
  })
  const total = bands.reduce((n, b) => n + b.amount, 0)
  const currentIndex = SLABS.findIndex((s) => sales < s.to)
  return {
    sales,
    total,
    effectiveRate: sales ? total / sales : 0,
    bands,
    currentIndex,
    currentRate: SLABS[currentIndex].rate,
    toNextBand: Number.isFinite(SLABS[currentIndex].to) ? SLABS[currentIndex].to - sales : null,
  }
}

export const formatRate = (r) => `${(r * 100).toFixed(r * 100 % 1 ? 1 : 0)}%`
