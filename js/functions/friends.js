import {
    FOAF, VCARD, store, fetcher, updater, fileClient
}
from './namespaces.js';
import {
    getWebIdFromUrl, getWebIdOrigin
}
from './webId.js';

let webIdFromUrl = getWebIdFromUrl();

$('#addFriend').attr("href", webIdFromUrl);

$('#addFriend').click(async function () {
    const session = await solid.auth.currentSession();
    let me = await solid.data[session.webId];
    let friendId = $(this).attr('href');
    //let friend = await solid.data[friendId];
    let frnd = await getWebIdOrigin(friendId);
    let isFriend = await checkFriends(me, frnd);
    if (isFriend) {
        console.log('yes');
        await me.friends.delete(friendId).then(function(err){
            console.log(err);
        });
    } else {
        await me.friends.add(friend);
    }
});

export async function removeFriend(friend) {
    
}

export async function checkFriends(me, them) {
    return new Promise(async resolve => {
        for await (const friend of me.friends) {
            let isFriend = await getWebIdOrigin(friend); // remove /profile/card#me to ensure consistency
            if (them === isFriend) {
                //console.log(`  - ${me} is a friend of ${isFriend}`);
                resolve(true);
            }
        }
        resolve(false);
    });
}

export async function showFriends(webId) {
    const subject = await solid.data[webId];
    let fullName = await subject.vcard$fn;
    for await (let friend of subject.friends) {
        //console.log(`  - ${await friend} is a friend of ${await fullName}`);
        // need to make sure that all urls are consistent
        let fr = `${await getWebIdOrigin(await friend)}/profile/card#me`;
        let friendUrl = "?webId=" + fr;
        let photo = await solid.data[fr].vcard$hasPhoto;
        if (!photo) photo = 'images/profilepic.jpg';
        $('.friends .photos').prepend(`<a alt="${fullName}" href='${friendUrl}'><img class="friend-photo-small active-friend-photo" src="${photo}" /></a>`);
    }
}
