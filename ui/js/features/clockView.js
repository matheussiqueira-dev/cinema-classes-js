import { formatClockTime, getTimePartsFromString, pad2 } from '../core/format.js';

const WORLD_CITIES = [
  { label: 'Sao Paulo', timeZone: 'America/Sao_Paulo' },
  { label: 'New York', timeZone: 'America/New_York' },
  { label: 'Lisboa', timeZone: 'Europe/Lisbon' },
  { label: 'Toquio', timeZone: 'Asia/Tokyo' },
];

function toUS({ hour, minute, second }) {
  const period = hour >= 12 ? 'PM' : 'AM';
  let hour12 = hour;
  if (hour12 === 0) hour12 = 12;
  if (hour12 > 12) hour12 -= 12;
  return `${pad2(hour12)}:${pad2(minute)}:${pad2(second)} ${period}`;
}

function toBR({ hour, minute, second, period }) {
  let hour24 = hour;
  if (period === 'AM' && hour24 === 12) hour24 = 0;
  if (period === 'PM' && hour24 < 12) hour24 += 12;
  return formatClockTime({ hour: hour24, minute, second });
}

function renderWorldClock() {
  const worldList = document.getElementById('clock-world-list');
  if (!worldList) return;

  worldList.innerHTML = '';
  const fragment = document.createDocumentFragment();
  const now = new Date();

  WORLD_CITIES.forEach((city) => {
    const item = document.createElement('li');
    const timeText = new Intl.DateTimeFormat('pt-BR', {
      timeZone: city.timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(now);
    item.textContent = `${city.label}: ${timeText}`;
    fragment.appendChild(item);
  });

  worldList.appendChild(fragment);
}

function renderNowClock() {
  const nowElement = document.getElementById('clock-now');
  if (!nowElement) return;

  const now = new Date();
  nowElement.textContent = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
}

function renderLastSync(lastSync) {
  const br = document.getElementById('clock-br');
  const us = document.getElementById('clock-us');
  if (br) br.textContent = lastSync.br;
  if (us) us.textContent = lastSync.us;
}

export function initClockView({ store, toast }) {
  const form = document.getElementById('clock-form');
  const originInput = document.getElementById('clock-origin');
  const periodInput = document.getElementById('clock-period');
  const periodGroup = document.getElementById('clock-period-group');

  if (!form || !originInput || !periodInput) return () => {};

  const togglePeriodVisibility = () => {
    const isUS = originInput.value === 'us';
    if (periodGroup) periodGroup.hidden = !isUS;
  };

  originInput.addEventListener('change', togglePeriodVisibility);
  togglePeriodVisibility();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const origin = form.elements.origin.value;
    const rawTime = form.elements.time.value;
    const parts = getTimePartsFromString(rawTime);

    if (!parts) {
      toast.show('Horario invalido. Use HH:MM:SS.', 'error');
      return;
    }

    if (origin === 'br') {
      const brValue = formatClockTime(parts);
      const usValue = toUS(parts);
      store.setLastClockSync({
        br: brValue,
        us: usValue,
        source: 'br',
      });
      toast.show('Relogios sincronizados a partir do formato BR.', 'success');
      return;
    }

    if (parts.hour < 1 || parts.hour > 12) {
      toast.show('No formato americano a hora deve estar entre 01 e 12.', 'error');
      return;
    }

    const period = form.elements.period.value;
    const brValue = toBR({ ...parts, period });
    const usValue = `${pad2(parts.hour)}:${pad2(parts.minute)}:${pad2(parts.second)} ${period}`;

    store.setLastClockSync({
      br: brValue,
      us: usValue,
      source: 'us',
    });
    toast.show('Relogios sincronizados a partir do formato US.', 'success');
  });

  const interval = setInterval(() => {
    renderNowClock();
    renderWorldClock();
  }, 1000);

  renderNowClock();
  renderWorldClock();

  const unsubscribe = store.subscribe((state) => {
    renderLastSync(state.clock.lastSync);
  });

  return () => {
    clearInterval(interval);
    unsubscribe();
  };
}
