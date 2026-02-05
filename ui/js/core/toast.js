export function createToast(element) {
  if (!element) {
    return {
      show: () => {},
    };
  }

  let timerId = null;

  return {
    show(message, type = 'info') {
      element.textContent = message;
      element.dataset.type = type;
      element.classList.add('is-visible');

      if (timerId) clearTimeout(timerId);
      timerId = setTimeout(() => {
        element.classList.remove('is-visible');
      }, 2500);
    },
  };
}
