$(document).ready(function () {
    $('.home-page-content').load(`html/gettingStarted.html`);
})

$(document).on('click', '.page-link', function (event) {
    event.preventDefault();
    const name = this.dataset.page;
    $('.active').removeClass('active');
    // need to make menu item active when click on inline links
    this.classList.add('active');
    $('.page').hide();
    $('.' + name + '-page').show();
    $('.home-page-content').load(`html/${name}.html`);
});
