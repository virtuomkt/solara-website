const dialog = document.querySelector('#plan-dialog');
if (dialog && typeof dialog.showModal === 'function') {
  const title = dialog.querySelector('#plan-dialog-title');
  const image = dialog.querySelector('.lightbox-image');
  const original = dialog.querySelector('.lightbox-original');
  let trigger;
  document.querySelectorAll('[data-plan]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      trigger = link;
      title.textContent = link.dataset.plan;
      image.src = link.href;
      image.alt = link.querySelector('img').alt;
      original.href = link.href;
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    });
  });
  dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = '';
    trigger?.focus();
  });
}
