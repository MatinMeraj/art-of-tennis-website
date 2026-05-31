const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => siteNav.classList.toggle('open'));
}

document.querySelectorAll('.signup-form').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    alert('Newsletter signup is a placeholder until the email service is connected.');
  });
});
