import { expect, test } from '@playwright/test'

test('the homepage is the compiled VAYNTR Talent app, not repository documentation', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/VAYNTR Talent/)
  await expect(page.getByRole('heading', { name: /Find your place in the game/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: /^VAYNTR Talent$/i })).toHaveCount(0)
})



test('button arrows rotate right on hover and return when the pointer leaves', async ({ page }) => {
  await page.goto('/')
  const button = page.getByRole('button', { name: /Explore opportunities/ }).first()
  const arrow = button.locator('.button-arrow')

  await expect(arrow).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
  await button.hover()
  await expect(arrow).toHaveCSS('transform', /matrix\(0\.707/)

  await page.mouse.move(0, 0)
  await expect(arrow).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
})


test('quick navigation opens with Ctrl+K and routes to a searched page', async ({ page }) => {
  await page.goto('/')
  const dialog = page.getByRole('dialog', { name: 'Quick navigation' })
  // The shortcut is a client-side listener, so retry the press until the app has hydrated.
  await expect.poll(async () => {
    await page.keyboard.press('Control+k')
    return dialog.isVisible()
  }, { timeout: 15_000 }).toBe(true)

  const search = page.getByRole('combobox', { name: 'Search pages and actions' })
  await search.fill('resources')
  const resourceOption = page.getByRole('option', { name: /Resources/ })
  await expect(resourceOption).toBeVisible()
  await search.press('Enter')

  await expect(dialog).not.toBeVisible()
  await expect(page.getByRole('heading', { name: /A useful VOD review starts with a question/i })).toBeVisible()
})

test('candidate marketplace journey and organization demo surfaces', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Find your place in the game/i })).toBeVisible()

  await page.getByRole('button', { name: 'Explore opportunities' }).first().click()
  await expect(page.getByRole('heading', { name: /Find your next role/i })).toBeVisible()
  await expect(page.getByText('5 sample roles')).toBeVisible()
  await page.getByPlaceholder('Role, organization, or game').fill('editor')
  await expect(page.getByRole('heading', { name: 'Short-form Video Editor' })).toBeVisible()
  await page.getByRole('button', { name: 'View details' }).click()
  await expect(page.getByText('Paid · $25–35 USD / hour')).toBeVisible()
  await expect(page.getByText(/Posted Oct 20, 2026 · Expires Nov 19, 2026/)).toBeVisible()
  await page.getByRole('button', { name: 'Apply through platform' }).click()
  await expect(page.getByRole('status')).toContainText('no organization was contacted')

  await page.getByRole('button', { name: 'Report listing' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'Submit demo report' }).click()
  await expect(page.getByRole('status')).toContainText('No real moderation queue')

  await page.getByRole('button', { name: 'Block organization' }).click()
  await expect(page.getByRole('button', { name: 'Unblock organization' })).toBeVisible()
  await page.getByRole('button', { name: 'Unblock organization' }).click()
  await expect(page.getByRole('button', { name: 'Block organization' })).toBeVisible()

  await page.getByRole('button', { name: /Sign in/ }).click()
  await expect(page.getByRole('heading', { name: /Your path. Your terms./ })).toBeVisible()
  const visibilitySwitch = page.getByRole('switch', { name: 'Allow candidate discovery' })
  await expect(visibilitySwitch).toHaveAttribute('aria-checked', 'false')
  await visibilitySwitch.click()
  await expect(visibilitySwitch).toHaveAttribute('aria-checked', 'true')
  await page.getByRole('button', { name: 'Save demo profile' }).click()
  await expect(page.getByRole('status')).toContainText('page memory only')

  await page.getByRole('button', { name: /Explore roles/ }).click()
  await page.getByRole('button', { name: 'View details' }).click()
  await page.getByRole('button', { name: 'Applied in demo' }).waitFor().catch(async () => {
    await page.getByRole('button', { name: 'Apply through platform' }).click()
  })
  await page.getByRole('button', { name: /Sign in/ }).click()
  await page.getByRole('button', { name: /Explore roles/ }).click()
  await page.getByRole('button', { name: 'Applications' }).click()
  await expect(page.getByText('Short-form Video Editor', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Withdraw' }).last().click()
  await expect(page.getByRole('status')).toContainText('withdrawn locally')

  await page.getByRole('button', { name: 'For organizations' }).click()
  await expect(page.getByText(/Real organization scoping, authentication and audit logs are not configured/)).toBeVisible()
  await expect(page.getByText(/No verification has been performed/)).toBeVisible()
})

test('search, category filter, resources, and moderation disclosure', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Explore roles/ }).click()
  await page.getByLabel('Filter by role category').selectOption('Analyst')
  await expect(page.getByRole('heading', { name: 'Rocket League Analyst' })).toBeVisible()
  await expect(page.getByText('1 sample roles')).toBeVisible()
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Resources' }).click()
  await expect(page.getByRole('heading', { name: /A useful VOD review starts with a question/i })).toBeVisible()
  await expect(page.getByText(/REVIEWED OCTOBER 22, 2026/)).toBeVisible()
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Trust & safety' }).click()
  await page.getByRole('button', { name: /Moderator review dashboard/ }).click()
  await expect(page.getByText(/This non-authenticated mockup/)).toBeVisible()
})


test('feedback micro-interaction captures a local demo response without claiming it was sent', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open feedback panel' }).click()
  const panel = page.getByRole('dialog', { name: 'Help us improve.' })
  await expect(panel).toBeVisible()
  const idea = panel.getByRole('button', { name: /Feature idea/ })
  await idea.click()
  await expect(idea).toHaveAttribute('aria-pressed', 'true')
  await panel.getByRole('textbox', { name: 'Optional details' }).fill('Add a way to preview creator profiles.')
  await panel.getByRole('button', { name: /Submit feedback/ }).click()
  await expect(panel).not.toBeVisible()
  await expect(page.getByRole('status')).toContainText('did not send or save your response')
})


test('home page uses the redesigned surfaces instead of placeholder ad blocks', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Find your place in the game/i })).toBeVisible()
  await expect(page.locator('.discipline-track')).toBeVisible()
  await expect(page.getByText(/TOP BANNER|LEADERBOARD|SIDEBAR · 300 × 250/)).toHaveCount(0)
  await expect(page.locator('.hero-visual .float-card')).toHaveCount(2)
  await expect(page.locator('.home-role')).toHaveCount(3)
  const feature = page.locator('.feature-card').first()
  await expect(feature).toHaveCSS('border-radius', '20px')
  await expect(feature).toHaveCSS('border-top-width', '1px')
  await page.getByRole('button', { name: /Explore roles/ }).click()
  const listing = page.locator('.listing-card').first()
  await expect(listing).toHaveCSS('border-radius', '18px')
})
