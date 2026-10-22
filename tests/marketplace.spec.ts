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

test('the marketplace offers both sides of the market', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /I.m a player/i }).click()
  await expect(page.getByRole('heading', { name: /Players open to offers/i })).toBeVisible()
  await expect(page.getByRole('tab', { name: /Players looking for an org/i })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('tab', { name: /Orgs looking for players/i })).toHaveAttribute('aria-selected', 'false')

  await page.getByRole('tab', { name: /Orgs looking for players/i }).click()
  await expect(page.getByRole('heading', { name: /Find your next role/i })).toBeVisible()
  await expect(page.getByText('5 open roles')).toBeVisible()
})

test('applying respects the game age policy on the listing', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Explore roles/ }).click()
  await page.getByPlaceholder('Role, organization, or game').fill('editor')
  await expect(page.getByRole('heading', { name: 'Short-form Video Editor' })).toBeVisible()
  await page.getByRole('button', { name: 'View details' }).click()
  await expect(page.getByText('Paid · $25–35 USD / hour')).toBeVisible()
  await expect(page.getByText(/Posted Oct 20, 2026 · Expires Nov 19, 2026/)).toBeVisible()

  // No age saved yet: the apply action is gated.
  await expect(page.getByRole('button', { name: '16+ required' })).toBeDisabled()
  await page.getByRole('button', { name: 'Open profile' }).click()
  await page.getByRole('spinbutton', { name: 'Age' }).fill('20')
  await page.getByRole('button', { name: 'Save profile' }).click()
  await expect(page.getByRole('status')).toContainText('Profile saved')

  await page.getByRole('button', { name: /Explore roles/ }).click()
  await page.getByRole('button', { name: 'View details' }).click()
  await page.getByRole('button', { name: 'Apply through platform' }).click()
  await expect(page.getByRole('status')).toContainText('Application recorded')

  await page.getByRole('button', { name: 'Report listing' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'Submit report' }).click()
  await expect(page.getByRole('status')).toContainText('Report received')

  await page.getByRole('button', { name: 'Block organization' }).click()
  await expect(page.getByRole('button', { name: 'Unblock organization' })).toBeVisible()
  await page.getByRole('button', { name: 'Unblock organization' }).click()
  await expect(page.getByRole('button', { name: 'Block organization' })).toBeVisible()
})

test('a player can message an organization from a role', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Explore roles/ }).click()
  await page.getByRole('button', { name: 'View details' }).first().click()
  await page.getByRole('button', { name: 'Message organization' }).click()

  await expect(page.getByRole('heading', { name: /Talk it/i })).toBeVisible()
  await expect(page.getByRole('log')).toBeVisible()
  await page.getByRole('textbox', { name: 'Message' }).fill('Could we talk about the trial dates?')
  await page.getByRole('button', { name: /^Send/ }).click()
  await expect(page.getByRole('log')).toContainText('trial dates')
})

test('orgs can find players and message them in the workspace inbox', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /I.m a player/i }).click()

  const mika = page.locator('.player-card').filter({ hasText: 'Mika Sato' })
  const warzone = page.locator('.player-card').filter({ hasText: 'Dante Cruz' })
  // Rocket League allows 13+, so a 14-year-old can be signed; Warzone requires 18+.
  await expect(mika.getByRole('button', { name: 'Message player' })).toBeEnabled()
  await expect(warzone.getByRole('button', { name: 'Message player' })).toBeDisabled()
  await expect(warzone.getByText(/Below the Call of Duty/i)).toBeVisible()

  await mika.getByRole('button', { name: 'Message player' }).click()
  await expect(page.getByRole('heading', { name: /Build your team/i })).toBeVisible()
  await expect(page.locator('.thread-peer')).toContainText('Mika Sato')
  await page.getByRole('textbox', { name: 'Message' }).fill('Can your guardian join a call on Thursday?')
  await page.getByRole('button', { name: /^Send/ }).click()
  await expect(page.getByRole('log')).toContainText('guardian join a call')

  await expect(page.getByRole('button', { name: /Inbox/ })).toBeVisible()
})

test('feedback shows an in-place confirmation after submitting', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open feedback panel' }).click()
  const panel = page.getByRole('dialog', { name: 'Help us improve.' })
  await expect(panel).toBeVisible()
  const idea = panel.getByRole('button', { name: /Feature idea/ })
  await idea.click()
  await expect(idea).toHaveAttribute('aria-pressed', 'true')
  await panel.getByRole('textbox', { name: 'Optional details' }).fill('Add a way to preview creator profiles.')
  await panel.getByRole('button', { name: /Submit feedback/ }).click()
  await expect(panel.getByRole('heading', { name: /Got it/i })).toBeVisible()
  await expect(page.getByRole('status')).toContainText('Feedback received')
})

test('age guidance covers every supported game', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Trust & safety|Trust &amp; safety/ }).first().click()
  await expect(page.getByRole('heading', { name: /Every scene sets/i })).toBeVisible()
  await expect(page.locator('.age-row')).toHaveCount(12)
  await expect(page.locator('.age-row').filter({ hasText: 'Rocket League' })).toContainText('13+')
  await expect(page.locator('.age-row').filter({ hasText: 'Call of Duty' })).toContainText('18+')
})

test('home page uses the redesigned surfaces instead of placeholder ad blocks', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Find your place in the game/i })).toBeVisible()
  await expect(page.locator('.discipline-track')).toBeVisible()
  await expect(page.getByText(/TOP BANNER|LEADERBOARD|SIDEBAR · 300 × 250/)).toHaveCount(0)
  await expect(page.locator('.hero-visual .float-card')).toHaveCount(2)
  await expect(page.locator('.home-role')).toHaveCount(3)
  await expect(page.locator('.path-card')).toHaveCount(2)
  const feature = page.locator('.feature-card').first()
  await expect(feature).toHaveCSS('border-radius', '20px')
  await expect(feature).toHaveCSS('border-top-width', '1px')
  await page.getByRole('button', { name: /Explore roles/ }).click()
  const listing = page.locator('.listing-card').first()
  await expect(listing).toHaveCSS('border-radius', '18px')
})
