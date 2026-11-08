import { test, expect } from "@playwright/test";
test("routine, workout resume, history, body weight and profile isolation", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Victor Hugo Araujo Seu planejamento/ }).click();
  async function nav(name: string) {
    const menu = page.getByRole("button", { name: "Abrir navegação" });
    if (await menu.isVisible()) await menu.click();
    await page.getByRole("button", { name, exact: true }).click();
  }
  await nav("Meus treinos");
  await page.getByRole("button", { name: "Criar rotina", exact: true }).click();
  await page.getByLabel("Nome da rotina").fill("Treino A");
  await page.getByLabel("Nome do exercício").fill("Agachamento");
  await page.getByLabel("Séries", { exact: true }).fill("2");
  await page.getByLabel("Carga (kg)", { exact: true }).fill("20");
  await page.getByRole("button", { name: "Salvar rotina" }).click();
  await page
    .getByRole("button", { name: "Iniciar treino", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Finalizar treino" }),
  ).toBeDisabled();
  await page
    .getByRole("checkbox", { name: "Concluir Agachamento, série 1" })
    .check();
  await expect(page.getByRole("timer")).toContainText("Descanso");
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-training.png`,
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await page.reload();
  await nav("Meus treinos");
  await page
    .getByRole("button", { name: "Treino em andamento", exact: true })
    .click();
  await expect(
    page.getByRole("checkbox", { name: "Concluir Agachamento, série 1" }),
  ).toBeChecked();
  await page.getByRole("button", { name: "Finalizar treino" }).click();
  await expect(page.locator("summary")).toContainText("1 séries · 200 kg");
  await page.getByRole("button", { name: "Evolução", exact: true }).click();
  await expect(page.locator(".training-records")).toContainText("20 kg × 10");
  await page.getByLabel("Peso (kg)", { exact: true }).fill("80.5");
  await page.getByRole("button", { name: "Registrar peso" }).click();
  await expect(page.locator(".training-weight")).toContainText("80,5 kg");
  await page.getByRole("button", { name: "Abrir meu perfil" }).click();
  await page
    .getByRole("button", { name: "Sair e trocar de perfil", exact: true })
    .click();
  await page.getByRole("button", { name: /Lívia Sardenberg/ }).click();
  await nav("Meus treinos");
  await expect(
    page.getByText("Seu primeiro treino começa com uma rotina."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Histórico", exact: true }).click();
  await expect(page.locator("summary")).toHaveCount(0);
});
