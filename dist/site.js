const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const activeMotion = new Set();

// Motion is an enhancement: content stays visible without JS or animation support.
function playMotion(element, keyframes, options) {
  if (motionPreference.matches || typeof element.animate !== 'function') return null;
  const animation = element.animate(keyframes, options);
  activeMotion.add(animation);
  animation.finished.then(() => activeMotion.delete(animation), () => activeMotion.delete(animation));
  return animation;
}
motionPreference.addEventListener('change', () => {
  if (motionPreference.matches) activeMotion.forEach(animation => animation.finish());
});

if ('IntersectionObserver' in window && !motionPreference.matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      playMotion(entry.target, [
        { opacity: 0.35, transform: 'translateY(14px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 540, easing: 'cubic-bezier(.2,.7,.2,1)' });
    });
  }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
  document.querySelectorAll('.intro > div, main > .shell > figure, .section-heading, .home-layout > figure, .home-details, .plans, .amenities-head, .amenity, .security > img, .security-copy, .location-grid > figure, .places, .faq, .closing, .footer-contact').forEach(element => {
    // Leave the initial viewport (especially the hero) untouched.
    if (element.getBoundingClientRect().top >= window.innerHeight) observer.observe(element);
  });
}

// Close the current answer before opening the next: native details semantics,
// one open answer, keyboard activation, and a first-answer fallback are preserved.
const faqItems = [...document.querySelectorAll('.faq-item')];
let currentFaq = faqItems.find(item => item.open) || faqItems[0];
let desiredFaq = currentFaq;
let switchingFaq = false;

async function animateFaq(item, open) {
  const summary = item.querySelector('summary');
  const style = getComputedStyle(item);
  const border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
  const closedHeight = summary.getBoundingClientRect().height + border;
  const startHeight = open ? closedHeight : item.getBoundingClientRect().height;
  if (open) item.open = true;
  const endHeight = open ? item.getBoundingClientRect().height : closedHeight;
  const animation = playMotion(item, [
    { height: `${startHeight}px` }, { height: `${endHeight}px` }
  ], { duration: open ? 230 : 170, easing: 'cubic-bezier(.25,.65,.3,1)', fill: 'forwards' });
  if (animation) {
    item.style.overflow = 'hidden';
    try { await animation.finished; } catch { /* Complete the requested state if interrupted. */ }
  }
  item.open = open;
  if (animation) animation.cancel();
  item.style.overflow = '';
}

async function updateFaq() {
  if (switchingFaq) return;
  switchingFaq = true;
  try {
    while (currentFaq !== desiredFaq) {
      if (currentFaq) await animateFaq(currentFaq, false);
      // Re-read the last selection after closing, so rapid clicks are not lost.
      currentFaq = desiredFaq;
      await animateFaq(currentFaq, true);
    }
  } finally { switchingFaq = false; }
}

faqItems.forEach(item => {
  item.querySelector('summary').addEventListener('click', event => {
    event.preventDefault();
    desiredFaq = desiredFaq === item ? faqItems[0] : item;
    void updateFaq();
  });
  item.addEventListener('toggle', () => {
    if (switchingFaq) return;
    // Also reconcile native changes, such as opening a match via browser find.
    if (item.open) {
      faqItems.forEach(other => { if (other !== item) other.open = false; });
      currentFaq = desiredFaq = item;
    } else if (!faqItems.some(other => other.open)) {
      currentFaq = desiredFaq = faqItems[0];
      currentFaq.open = true;
    }
  });
});

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
