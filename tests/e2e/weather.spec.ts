import { expect, test } from '@playwright/test';

const forecastResponse = {
  timezone: 'America/Sao_Paulo',
  current: {
    time: '2026-10-29T14:00',
    temperature_2m: 0,
    weather_code: 0,
    relative_humidity_2m: 60,
    wind_speed_10m: 8,
    precipitation: 0,
    pressure_msl: 1014,
  },
  daily: {
    time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
    weather_code: [0, 1, 2, 3, 61],
    temperature_2m_min: [-2, 0, 1, 2, 3],
    temperature_2m_max: [10, 11, 12, 13, 14],
    precipitation_probability_max: [0, 10, 20, 30, 80],
  },
};

async function mockOpenMeteo(page: import('@playwright/test').Page, geocodingResponse: unknown) {
  let forecastRequests = 0;

  await page.route('**/geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(geocodingResponse),
    });
  });

  await page.route('**/api.open-meteo.com/v1/forecast**', async (route) => {
    forecastRequests += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(forecastResponse),
    });
  });

  return () => forecastRequests;
}

const geocodingResponse = {
  results: [
    {
      id: 123,
      name: 'Campinas',
      latitude: -22.9,
      longitude: -47.06,
      admin1: 'São Paulo',
      country: 'Brasil',
      timezone: 'America/Sao_Paulo',
    },
  ],
};

test('busca uma cidade, mostra a previsão e converte a temperatura para Fahrenheit', async ({
  page,
}) => {
  await mockOpenMeteo(page, geocodingResponse);

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Campinas');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Campinas' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();

  await page.getByRole('button', { name: 'Fahrenheit' }).click();
  await expect(page.getByRole('region', { name: 'Campinas' }).getByText('32 °F')).toBeVisible();
});

test('mostra estado vazio quando geocoding não retorna results', async ({ page }) => {
  const getForecastRequestCount = await mockOpenMeteo(page, {});

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Cidade sem resultado');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByText('Nenhuma cidade encontrada')).toBeVisible();
  expect(getForecastRequestCount()).toBe(0);
});

test('completa a busca e mostra o clima no viewport mobile 375x812', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await mockOpenMeteo(page, geocodingResponse);

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Campinas');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Campinas' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();
  await expect(page.getByText('32 °F')).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Campinas' }).getByText('0 °C')).toBeVisible();
});
