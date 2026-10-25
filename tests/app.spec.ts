import {test,expect} from '@playwright/test';
test('complete personal planning journey and isolation',async({page},testInfo)=>{
const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('/');await expect(page.getByRole('heading',{name:'Bem-vindo à sua base.'})).toBeVisible();
await page.getByRole('button',{name:/Victor Seu planejamento/}).click();
await expect(page.getByRole('heading',{name:/Victor\./})).toBeVisible();
await page.locator('.featured-meal img').waitFor();await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));await page.waitForTimeout(350);await page.screenshot({path:`test-results/${testInfo.project.name}-dashboard.png`,fullPage:true});
await page.getByRole('button',{name:'250 ml',exact:true}).click();
await page.getByRole('button',{name:'Fazer check-in',exact:true}).click();
await expect(page.getByRole('button',{name:'Check-in feito'})).toBeVisible();
await page.reload();await expect(page.getByRole('button',{name:'Check-in feito'})).toBeVisible();
await page.getByRole('button',{name:'Ver meu plano'}).click();
await page.getByRole('button',{name:'Editar Café da manhã'}).click();
const dialog=page.getByRole('dialog');await dialog.getByLabel('Descrição',{exact:true}).fill('Iogurte com banana e sementes');
await dialog.getByRole('button',{name:'Salvar refeição'}).click();
await expect(page.getByText('Iogurte com banana e sementes',{exact:true})).toBeVisible();
await page.getByRole('button',{name:'Porções e trocas'}).first().click();await expect(page.getByText('Uma opção de troca')).toBeVisible();
await page.getByRole('button',{name:'Atualizar plano',exact:true}).click();await page.getByLabel('Nome do plano').fill('Plano atualizado de teste');await page.getByRole('button',{name:'Salvar versão do plano'}).click();await expect(page.getByRole('heading',{name:'Plano atualizado de teste'})).toBeVisible();
await page.getByRole('button',{name:'Preparar compras'}).click();
await page.getByLabel('Planejar para').selectOption('7');await page.getByRole('button',{name:'Gerar lista',exact:true}).click();await page.getByRole('button',{name:'Gerar nova lista'}).click();
await expect(page.getByText('7 dias planejados',{exact:true})).toBeVisible();
await page.getByRole('checkbox',{name:'Banana',exact:true}).check();
await page.getByRole('button',{name:'Adicionar item',exact:true}).click();await page.getByLabel('Nome do item').fill('Café especial');await page.getByRole('dialog').getByRole('button',{name:'Adicionar item'}).click();await expect(page.getByText('Café especial',{exact:true})).toBeVisible();
const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Exportar lista'}).click();expect((await downloadPromise).suggestedFilename()).toBe('base-lista-de-compras.txt');
await page.screenshot({path:`test-results/${testInfo.project.name}-groceries.png`,fullPage:true});
const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);expect(overflow).toBe(false);
async function nav(label:string){const menu=page.getByRole('button',{name:'Abrir navegação'});if(await menu.isVisible())await menu.click();await page.getByRole('navigation').getByRole('button',{name:label,exact:true}).click();}
await nav('Minha rotina');await page.getByRole('button',{name:'Adicionar à rotina'}).click();await page.getByLabel('Nome',{exact:true}).fill('Meu mix');await page.getByLabel('Porção / orientação').fill('Conforme meu plano');await page.getByRole('button',{name:'Salvar hábito'}).click();await expect(page.getByRole('heading',{name:'Meu mix'})).toBeVisible();
await page.getByRole('button',{name:'Marcar',exact:true}).last().click();await expect(page.getByRole('button',{name:'Feito',exact:true})).toHaveCount(1);
await nav('Minha evolução');await expect(page.getByRole('heading',{name:'Progresso que respeita seu ritmo.'})).toBeVisible();await expect(page.getByText('Conquistado',{exact:true})).toHaveCount(1);
await page.getByRole('button',{name:'Abrir meu perfil'}).click();await page.getByRole('button',{name:'Sair e trocar de perfil'}).click();await page.getByRole('button',{name:/Júlia Uma base/}).click();
await expect(page.getByRole('button',{name:'Fazer check-in',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Check-in feito'})).toHaveCount(0);
await page.getByRole('button',{name:'Ver meu plano'}).click();await expect(page.getByText('Iogurte natural, banana, aveia e chia',{exact:true})).toBeVisible();
expect(errors).toEqual([]);
});


test('meal structure can be replaced and mobile menu supports keyboard', async ({page}, testInfo) => {
  await page.goto('/');
  await page.getByRole('button', {name:/Victor Seu planejamento/}).click();
  if(testInfo.project.name === 'mobile') {
    await page.getByRole('button', {name:'Abrir navegação'}).click();
    await expect(page.getByRole('button', {name:'Fechar navegação'})).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', {name:'Abrir navegação'})).toBeFocused();
    await expect(page.getByRole('navigation')).not.toBeVisible();
  }
  await page.getByRole('button', {name:'Ver meu plano'}).click();
  await page.getByRole('button', {name:'Adicionar refeição'}).click();
  await page.getByLabel('Refeição', {exact:true}).fill('Ceia de teste');
  await page.getByLabel('Descrição', {exact:true}).fill('Iogurte natural');
  await page.getByRole('button', {name:'Salvar refeição'}).click();
  await expect(page.getByRole('heading', {name:'Ceia de teste'})).toBeVisible();
  await page.getByRole('button', {name:'Editar Ceia de teste'}).click();
  await page.getByRole('button', {name:'Remover refeição'}).click();
  await expect(page.getByRole('heading', {name:'Ceia de teste'})).toHaveCount(0);
});
