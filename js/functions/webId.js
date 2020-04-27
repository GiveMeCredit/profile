export function getWebIdFromUrl() {
    let urlParams = new URLSearchParams(window.location.search);
    let webIdFromUrl = urlParams.get('webId');
    return webIdFromUrl;
}

export async function getWebId() {
    return new Promise(resolve => {
        solid.auth.trackSession(session => {
            resolve(session.webId);
        });
    });
}

export async function getWebIdOrigin(webId) {
    let a = document.createElement("a");
    a.href = webId;
    return a.origin;
}
