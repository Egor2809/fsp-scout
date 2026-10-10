import { expect, test, type Page, type TestInfo } from '@playwright/test'
// Public demo fixtures, intentionally independent of the browser application bundle.
const employerName = 'Ирина Волкова'
const candidateName = 'Алексей Смирнов'
const candidateId = 'c56a4180-65aa-42ec-a945-5fd21dec0538'
const dbKey = 'scout.mockdb'
const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url')
const token = `${encode({ alg: 'none', typ: 'JWT' })}.${encode({ sub: '7c9e6679-7425-40de-944b-e07fc1f90ae7', realm_access: { roles: ['candidate'] } })}.dev`

async function login(page: Page, name: string, path: string) {
  await page.goto('/')
  await page.getByRole('button', { name: new RegExp(name) }).click()
  await expect(page).toHaveURL(new RegExp(`${path}$`))
}

async function candidateApi(page: Page, path: string, body?: unknown) {
  return page.evaluate(async ({ path, token, body }) => {
    const response = await fetch(`/api/v1${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    return { status: response.status, data: await response.json() }
  }, { path, token, body })
}

async function solvedCount(page: Page) {
  const result = await candidateApi(page, '/me/card-preview')
  expect(result.status).toBe(200)
  return (result.data as { task_signal: { solved_count: number } }).task_signal.solved_count
}

async function capture(page: Page, info: TestInfo, name: string) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  expect(overflow, `${name}: horizontal overflow`).toBe(false)
  const path = info.outputPath(`${name}.png`)
  await page.screenshot({ path, fullPage: true })
  await info.attach(name, { path, contentType: 'image/png' })
}

test('create → submit → review → re-review updates the candidate profile once', async ({ page: companyPage, context }, info) => {
  await login(companyPage, employerName, '/e')
  await companyPage.goto('/e/tasks')
  await expect(companyPage.locator('a[href^="/e/tasks/"]').first()).toBeVisible()

  // Fixture setup only: move Alex's previous assignments outside the 14-day cooldown.
  // Assignment of the new task, submission and reviews use the application itself.
  await companyPage.evaluate(({ key, candidateId }) => {
    const db: { assignments: { candidateId: string; assignedAt: string }[] } = JSON.parse(localStorage.getItem(key)!)
    for (const a of db.assignments) {
      if (a.candidateId === candidateId) a.assignedAt = new Date(Date.now() - 31 * 86400000).toISOString()
    }
    localStorage.setItem(key, JSON.stringify(db))
  }, { key: dbKey, candidateId })

  const candidatePage = await context.newPage()
  await login(candidatePage, candidateName, '/c')
  const baseline = await solvedCount(candidatePage)

  await companyPage.getByRole('button', { name: 'Создать задание', exact: true }).click()
  const title = 'Проверка повторной обработки платежа'
  await companyPage.getByLabel('Название', { exact: true }).fill(title)
  await companyPage.getByLabel('Условие задания').fill('Опишите, как исключить повторное списание при одновременной обработке одинаковых событий платежа.')
  await companyPage.getByLabel('Срок сдачи (ваше местное время)').fill(new Date(Date.now() + 86400000).toISOString().slice(0, 16))
  await capture(companyPage, info, 'task-create')
  await companyPage.getByRole('button', { name: 'Опубликовать задание' }).click()
  await expect(companyPage.getByRole('heading', { name: title, exact: true })).toBeVisible()
  const taskId = new URL(companyPage.url()).pathname.split('/').at(-1)!

  await candidatePage.goto('/c/tasks')
  await candidatePage.getByRole('link').filter({ hasText: title }).click()
  await candidatePage.getByRole('textbox', { name: 'Решение', exact: true }).fill('Использую уникальный ключ события и транзакцию с INSERT ON CONFLICT. Списание и фиксация ключа выполняются атомарно.')
  await capture(candidatePage, info, 'task-solution')
  await candidatePage.getByRole('button', { name: 'Отправить решение' }).click()
  await expect(candidatePage.getByText('Решение отправлено. Ожидается оценка работодателя.')).toBeVisible()
  expect((await candidateApi(candidatePage, `/tasks/${taskId}/submissions`, { answer_text: 'Duplicate' })).status).toBe(409)

  await companyPage.reload()
  const review = companyPage.getByRole('article')
  await expect(review).toHaveCount(1)
  const setScore = async (value: number) => {
    await review.getByLabel('Итоговая оценка').fill(String(value))
    await review.getByRole('button', { name: /Сохранить оценку|Исправить оценку/ }).click()
    await expect(review.getByText(`Оценка работодателя: ${value} / 100`, { exact: true })).toBeVisible()
    await expect(review.getByRole('button', { name: 'Исправить оценку' })).toBeEnabled()
  }
  await setScore(75)
  expect(await solvedCount(candidatePage)).toBe(baseline + 1)
  await setScore(75)
  expect(await solvedCount(candidatePage)).toBe(baseline + 1)
  await setScore(74)
  expect(await solvedCount(candidatePage)).toBe(baseline)
  await capture(companyPage, info, 'task-review')
  await candidatePage.reload()
  await expect(candidatePage.getByText('Оценка работодателя: 74 / 100', { exact: true })).toBeVisible()
  await expect(candidatePage.getByText('Для зачёта задания нужно не менее 75 баллов.')).toBeVisible()
})
