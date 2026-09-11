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
  document.querySelectorAll('.intro-grid > *, .gallery-intro > figure, .section-heading, .homes-grid > figure, .homes-side > *, .privacy-band, .amenities-head, .amenity, .location-duo > figure, .places-grid > li, .closing-inner, .footer-contact').forEach(element => {
    // Leave the initial viewport (especially the hero) untouched.
    if (element.getBoundingClientRect().top >= window.innerHeight) observer.observe(element);
  });
}
