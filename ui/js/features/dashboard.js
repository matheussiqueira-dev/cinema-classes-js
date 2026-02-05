import { formatMoney, formatPercent } from '../core/format.js';
import { clamp } from '../core/helpers.js';

function sumSales(sales = []) {
  return sales.reduce((acc, sale) => acc + Number(sale.total || 0), 0);
}

function sumSeats(sales = []) {
  return sales.reduce((acc, sale) => acc + Number(sale.seats || 0), 0);
}

function countCriticalStock(items = []) {
  return items.filter((item) => Number(item.qty || 0) <= Number(item.min || 0)).length;
}

export function initDashboard({ store }) {
  const elOccupancy = document.getElementById('kpi-occupancy');
  const elRevenue = document.getElementById('kpi-revenue');
  const elStockCritical = document.getElementById('kpi-stock-critical');
  const elRevenueGoal = document.getElementById('kpi-goal-progress');
  const elGoalBar = document.getElementById('goal-progress-bar');
  const elGoalHint = document.getElementById('goal-progress-hint');
  const elLastSync = document.getElementById('kpi-last-sync');

  return store.subscribe((state) => {
    const capacity = Number(state.session.config?.capacity || 0);
    const soldSeats = sumSeats(state.session.sales);
    const occupancy = capacity > 0 ? (soldSeats / capacity) * 100 : 0;
    const revenue = sumSales(state.session.sales);
    const criticalStock = countCriticalStock(state.stock.items);

    const goal = Number(state.session.revenueGoal || 0);
    const goalProgress = goal > 0 ? clamp((revenue / goal) * 100, 0, 100) : 0;

    if (elOccupancy) elOccupancy.textContent = formatPercent(occupancy, 1, { clampRange: true });
    if (elRevenue) elRevenue.textContent = formatMoney(revenue);
    if (elStockCritical) elStockCritical.textContent = String(criticalStock);
    if (elRevenueGoal) {
      elRevenueGoal.textContent = goal > 0 ? formatPercent(goalProgress, 1, { clampRange: true }) : '--';
    }
    if (elGoalBar) elGoalBar.style.width = `${goalProgress}%`;

    if (elGoalHint) {
      elGoalHint.textContent =
        goal > 0
          ? `${formatMoney(revenue)} de ${formatMoney(goal)}`
          : 'Defina uma meta para acompanhar progresso';
    }

    if (elLastSync) {
      const lastSync = state.clock.lastSync;
      const sourceLabel = lastSync.source === 'us' ? 'Americano' : 'Brasileiro';
      elLastSync.textContent =
        lastSync.updatedAt && lastSync.br && lastSync.us
          ? `Ultima sync: ${sourceLabel} (${lastSync.br} / ${lastSync.us})`
          : 'Ultima sync: sem dados';
    }
  });
}
