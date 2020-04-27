$(function () {
    showPage('gettingStarted');
});

const pageFunctions = {};

function registerPage(name, pageFunction) {
    pageFunctions[name] = pageFunction;
}

$(document).on('click', '.page-link', function (event) {
    event.preventDefault();
    const name = this.dataset.page;
    $('.active').removeClass('active');
    this.classList.add('active');
    showPage(name);
});

function showPage(name) {
    $('.page').hide();
    $('.' + name + '-page').show();

    pageFunctions[name]();
}

function about() {
    document.title = 'About';
    $('.home-page-content').load('html/about.html');
}

registerPage('about', about);

function videos() {
    document.title = 'Videos';
    $('.home-page-content').load('html/videos.html');
}

registerPage('videos', videos);

function tutorials() {
    document.title = 'Tutorials';
    $('.home-page-content').load('html/tutorials.html');
}

registerPage('tutorials', tutorials);

function faq() {
  document.title = 'FAQ';
    $('.home-page-content').load('html/faq.html');
}

registerPage('faq', faq);

function gettingStarted() {
    document.title = 'Getting Started';
    $('.home-page-content').load('html/gettingStarted.html');
}

registerPage('gettingStarted', gettingStarted);

function other() {
 document.title = "Other Projects";
    $('.home-page-content').load('html/other.html');
}

registerPage('other', other);
