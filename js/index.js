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

$(document).ready(function () {
    $('.home-page-content').load(`html/gettingStarted.html`);

    function getRandomProvider() {
        let provider = [
                    "https://inrupt.net",
                    "https://solid.community"
                ];
        var rand = Math.floor(Math.random() * provider.length);
        return provider[rand];
    }

    $(`#provider option[value="${getRandomProvider()}"]`).attr("selected", true);

    function getHashParams() {
        var hashParams = {};
        var e,
            a = /\+/g, // Regex for replacing addition symbol with a space
            r = /([^&;=]+)=?([^&;]*)/g,
            d = function (s) {
                return decodeURIComponent(s.replace(a, " "));
            },
            q = window.location.hash.substring(1);
        while (e = r.exec(q))
            hashParams[d(e[1])] = d(e[2]);
        return hashParams;
    }

    let hashParams = getHashParams();
    console.log(hashParams);
    if (Object.entries(hashParams).length > 0) {
        $('#viewProfile span').text('VIEW PROFILE');
        $('#viewProfile').removeClass('btn-blue');
        $('#viewProfile').addClass('btn-red');
        $('.login-status').html('You are logged in');
    }

    let laserExtensionId = "bnmeokbnbegjnbddihbidleappfkiimj";
    let port = chrome.runtime.connect(laserExtensionId);

    async function sendSessionToDVO() {
        const session = await solid.auth.currentSession();
        if (session && session.webId) {
            port.postMessage({
                type: "storeSolidSessionToken",
                sessionToken: session,
                profileUrl: window.location.host
            });
        }
    }

    async function login(idp) {
        const session = await solid.auth.currentSession();
        if (!session) {
            await solid.auth.login(idp);

            sendSessionToDVO()
        } else {
            alert(`Logged in as ${session.webId}`);
        }

    }

    $(document).on('click', '#submit', 'touchstart', function () {
        let provider = $("#provider").val();
        login(provider);
    });
    $('#send').click(async function () {
        sendSessionToDVO(); // This should happen automatically
        const session = await solid.auth.currentSession();
        let url = `profile.html?webId=${session.webId}`;
        window.open(url, '_blank');
    });
    $('#viewProfile').click(async function () {
        const session = await solid.auth.currentSession();
        let url = `profile.html?webId=${session.webId}`;
        window.open(url, '_blank');
    });
    /**** This is for testing purposes ****/
    $('#clear').click(function () {
        //solid.auth.logout();
        //localStorage.clear();
        localStorage.removeItem("solid-auth-client");
        port.postMessage({
            type: "clearLocalStorage"
        });
    });
    /**** reload page with access token *****/
    $('#reload').click(function () {
        window.location = window.location.pathname
    });
})
