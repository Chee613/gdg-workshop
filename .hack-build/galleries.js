// ponytail: native scroll snapping handles swipes; the buttons use the same scroll position.
for (const gallery of document.querySelectorAll('.example-gallery-wrap')) {
  const viewport = gallery.querySelector('.example-gallery');
  const pairs = [...gallery.querySelectorAll('.example-pair')];
  const previous = gallery.querySelector('[data-gallery-step="-1"]');
  const next = gallery.querySelector('[data-gallery-step="1"]');
  const index = () => viewport.clientWidth ? Math.round(viewport.scrollLeft / viewport.clientWidth) : 0;
  const move = step => viewport.scrollTo({
    left: Math.max(0, Math.min(pairs.length - 1, index() + step)) * viewport.clientWidth,
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
  });
  function update() {
    const current = index();
    previous.disabled = current === 0;
    next.disabled = current === pairs.length - 1;
    pairs.forEach((pair, i) => { pair.inert = i !== current; pair.setAttribute('aria-hidden', String(i !== current)); });
    gallery.querySelector('[role="status"]').textContent = `Example pair ${current + 1} of ${pairs.length}`;
  }
  gallery.addEventListener('click', event => {
    const button = event.target.closest('[data-gallery-step]');
    if (button) move(Number(button.dataset.galleryStep));
  });
  viewport.addEventListener('scroll', update, {passive: true});
  update();
}
