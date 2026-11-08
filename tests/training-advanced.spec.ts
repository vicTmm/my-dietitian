import { test, expect } from "@playwright/test";
test("catalog, timed workout, history corrections and charts", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Victor Hugo Araujo/ }).click();
  const menu = page.getByRole("button", { name: "Abrir navegação" });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("button", { name: "Meus treinos", exact: true }).click();
  await page.getByRole("button", { name: "Exercícios", exact: true }).click();
  await page.getByLabel("Buscar", { exact: true }).fill("3/4 Sit-Up");
  await page.getByRole("button", { name: /3\/4 Sit-Up/ }).click();
  await page.getByRole("button", { name: "Usar este exercício" }).click();
  await page.getByLabel("Nome da rotina").fill("Mobilidade");
  await page.getByRole("combobox", { name: "Tipo", exact: true }).selectOption("timed");
  await page.getByLabel("Séries", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Salvar rotina" }).click();
  await page
    .getByRole("button", { name: "Iniciar treino", exact: true })
    .click();
  await expect(page.getByRole("checkbox", { name: /Concluir/ })).toBeDisabled();
  await page.getByLabel("Duração (s)", { exact: true }).fill("60");
  await page.getByRole("checkbox", { name: /Concluir/ }).check();
  await page.getByRole("button", { name: "Finalizar treino" }).click();
  await page.locator(".training-history summary").click();
  await page
    .getByRole("button", { name: "Editar treino", exact: true })
    .click();
  await page
    .locator(".history-editor")
    .getByLabel("Duração (s)", { exact: true })
    .fill("90");
  await page.getByRole("button", { name: "Salvar correções" }).click();
  await page.getByRole("button", { name: "Evolução", exact: true }).click();
  await expect(
    page.getByText("Distribuição muscular", { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-training-analytics.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Dados e sincronização" }).click();
  await expect(page.getByRole("button", { name: "Backup JSON" })).toBeVisible();
});
