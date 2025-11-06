/* Home animation utilities */
export const revealOnScroll = () => {
  if (typeof window === 'undefined') return;
  const els = document.querySelectorAll('[data-reveal]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('opacity-100','translate-y-0');
      }
    });
  }, { threshold: 0.2 });
  els.forEach((el) => io.observe(el));
};
