import { test, expect } from '@playwright/test';

test('Lívia prescription, portions, unknown macros and persistence', async ({page}, testInfo) => {
  await page.goto('/');
  await page.getByRole('button', {name: /Lívia Sardenberg/}).click();
  await expect(page.getByText('Calorias e macros ainda não disponíveis', {exact: true})).toBeVisible();
  await page.getByRole('button', {name: 'Ver meu plano', exact: true}).click();
  await expect(page.locator('.plan-meal')).toHaveCount(4);
  await expect(page.getByRole('heading', {name: 'Lívia · rotina prática e variada'})).toBeVisible();
  await page.getByLabel('Dia do cardápio').selectOption('0');
  await page.getByRole('button', {name: 'Porções e trocas'}).first().click();
  await expect(page.getByText('Preparo e alternativas', {exact:true})).toBeVisible();
  await expect(page.getByText('170 ml de leite zero lactose', {exact:true})).toBeVisible();
  await page.screenshot({path: `test-results/${testInfo.project.name}-livia-plan.png`, fullPage: true});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', {name: 'Editar Café da manhã'}).click();
  await expect(page.getByLabel('Valores nutricionais não informados')).toBeChecked();
  await page.getByLabel('Descrição', {exact:true}).fill('Café pronto de segunda');
  await page.getByRole('button', {name: 'Salvar refeição'}).click();
  await expect(page.getByText('Café pronto de segunda', {exact:true})).toBeVisible();
  await page.getByLabel('Dia do cardápio').selectOption('1');
  await expect(page.getByText('Café pronto de segunda', {exact:true})).toHaveCount(0);
  await expect(page.getByText('Carne moída com purê de batata e legumes', {exact:true})).toBeVisible();
  await page.reload();
  await page.getByRole('button', {name: 'Ver meu plano', exact: true}).click();
  await expect(page.locator('.plan-meal')).toHaveCount(4);
});
