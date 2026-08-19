const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';

const WEATHER_LABELS = new Map([
  [0, 'Céu limpo'],
  [1, 'Predomínio de sol'],
  [2, 'Parcialmente nublado'],
  [3, 'Nublado'],
  [45, 'Neblina'], [48, 'Neblina'],
  [51, 'Garoa fraca'], [53, 'Garoa'], [55, 'Garoa forte'],
  [56, 'Garoa congelante'], [57, 'Garoa congelante forte'],
  [61, 'Chuva fraca'], [63, 'Chuva'], [65, 'Chuva forte'],
  [66, 'Chuva congelante'], [67, 'Chuva congelante forte'],
  [71, 'Neve fraca'], [73, 'Neve'], [75, 'Neve forte'], [77, 'Grãos de neve'],
  [80, 'Pancadas de chuva'], [81, 'Pancadas de chuva'], [82, 'Pancadas fortes'],
  [85, 'Pancadas de neve'], [86, 'Pancadas fortes de neve'],
  [95, 'Trovoadas'], [96, 'Trovoadas com granizo'], [99, 'Trovoadas fortes com granizo']
]);

function cleaned(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

function normalizedCountryCode(value) {
  const country = cleaned(value).toLowerCase();
  if (!country) return '';
  if (['br', 'bra', 'brasil', 'brazil'].includes(country)) return 'BR';
  return /^[a-z]{2}$/i.test(country) ? country.toUpperCase() : '';
}

export function parseWeatherLocation(value = '', fallbackState = '') {
  let text = cleaned(value);
  let state = cleaned(fallbackState).toUpperCase();
  if (!text) return { city: '', state };

  // Remove um país digitado no próprio campo de cidade para evitar múltiplos qualificadores.
  text = text.replace(/\s*,\s*(brasil|brazil|br)\s*$/i, '').trim();

  // Formatos aceitos: "São Paulo, SP", "São Paulo/SP", "São Paulo - SP" e "São Paulo-SP".
  const comma = text.match(/^(.+?)\s*,\s*([A-Za-z]{2})$/);
  const slash = text.match(/^(.+?)\s*\/\s*([A-Za-z]{2})$/);
  const dash = text.match(/^(.+?)\s*-\s*([A-Za-z]{2})$/);
  const compactDash = text.match(/^(.+?)-([A-Za-z]{2})$/);
  const match = comma || slash || dash || compactDash;

  if (match) {
    text = cleaned(match[1]);
    state = cleaned(match[2]).toUpperCase();
  }

  return { city: text, state };
}

export function weatherDescription(code) {
  return WEATHER_LABELS.get(Number(code)) || 'Condição atual';
}

export function formatWeatherValue(temperature, weatherCode) {
  const numeric = Number(temperature);
  if (!Number.isFinite(numeric)) throw new Error('A API não retornou uma temperatura válida.');
  return `${Math.round(numeric)}°C · ${weatherDescription(weatherCode)}`;
}

export function weatherLocationParts(match = {}, homeClub = {}) {
  const rawMatchCity = cleaned(match.city);
  const sourceCity = rawMatchCity || cleaned(homeClub.city);
  const sourceState = rawMatchCity ? cleaned(match.state) : cleaned(homeClub.state);
  const sourceCountry = cleaned(match.country) || cleaned(homeClub.country) || 'Brasil';
  const parsed = parseWeatherLocation(sourceCity, sourceState);

  if (!parsed.city) throw new Error('Informe a cidade da partida ou cadastre a cidade do clube mandante.');

  return {
    city: parsed.city,
    state: parsed.state,
    country: sourceCountry,
    countryCode: normalizedCountryCode(sourceCountry)
  };
}

export function weatherLocationQuery(match = {}, homeClub = {}) {
  const { city, state, country } = weatherLocationParts(match, homeClub);
  const qualifier = state || country;
  return [city, qualifier].filter(Boolean).join(', ');
}

async function fetchJson(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    if (!response.ok) throw new Error(`Serviço respondeu HTTP ${response.status}.`);
    return await response.json();
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('A consulta de clima demorou demais. Tente novamente.');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function lookupCurrentWeather({ match = {}, homeClub = {} } = {}) {
  const parts = weatherLocationParts(match, homeClub);
  const query = [parts.city, parts.state || parts.country].filter(Boolean).join(', ');
  const geoUrl = new URL(GEOCODING_ENDPOINT);
  geoUrl.searchParams.set('name', query);
  geoUrl.searchParams.set('count', '5');
  geoUrl.searchParams.set('language', 'pt');
  geoUrl.searchParams.set('format', 'json');
  if (parts.countryCode) geoUrl.searchParams.set('countryCode', parts.countryCode);

  let geo = await fetchJson(geoUrl);
  let place = Array.isArray(geo?.results) ? geo.results[0] : null;

  // Segundo passe: caso um cadastro antigo tenha um qualificador não reconhecido,
  // tenta apenas o nome limpo da cidade, mantendo o filtro de país.
  if (!place) {
    geoUrl.searchParams.set('name', parts.city);
    geo = await fetchJson(geoUrl);
    place = Array.isArray(geo?.results) ? geo.results[0] : null;
  }

  if (!place || !Number.isFinite(Number(place.latitude)) || !Number.isFinite(Number(place.longitude))) {
    throw new Error(`Não encontrei a localização “${query}”. Confira a cidade da partida.`);
  }

  const weatherUrl = new URL(WEATHER_ENDPOINT);
  weatherUrl.searchParams.set('latitude', String(place.latitude));
  weatherUrl.searchParams.set('longitude', String(place.longitude));
  weatherUrl.searchParams.set('current', 'temperature_2m,weather_code');
  weatherUrl.searchParams.set('temperature_unit', 'celsius');
  weatherUrl.searchParams.set('timezone', 'auto');

  const weather = await fetchJson(weatherUrl);
  const current = weather?.current || {};
  const value = formatWeatherValue(current.temperature_2m, current.weather_code);
  const locationLabel = [place.name, place.admin1, place.country].filter(Boolean).join(' · ');
  return {
    value,
    temperature: Number(current.temperature_2m),
    weatherCode: Number(current.weather_code),
    latitude: Number(place.latitude),
    longitude: Number(place.longitude),
    locationLabel,
    source: 'Open-Meteo'
  };
}
