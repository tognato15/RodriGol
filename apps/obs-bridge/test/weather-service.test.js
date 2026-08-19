import test from 'node:test';
import assert from 'node:assert/strict';
import { formatWeatherValue, parseWeatherLocation, weatherDescription, weatherLocationParts, weatherLocationQuery } from '../public/weather-service.js';

test('formata temperatura e condição para o overlay', () => {
  assert.equal(formatWeatherValue(21.4, 2), '21°C · Parcialmente nublado');
  assert.equal(formatWeatherValue(28.7, 0), '29°C · Céu limpo');
});

test('traduz códigos meteorológicos principais', () => {
  assert.equal(weatherDescription(63), 'Chuva');
  assert.equal(weatherDescription(95), 'Trovoadas');
});

test('prioriza cidade da partida e usa clube como fallback', () => {
  assert.equal(weatherLocationQuery({ city: 'Brasília' }, { city: 'São Paulo', state: 'SP', country: 'Brasil' }), 'Brasília, Brasil');
  assert.equal(weatherLocationQuery({}, { city: 'São Paulo', state: 'SP', country: 'Brasil' }), 'São Paulo, SP');
});

test('normaliza formatos cidade-UF usados nos cadastros', () => {
  assert.deepEqual(parseWeatherLocation('São Paulo-SP'), { city: 'São Paulo', state: 'SP' });
  assert.deepEqual(parseWeatherLocation('São Paulo / SP'), { city: 'São Paulo', state: 'SP' });
  assert.deepEqual(parseWeatherLocation('São Paulo, SP'), { city: 'São Paulo', state: 'SP' });
  assert.deepEqual(parseWeatherLocation('São Paulo - SP'), { city: 'São Paulo', state: 'SP' });
});

test('remove país embutido e preserva filtro Brasil', () => {
  assert.deepEqual(
    weatherLocationParts({ city: 'São Paulo-SP, Brasil' }, {}),
    { city: 'São Paulo', state: 'SP', country: 'Brasil', countryCode: 'BR' }
  );
  assert.equal(weatherLocationQuery({ city: 'São Paulo-SP, Brasil' }, {}), 'São Paulo, SP');
});
