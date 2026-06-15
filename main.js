document.querySelectorAll('.activities-toggle').forEach(toggle => {
  toggle.addEventListener('click', () => {
    toggle.closest('.explore-activities').classList.toggle('is-open');
    document.dispatchEvent(new CustomEvent('accordion-toggled'));
  });
});

// On desktop, Day 1 starts closed (it has is-open in HTML for mobile default)
if (!window.matchMedia('(max-width: 430px)').matches) {
  var day1Panel = document.querySelector('.day-panel[data-day="1"]');
  if (day1Panel) {
    var day1Explore = day1Panel.querySelector('.explore-activities');
    if (day1Explore) day1Explore.classList.remove('is-open');
  }
}
