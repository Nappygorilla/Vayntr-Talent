import { expect, test } from '@playwright/test'

// Every organization, player, conversation and address the app used to invent.
// None of them may appear in the shipped markup or in any rendered page.
const fabricated = /Northstar|PixelForge|Arcadia|Mika Sato|Dante Cruz|Nadia Ferreira|Owen Blake|Ivy Chen|Rafael Moreno|vayntr\.example|sample role|\bdemo\b/i

const destinations = ['Marketplace', 'Players', 'Organizations', 'Messages', 'Resources', 'Trust & safety', 'For organizations', 'My profile', 'Applications']

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

test('both sides of the market exist and start empty instead of showing invented records', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /I.m a player/i }).click()
  await expect(page.getByRole('heading', { name: /Players open to offers/i })).toBeVisible()
  await expect(page.getByRole('tab', { name: /Players looking for an org/i })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('tab', { name: /Orgs looking for players/i })).toHaveAttribute('aria-selected', 'false')
  await expect(page.getByRole('heading', { name: 'No players are listed yet' })).toBeVisible()
  await expect(page.locator('.player-card')).toHaveCount(0)

  await page.getByRole('tab', { name: /Orgs looking for players/i }).click()
  await expect(page.getByRole('heading', { name: /Find your next role/i })).toBeVisible()
  await expect(page.getByText('0 open roles')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'No roles are open right now' })).toBeVisible()
  await expect(page.locator('.listing-card')).toHaveCount(0)
})

test('no page or shipped markup contains invented accounts, roles or conversations', async ({ page }) => {
  const html = await (await page.request.get('/')).text()
  expect(html).not.toMatch(fabricated)
  expect(html).not.toContain('mailto:')

  await page.goto('/')
  for (const destination of destinations) {
    await page.locator('footer').getByRole('button', { name: destination, exact: true }).click()
    await expect(page.locator('.page-wrap, .hero').first()).toBeVisible()
    expect(await page.locator('body').innerText()).not.toMatch(fabricated)
    await expect(page.locator('.player-card, .listing-card, .thread-item, .org-directory-card')).toHaveCount(0)
  }
})

test('the organization workspace asks for a real account instead of using a made-up organization', async ({ page }) => {
  await page.goto('/')
  await page.locator('footer').getByRole('button', { name: 'For organizations', exact: true }).click()
  await expect(page.getByRole('heading', { name: /Build your team/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'No organization account yet' })).toBeVisible()
  await expect(page.locator('.dashboard-stats')).toHaveCount(0)
  await expect(page.getByText(/Northstar/i)).toHaveCount(0)
})

test('the organization directory and player inbox have empty states', async ({ page }) => {
  await page.goto('/')
  await page.locator('footer').getByRole('button', { name: 'Organizations', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'No organizations listed yet' })).toBeVisible()

  await page.getByRole('button', { name: /Inbox/ }).click()
  await expect(page.getByRole('heading', { name: 'No conversations yet' })).toBeVisible()
})

test('age guidance covers every supported game', async ({ page }) => {
  await page.goto('/')
  await page.locator('footer').getByRole('button', { name: 'Trust & safety', exact: true }).click()
  await expect(page.getByRole('heading', { name: /Every scene sets/i })).toBeVisible()
  await expect(page.locator('.age-row')).toHaveCount(12)
  await expect(page.locator('.age-row').filter({ hasText: 'Rocket League' })).toContainText('13+')
  await expect(page.locator('.age-row').filter({ hasText: 'Call of Duty' })).toContainText('18+')
})

test('the moderation queue is empty instead of listing invented cases', async ({ page }) => {
  await page.goto('/')
  await page.locator('footer').getByRole('button', { name: 'Trust & safety', exact: true }).click()
  await page.getByRole('button', { name: /Moderator review dashboard/ }).click()
  await expect(page.getByRole('heading', { name: 'No reports in the queue' })).toBeVisible()
  await expect(page.locator('.mod-case')).toHaveCount(0)
})

test('the profile saves the age locally and says so', async ({ page }) => {
  await page.goto('/')
  await page.locator('footer').getByRole('button', { name: 'My profile', exact: true }).click()
  await page.getByRole('spinbutton', { name: 'Age' }).fill('17')
  await page.getByRole('button', { name: 'Save profile' }).click()
  await expect(page.getByRole('status')).toContainText('Profile saved on this device')
  await expect(page.getByRole('button', { name: 'Delete account' })).toHaveCount(0)
})

test('reporting a listing does not claim to reach moderators', async ({ page }) => {
  await page.goto('/')
  await page.locator('footer').getByRole('button', { name: 'Trust & safety', exact: true }).click()
  await page.getByRole('button', { name: 'Report a listing or account' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('Reports are saved on this device')
  await dialog.getByRole('button', { name: 'Submit report' }).click()
  await expect(page.getByRole('status')).toContainText('Report saved on this device')
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
  await expect(page.getByRole('status')).toContainText('Feedback saved on this device')
})

test('home page uses the redesigned surfaces and only previews real roles', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Find your place in the game/i })).toBeVisible()
  await expect(page.locator('.discipline-track')).toBeVisible()
  await expect(page.getByText(/TOP BANNER|LEADERBOARD|SIDEBAR · 300 × 250/)).toHaveCount(0)
  await expect(page.locator('.hero-visual .float-card')).toHaveCount(2)
  await expect(page.locator('.path-card')).toHaveCount(2)
  // No roles are loaded, so the homepage role preview is not rendered at all.
  await expect(page.locator('.home-role')).toHaveCount(0)
  const feature = page.locator('.feature-card').first()
  await expect(feature).toHaveCSS('border-radius', '20px')
  await expect(feature).toHaveCSS('border-top-width', '1px')

  await page.getByRole('button', { name: /Explore roles/ }).click()
  await expect(page.locator('.empty-state')).toBeVisible()
  await expect(page.locator('.empty-state')).toHaveCSS('border-radius', '20px')
})

test('anyone 13 or older can create a free player account with guardian consent', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Join free' }).click()
  await expect(page.getByRole('heading', { name: /Create a free account/i })).toBeVisible()

  // No account type chosen yet: the flow does not advance.
  await page.getByRole('button', { name: /^Continue/ }).click()
  await expect(page.locator('.field-error')).toContainText('Choose player, content creator, or esports organization')

  await page.locator('.role-choices').getByRole('button', { name: /^Player/ }).click()
  await page.getByRole('button', { name: /^Continue/ }).click()
  await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()

  await page.getByPlaceholder('e.g. the name you compete under').fill('Test Player')
  await page.getByPlaceholder('you@example.com').fill('player@example.com')
  await page.getByPlaceholder('At least 8 characters').fill('a-long-password')
  await page.locator('label.form-field').filter({ hasText: /^State/ }).locator('select').selectOption('California')
  await page.locator('input[type="number"]').fill('14')
  await page.getByRole('button', { name: /^Continue/ }).click()
  // A minor cannot get past this step without a guardian email.
  await expect(page.locator('.field-error')).toContainText('parent or guardian email')

  await page.getByPlaceholder('guardian@example.com').fill('guardian@example.com')
  await page.getByRole('button', { name: /^Continue/ }).click()
  await expect(page.getByRole('heading', { name: 'Your game' })).toBeVisible()
  await page.locator('label.form-field').filter({ hasText: 'Primary game' }).locator('select').selectOption('Rocket League')
  await page.getByRole('button', { name: /^Continue/ }).click()

  // Consent cannot be skipped, and marketing is opt-in.
  await expect(page.getByRole('heading', { name: 'Privacy & consent' })).toBeVisible()
  await page.locator('.signup-actions').getByRole('button', { name: /Create free account/ }).click()
  await expect(page.locator('.field-error')).toContainText('privacy notice and safety rules')
  const marketing = page.locator('.consent-list label').filter({ hasText: 'product updates' }).locator('input')
  await expect(marketing).not.toBeChecked()
  await page.locator('.consent-list label').filter({ hasText: 'privacy notice and the safety rules' }).locator('input').check()
  await page.locator('.consent-list label').filter({ hasText: 'parent or guardian has read' }).locator('input').check()

  await page.locator('.signup-actions').getByRole('button', { name: /Create free account/ }).click()
  await expect(page.getByRole('heading', { name: /Welcome,/ })).toBeVisible()
  await expect(page.getByText('Guardian confirmation pending')).toBeVisible()
  await expect(page.locator('.account-chip')).toContainText('Test Player')

  await page.getByRole('button', { name: /Open my profile/ }).click()
  await expect(page.getByRole('spinbutton', { name: 'Age' })).toHaveValue('14')
})

test('children under 13 cannot create an account', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Join free' }).click()
  await page.locator('.role-choices').getByRole('button', { name: /^Content creator/ }).click()
  await page.getByRole('button', { name: /^Continue/ }).click()
  await page.getByPlaceholder('e.g. the name you compete under').fill('Too Young')
  await page.getByPlaceholder('you@example.com').fill('kid@example.com')
  await page.getByPlaceholder('At least 8 characters').fill('a-long-password')
  await page.locator('label.form-field').filter({ hasText: /^State/ }).locator('select').selectOption('Texas')
  await page.locator('input[type="number"]').fill('12')
  await page.getByRole('button', { name: /^Continue/ }).click()
  await expect(page.locator('.field-error')).toContainText('cannot create accounts for children under 13')
  await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()
})

test('an organization signs up free and gets its own workspace', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Join free' }).click()
  await page.locator('.role-choices').getByRole('button', { name: /^Esports organization/ }).click()
  await page.getByRole('button', { name: /^Continue/ }).click()
  await page.getByPlaceholder('e.g. your team or studio name').fill('Harbor Nine')
  await page.getByPlaceholder('you@example.com').fill('team@example.com')
  await page.getByPlaceholder('At least 8 characters').fill('a-long-password')
  await page.locator('label.form-field').filter({ hasText: /^State/ }).locator('select').selectOption('New York')
  await page.locator('input[type="number"]').fill('30')
  await page.getByRole('button', { name: /^Continue/ }).click()
  await expect(page.getByRole('heading', { name: 'Your organization' })).toBeVisible()
  await page.locator('label.form-field').filter({ hasText: 'Organization type' }).locator('select').selectOption('Esports team')
  await page.getByRole('button', { name: /^Continue/ }).click()
  await page.locator('.consent-list label').filter({ hasText: 'privacy notice and the safety rules' }).locator('input').check()
  await page.locator('.signup-actions').getByRole('button', { name: /Create free account/ }).click()
  await expect(page.getByText('Active on this device')).toBeVisible()

  await page.getByRole('button', { name: /Open the organization workspace/ }).click()
  await expect(page.getByRole('heading', { name: 'Build your team.' })).toBeVisible()
  await expect(page.locator('.dashboard-head')).toContainText('Harbor Nine')
  await expect(page.getByRole('heading', { name: 'No listings or applications yet' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'No organization account yet' })).toHaveCount(0)
})

test('the privacy notice lists US rights and the no-sale position', async ({ page }) => {
  await page.goto('/')
  await page.locator('footer').getByRole('button', { name: 'Privacy', exact: true }).click()
  await expect(page.getByRole('heading', { name: /Your data/ })).toBeVisible()
  await expect(page.getByText('Draft notice.')).toBeVisible()
  await expect(page.getByText(/CCPA\/CPRA/)).toBeVisible()
  await expect(page.getByRole('heading', { name: 'No sale, no ad tracking' })).toBeVisible()
  await expect(page.getByText(/COPPA/).first()).toBeVisible()
  await expect(page.locator('.rights-list li')).toHaveCount(8)
})
