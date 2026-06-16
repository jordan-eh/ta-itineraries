document.querySelectorAll('.activities-toggle').forEach(toggle => {
  toggle.addEventListener('click', () => {
    toggle.closest('.explore-activities').classList.toggle('is-open');
    document.dispatchEvent(new CustomEvent('accordion-toggled'));
  });
});

