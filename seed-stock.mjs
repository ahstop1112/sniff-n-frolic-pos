// One-off script: set every product to +5 stock via restock movements.
// Usage: AUTH_TOKEN=<token> node seed-stock.mjs
//
// Delete this file after running.

const TOKEN = process.env.AUTH_TOKEN
const API = "http://localhost:4000"
const QUANTITY = 5

if (!TOKEN) {
  console.error("Missing AUTH_TOKEN. Run: AUTH_TOKEN=<paste token> node seed-stock.mjs")
  process.exit(1)
}

async function fetchAllProducts() {
  const products = []
  let page = 1
  while (true) {
    const res = await fetch(`${API}/products?limit=100&page=${page}`)
    if (!res.ok) throw new Error(`Products fetch failed: ${res.status}`)
    const batch = await res.json()
    if (!Array.isArray(batch) || batch.length === 0) break
    products.push(...batch)
    if (batch.length < 100) break
    page++
  }
  return products
}

async function restock(productId, name) {
  const res = await fetch(`${API}/inventory/movements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      product_id: productId,
      quantity_change: QUANTITY,
      reason: "restock",
      note: "Initial stock seed",
    }),
  })
  if (!res.ok) {
    const msg = await res.text().catch(() => res.status)
    console.error(`  ✗ ${name}: ${msg}`)
    return
  }
  const { stock_quantity } = await res.json()
  console.log(`  ✓ ${name}: now ${stock_quantity} on hand`)
}

const products = await fetchAllProducts()
console.log(`Seeding ${products.length} products to +${QUANTITY} each…\n`)
for (const p of products) {
  await restock(p.id, p.name)
}
console.log("\nDone.")
