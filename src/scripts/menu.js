let hamburger = document.querySelector('.c-hamburger');
let hambugerBar = document.querySelector('.c-hamburger-bar');
let menu = document.querySelector('.nav-links');
let body = document.querySelector('body');

hamburger.addEventListener('click', () => {
	menu.classList.toggle('expanded');
	hamburger.classList.toggle('active');
	body.style.overflowY = body.style.overflowY === 'hidden' ? 'auto' : 'hidden';
});
