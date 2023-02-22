var header = document.querySelector('header');

window.onscroll = function () {
	if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
		header.classList.add('header--small');
	} else {
		header.classList.remove('header--small');
	}
};
