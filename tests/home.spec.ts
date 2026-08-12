import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('debe cargar la página principal con el título correcto', async ({ page }) => {
    // Ir a la página raíz
    await page.goto('/');

    // Verificar que el título principal contenga "Reuniendo familias"
    await expect(page.locator('h1')).toContainText('Reuniendo familias');

    // Verificar que el botón de "Publicar un Reporte" esté presente y enlace a /publicar
    const publishButton = page.getByRole('link', { name: /publicar un reporte/i });
    await expect(publishButton).toBeVisible();
    await expect(publishButton).toHaveAttribute('href', '/publicar');
  });

  test('debe tener accesos rápidos a las categorías de búsqueda', async ({ page }) => {
    await page.goto('/');

    // Verificar la navegación a las categorías (Mascotas Perdidas y Encontradas)
    const perdidasLink = page.locator('a[href="/pet/searching"]');
    await expect(perdidasLink).toBeVisible();

    const personasEncontradasLink = page.locator('a[href="/human/found"]');
    await expect(personasEncontradasLink).toBeVisible();
  });
});
