import { test, expect, type Page, type Route } from "@playwright/test"

// ─── Fixtures ────────────────────────────────────────────────────────────────

const MOCK_TOKEN = "test-token-e2e"

const MOCK_USER = {
  id: "user-1",
  email: "admin@sniffnfrolic.com",
  status: "active",
}

const MOCK_CATEGORIES = [
  { id: "cat-1", name: "Toys", slug: "toys" },
  { id: "cat-2", name: "Treats", slug: "treats" },
]

const MOCK_PRODUCTS = [
  {
    id: "prod-1",
    name: "Squeaky Ball",
    slug: "squeaky-ball",
    sku: "SKU-001",
    product_type: "simple",
    status: "published",
    regular_price: 1500,
    sale_price: null,
    effective_price: 1500,
    stock_quantity: 10,
    stock_status: "instock",
    featured_image_url: null,
    category_name: "Toys",
    category_id: "cat-1",
  },
  {
    id: "prod-2",
    name: "Beef Jerky Treats",
    slug: "beef-jerky-treats",
    sku: "SKU-002",
    product_type: "simple",
    status: "draft",
    regular_price: 800,
    sale_price: 600,
    effective_price: 600,
    stock_quantity: 2,
    stock_status: "instock",
    featured_image_url: null,
    category_name: "Treats",
    category_id: "cat-2",
  },
]

const MOCK_PRODUCT_DETAIL = {
  ...MOCK_PRODUCTS[0],
  short_description: "A fun squeaky ball",
  description: "Dogs love this ball.",
  meta_title: "",
  meta_description: "",
  images: [],
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function mockAuth(page: Page) {
  // Set token in localStorage before page scripts run
  await page.addInitScript((token) => {
    localStorage.setItem("snf_pos_access_token", token)
  }, MOCK_TOKEN)

  // Mock the session-restore call (uses absolute URL, not proxied)
  await page.route("http://localhost:4000/auth/me", (route: Route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ user: MOCK_USER }),
    })
  )
}

async function mockCategories(page: Page) {
  await page.route("**/api/categories", (route: Route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_CATEGORIES),
    })
  )
}

async function mockProductsList(page: Page) {
  await page.route("**/api/products/manage**", (route: Route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_PRODUCTS),
    })
  )
}

// ─── Tests ───────────────────────────────────────────────────────────────────

test.describe("Products — listing", () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page)
    await mockProductsList(page)
    await mockCategories(page)
  })

  test("renders product table with rows", async ({ page }) => {
    await page.goto("/pos/manage/products")

    await expect(page.getByText("Squeaky Ball")).toBeVisible()
    await expect(page.getByText("Beef Jerky Treats")).toBeVisible()
  })

  test("search filters request query param", async ({ page }) => {
    let capturedUrl = ""
    await page.route("**/api/products/manage**", (route: Route) => {
      capturedUrl = route.request().url()
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([MOCK_PRODUCTS[0]]),
      })
    })

    await page.goto("/pos/manage/products")
    await page.getByPlaceholder("Search by name or SKU…").fill("Squeaky")
    await page.waitForTimeout(400) // debounce is 300 ms

    expect(capturedUrl).toContain("search=Squeaky")
  })

  test("New Product button navigates to create form", async ({ page }) => {
    await page.goto("/pos/manage/products")
    await page.getByRole("button", { name: "New Product" }).click()

    await expect(page).toHaveURL(/\/pos\/manage\/products\/create$/)
    await expect(page.getByText("New Product")).toBeVisible()
  })
})

test.describe("Products — create", () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page)
    await mockCategories(page)
  })

  test("submits POST /api/products with correct payload", async ({ page }) => {
    let capturedBody: Record<string, unknown> = {}

    await page.route("**/api/products", async (route: Route) => {
      if (route.request().method() === "POST") {
        capturedBody = JSON.parse(route.request().postData() ?? "{}") as Record<string, unknown>
        return route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ id: "new-prod-1", slug: "tennis-ball" }),
        })
      }
      return route.continue()
    })

    // The redirect after create hits the edit page — mock it
    await page.route("**/api/products/tennis-ball", (route: Route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ...MOCK_PRODUCT_DETAIL, id: "new-prod-1", name: "Tennis Ball", slug: "tennis-ball" }),
      })
    )

    await page.goto("/pos/manage/products/create")

    await page.getByLabel("Name").fill("Tennis Ball")
    await page.getByLabel("Regular Price (CAD)").fill("12.99")
    await page.getByRole("button", { name: "Save" }).click()

    await expect(page).toHaveURL(/\/pos\/manage\/products\/tennis-ball$/)

    expect(capturedBody.name).toBe("Tennis Ball")
    expect(capturedBody.regular_price).toBe(1299)
  })

  test("auto-generates slug from name", async ({ page }) => {
    await page.goto("/pos/manage/products/create")

    await page.getByLabel("Name").fill("My New Dog Toy")

    const slugField = page.getByLabel("Slug")
    await expect(slugField).toHaveValue("my-new-dog-toy")
  })
})

test.describe("Products — edit", () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page)
    await mockCategories(page)

    await page.route("**/api/products/squeaky-ball", (route: Route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_PRODUCT_DETAIL),
      })
    )
  })

  test("loads product data into form", async ({ page }) => {
    await page.goto("/pos/manage/products/squeaky-ball")

    await expect(page.getByLabel("Name")).toHaveValue("Squeaky Ball")
    await expect(page.getByLabel("Regular Price (CAD)")).toHaveValue("15")
  })

  test("submits PUT /api/products/:id on save", async ({ page }) => {
    let capturedBody: Record<string, unknown> = {}

    await page.route("**/api/products/prod-1", async (route: Route) => {
      if (route.request().method() === "PUT") {
        capturedBody = JSON.parse(route.request().postData() ?? "{}") as Record<string, unknown>
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ...MOCK_PRODUCT_DETAIL, name: "Squeaky Ball XL" }),
        })
      }
      return route.continue()
    })

    await page.route("**/api/products/prod-1/images", (route: Route) =>
      route.fulfill({ status: 200, body: "[]" })
    )

    await page.goto("/pos/manage/products/squeaky-ball")

    await page.getByLabel("Name").fill("Squeaky Ball XL")
    await page.getByRole("button", { name: "Save" }).click()

    await expect(page.getByText("Saved ✓")).toBeVisible()
    expect(capturedBody.name).toBe("Squeaky Ball XL")
  })

  test("category picker shows categories and sets category_ids", async ({ page }) => {
    let capturedBody: Record<string, unknown> = {}

    await page.route("**/api/products/prod-1", async (route: Route) => {
      if (route.request().method() === "PUT") {
        capturedBody = JSON.parse(route.request().postData() ?? "{}") as Record<string, unknown>
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_PRODUCT_DETAIL),
        })
      }
      return route.continue()
    })

    await page.route("**/api/products/prod-1/images", (route: Route) =>
      route.fulfill({ status: 200, body: "[]" })
    )

    await page.goto("/pos/manage/products/squeaky-ball")

    // Autocomplete: type into the input to filter, then pick the option
    await page.getByPlaceholder("Add category…").click()
    await page.getByRole("option", { name: "Treats" }).click()
    await page.getByRole("button", { name: "Save" }).click()

    await expect(page.getByText("Saved ✓")).toBeVisible()
    expect(capturedBody.category_ids).toContain("cat-2")
  })
})

test.describe("Products — delete", () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page)
    await mockCategories(page)

    await page.route("**/api/products/squeaky-ball", (route: Route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_PRODUCT_DETAIL),
      })
    )
  })

  test("shows confirmation dialog before deleting", async ({ page }) => {
    await page.goto("/pos/manage/products/squeaky-ball")

    await page.getByRole("button", { name: "Delete" }).click()

    await expect(page.getByRole("dialog")).toBeVisible()
    await expect(page.getByText("will be permanently deleted")).toBeVisible()
  })

  test("cancel dismisses dialog without archiving", async ({ page }) => {
    let putCalled = false
    await page.route("**/api/products/prod-1", async (route: Route) => {
      if (route.request().method() === "PUT") {
        putCalled = true
      }
      return route.continue()
    })

    await page.goto("/pos/manage/products/squeaky-ball")
    await page.getByRole("button", { name: "Delete" }).click()
    await page.getByRole("button", { name: "Cancel" }).click()

    await expect(page.getByRole("dialog")).not.toBeVisible()
    expect(putCalled).toBe(false)
  })

  test("confirm archives product (PUT status=archived) and redirects to list", async ({ page }) => {
    let capturedBody: Record<string, unknown> = {}

    await page.route("**/api/products/prod-1", async (route: Route) => {
      if (route.request().method() === "PUT") {
        capturedBody = JSON.parse(route.request().postData() ?? "{}") as Record<string, unknown>
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ...MOCK_PRODUCT_DETAIL, status: "archived" }) })
      }
      return route.continue()
    })

    await page.route("**/api/products/manage**", (route: Route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([MOCK_PRODUCTS[1]]),
      })
    )

    await page.goto("/pos/manage/products/squeaky-ball")
    await page.getByRole("button", { name: "Delete" }).click()
    await page.getByRole("button", { name: "Delete" }).last().click() // confirm button in dialog

    await expect(page).toHaveURL(/\/pos\/manage\/products$/)
    expect(capturedBody.status).toBe("archived")
  })
})