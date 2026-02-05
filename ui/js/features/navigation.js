export function initNavigation({ store }) {
  const tabList = document.querySelector('[data-nav-list]');
  const tabs = Array.from(document.querySelectorAll('[data-nav-target]'));
  const panels = Array.from(document.querySelectorAll('[data-view]'));

  if (!tabList || tabs.length === 0 || panels.length === 0) {
    return () => {};
  }

  const activateTab = (viewId) => {
    store.setActiveView(viewId);
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab.dataset.navTarget));
    tab.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (index + direction + tabs.length) % tabs.length;
      tabs[nextIndex].focus();
      activateTab(tabs[nextIndex].dataset.navTarget);
    });
  });

  return store.subscribe((state) => {
    const hasView = tabs.some((tab) => tab.dataset.navTarget === state.ui.activeView);
    const activeView = hasView ? state.ui.activeView : tabs[0].dataset.navTarget;

    if (!hasView) {
      store.setActiveView(activeView);
      return;
    }

    tabs.forEach((tab) => {
      const isActive = tab.dataset.navTarget === activeView;
      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
      tab.classList.toggle('is-active', isActive);
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.view === activeView;
      panel.hidden = !isActive;
    });
  });
}
