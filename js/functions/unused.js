/**** unused code that i may use at a later date ***/

export async function addFriend(friendWebId) {

    let webId = await getWebId();
    const session = await solid.auth.currentSession();
    let webId = session.webId;
    let insertions = [];
    let deletions = [];
    try {
        const doc = $rdf.sym(webId.split('#')[0]);
        const add = $rdf.st($rdf.sym(webId), $rdf.sym(FOAF('knows')), $rdf.sym(friendWebId), doc);
        insertions.push(add);
        updater.update(deletions, insertions, (uri, success, message) => {
            if (!success) {
                console.log('Error: ' + message);
            }
        });
    } catch (error) {
        console.log(`Error adding data: ${error}`);
    }
}

export async function updateName(webId, name) {
    await fetcher.load(webId);
    const me = $rdf.sym(webId);
    const updatePromise = new Promise((resolve) => {
        const deletions = store.statementsMatching(me, $rdf.sym('http://xmlns.com/foaf/0.1/name'), null, me.doc());
        const additions = $rdf.st(me, $rdf.sym('http://xmlns.com/foaf/0.1/name'), new $rdf.Literal(name), me.doc());
        updater.update(deletions, additions, resolve);
    });
    await updatePromise;
}

export async function getName(webId) {
    await fetcher.load(webId); // can do this at the start
    const me = $rdf.sym(webId);
    const name = store.any(me, $rdf.sym('http://xmlns.com/foaf/0.1/name'), null, me.doc());
    return (name && name.termType === 'Literal') ? name.value : null;
}
export async function updateNote(webId, note) {
    /*const me = $rdf.sym(webId);
    const updatePromise = new Promise((resolve) => {
        const deletions = store.statementsMatching(me, $rdf.sym(VCARD('note')), null, me.doc());
        const additions = $rdf.st(me, $rdf.sym(VCARD('note')), new $rdf.Literal(note), me.doc());
        updater.update(deletions, additions, resolve);
    });
    await updatePromise;*/
}
/*
const friends = store.each($rdf.sym(webId), FOAF('knows'));
    friends.forEach(async(friend) => {
        await fetcher.load(friend);
        const fullName = store.any(friend, FOAF('name'));
        const friendPhoto = store.any($rdf.sym(friend), VCARD('hasPhoto'));
        let friendUrl = "?webId=" + friend.value;
        $('.friends .photos').prepend(`<a alt="${fullName && fullName.value || friend.value}" href='${friendUrl}'><img class="friend-photo-small active-friend-photo" src="${friendPhoto.value}" /></a>`);
});*/
export function getVcardNote(webIdFromUrl) {
    try {
        const note = store.any($rdf.sym(webIdFromUrl), VCARD('note'));
        return note.value;
    } catch (e) {
        return 'No notes';
    }
}
try {
    //let name = store.any(me, VCARD(‘fn’)) || store.any(me, FOAF(‘name’));
    let user = $rdf.sym(webIdFromUrl);
    let fullname = store.any(user, VCARD('name')) || store.any(user, FOAF('name')) || store.any(user, VCARD('fn'));
    return fullname.value;
} catch (e) {
    return 'Guest User';
}

export function getVcardPhoto(webIdFromUrl) {
    try {
        const photo = store.any($rdf.sym(webIdFromUrl), VCARD('hasPhoto'));
        return photo.value;
    } catch (e) {
        return 'images/profilepic.jpg'
    }
}

/*try {
        let location = store.any($rdf.sym(webIdFromUrl), VCARD('hasLocation'));
        return location.value;
    } catch (e) {
        return 'No location';
}*/
/*try {
    let email = await store.any($rdf.sym(webIdFromUrl), VCARD('hasEmail'));
    console.log(email);
    return email.value;
} catch (e) {
    console.log(e);
}
try {
    const email = await store.any($rdf.sym(webIdFromUrl), FOAF('mbox'));
    console.log(email.value);
} catch (e) {
    console.log(e);
}
try {
    const email = await store.any($rdf.sym(webIdFromUrl), FOAF('email'));
    console.log(email.value);
} catch (e) {
    return 'No email address';
}*/

/*
try {

    let phone = store.any($rdf.sym(webIdFromUrl), VCARD('hasTelephone'));
    return phone.value;
} catch (e) {
    return 'No phone number';
}*/

/*if (field === 'email') {
    port.postMessage({
        type: "updateProfile",
        url: url,
        field: 'email',
        update: update
    });
} else if (field === 'phone') {
    port.postMessage({
        type: "updateProfile",
        url: url,
        field: 'phone',
        update: update
    });
} else if (field === 'location') {
    port.postMessage({
        type: "updateProfile",
        url: url,
        field: 'location',
        update: update
    });
}*/


async function deleteDvoFolder(webId) {
    let webIdOrigin = await getWebIdOrigin(webId);
    let url = `${webIdOrigin}/public/DVO`;
    fileClient.deleteFile(url).then(success => {
        console.log(`Deleted ${url}.`);
    }, err => console.log(err));
}

async function deleteProfile(webId) {
    let webIdOrigin = await getWebIdOrigin(webId);
    let url = `${webIdOrigin}/public/profile.xml`;
    fileClient.deleteFile(url).then(success => {
        console.log(`Deleted ${url}.`);
    }, err => console.log(err));
}

// can merge these together. However, right now they are not being used

async function updateCard(webId, field, update) {
    await fetcher.load(webId);
    const me = $rdf.sym(webId);
    const updatePromise = new Promise((resolve) => {
        const deletions = store.statementsMatching(me, $rdf.sym(VCARD(field)), null, me.doc());
        const additions = $rdf.st(me, $rdf.sym(VCARD(field)), new $rdf.Literal(update), me.doc());
        updater.update(deletions, additions, resolve);
    });
    await updatePromise;
}

async function updateEmail(webId, email) {
    await fetcher.load(webId);
    const me = $rdf.sym(webId);
    const updatePromise = new Promise((resolve) => {
        const deletions = store.statementsMatching(me, $rdf.sym(VCARD('hasEmail')), null, me.doc());
        const additions = $rdf.st(me, $rdf.sym(VCARD('hasEmail')), new $rdf.Literal(email), me.doc());
        updater.update(deletions, additions, resolve);
    });
    await updatePromise;
}

async function updatePhone(webId, phone) {
    await fetcher.load(webId);
    const me = $rdf.sym(webId);
    const updatePromise = new Promise((resolve) => {
        const deletions = store.statementsMatching(me, $rdf.sym(VCARD('hasTelephone')), null, me.doc());
        const additions = $rdf.st(me, $rdf.sym(VCARD('hasTelephone')), new $rdf.Literal(phone), me.doc());
        updater.update(deletions, additions, resolve);
    });
    await updatePromise;
}

async function updateLocation(webId, location) {
    await fetcher.load(webId);
    const me = $rdf.sym(webId);
    const updatePromise = new Promise((resolve) => {
        const deletions = store.statementsMatching(me, $rdf.sym(VCARD('hasLocation')), null, me.doc());
        const additions = $rdf.st(me, $rdf.sym(VCARD('hasLocation')), new $rdf.Literal(location), me.doc());
        updater.update(deletions, additions, resolve);
    });
    await updatePromise;
}

async function setNicknames(webId, nicknames) {
    await fetcher.load(webId);
    const me = $rdf.sym(webId);
    const updatePromise = new Promise((resolve) => {
        const deletions = store.statementsMatching(me, $rdf.sym('http://xmlns.com/foaf/0.1/nick'), null, me.doc());
        const additions = nicknames.map(nickname => $rdf.st(me, $rdf.sym('http://xmlns.com/foaf/0.1/nick'), new $rdf.Literal(nickname), me.doc()));
        updater.update(deletions, additions, resolve);
    });
    await updatePromise;
}

async function updateProfileXML(url, field, update) {
    let xmlDoc = await getProfileXML(url);
    $(xmlDoc).find(field).html(update);
    let str = (new XMLSerializer()).serializeToString(xmlDoc);
    fileClient.updateFile(url, str, 'text/xml').then(success => {
        console.log(`Updated ${url}.`);
    }, err => console.log(err));
}

async function getProfileXML(url) {
    return new Promise(async resolve => {
        fileClient.readFile(url).then(file => {
            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(file, "text/xml");
            resolve(xmlDoc);
        });
    });
}

/*
    async function createDvoFolder(webId) {
        let webIdOrigin = await getWebIdOrigin(webId);
        let url = `${webIdOrigin}/public/DVO/`;
        fileClient.readFolder(url).then(folder => {
            console.log(`${url} exists`);
        }, err => {
            fileClient.createFolder(url).then(success => {
                console.log(`Created folder ${url}.`);

                let html = `<html><h1>Hello, and welcome to my profile</h1><p>You need to be logged in to update your profile information. Please note that your resume and profile data will be stored in the DVO folder, inside your public folder. Right now, you can login via the front-end. However, I will be changing this so that you will login via a chrome extension. Any time you want to write data to your profile or update your resume, a message will be sent to the chrome extension, and a message will be sent back asking you to confirm.</p></html>`;
                let resumeUrl = url + 'resume.html';
                fileClient.createFile(resumeUrl).then(fileCreated => {
                    console.log(`Created file ${fileCreated}.`);
                    fileClient.updateFile(fileCreated, html, 'text/html').then(success => {
                        console.log(`Updated ${resumeUrl}.`);
                    }, err => console.log(err));
                }, err => console.log(err));

                let postsFolder = url + 'posts';
                fileClient.createFolder(postsFolder).then(success => {
                    console.log(`Created folder ${postsFolder}.`);
                }, err => console.log(err));

                let photosFolder = url + 'photos';
                fileClient.createFolder(photosFolder).then(success => {
                    console.log(`Created folder ${photosFolder}.`);
                }, err => console.log(err));

                let commentsFolder = url + 'comments';
                fileClient.createFolder(commentsFolder).then(success => {
                    console.log(`Created folder ${commentsFolder}.`);
                }, err => console.log(err));

            }, err => console.log(err));
        });
    }*/

async function createProfile(webId) {
    let webIdOrigin = await getWebIdOrigin(webId);
    let url = `${webIdOrigin}/public/DVO/profile.xml`;
    fileClient.readFile(url).then(file => {
        console.log(`${url} exists ${file}`);
    }, err => {
        console.log(err);
        let xml = `<profile><email>user@email.com</email><phone>(+44)07569979745</phone><location>Devon, UK</location></profile>`;
        fileClient.createFile(url).then(fileCreated => {
            console.log(`Created file ${fileCreated}.`);
            fileClient.updateFile(fileCreated, xml, 'text/xml').then(success => {
                console.log(`Updated ${url}.`);
            }, err => console.log(err));
        }, err => console.log(err));
    });
}

// This function only works the second time it is called
async function getProfile(webId) {
    let webIdOrigin = await getWebIdOrigin(webId);
    let url = `${webIdOrigin}/public/DVO/profile.xml`;
    fileClient.readFile(url).then(file => {
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(file, "text/xml");
        let email = $(xmlDoc).find("email").html();
        let phone = $(xmlDoc).find("phone").html();
        let location = $(xmlDoc).find("location").html();
        $("#email").html(email);
        $("#phone").html(phone);
        $("#location").html(location);
    }, async err => {
        let isAuthor = await isAuthorOfPage();
        if (isAuthor) {
            let xml = `<profile><email>user@email.com</email><phone>(+44)07569979745</phone><location>Devon, UK</location></profile>`;
            fileClient.createFile(url).then(fileCreated => {
                console.log(`Created file ${fileCreated}.`);
                fileClient.updateFile(fileCreated, xml, 'text/xml').then(success => {
                    console.log(`Updated ${url}.`);
                    getProfile(webId);
                }, err => console.log(err));
            }, err => console.log(err));
        } else {
            $("#email").html('No email address');
            $("#phone").html('No phone number');
            $("#location").html('No location');
        }
    });
}
