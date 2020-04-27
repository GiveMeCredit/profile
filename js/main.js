import {
    FOAF, VCARD, store, fetcher, updater, fileClient
}
from './functions/namespaces.js'; // can probably remove some of these as i'm using ldflex now
import {
    showFriends, checkFriends
}
from './functions/friends.js';
import {
    displayPosts
}
from './functions/posts.js';
import {
    getWebId, getWebIdOrigin, getWebIdFromUrl
}
from './functions/webId.js';
import {
    getVcardEmail, getVcardPhone, getVcardAddress, updateVcardEmail, updateVcardPhone, updateVcardRegion, updateVcardCountry
}
from './functions/vcard.js';
import {
    getAboutPage, updateAboutPage, createAboutPage
}
from './functions/fileManager.js';
import {
    createFolders
}
from './functions/createFolders.js';

$(document).ready(async function () {
    const session = await solid.auth.currentSession();

    // CHECK QUERY STRING FOR WEBID
    let webIdFromUrl = getWebIdFromUrl(); // e.g. https://devolution.inrupt.net/profile/card
    webIdFromUrl = webIdFromUrl + "#me"; // e.g https://devolution.inrupt.net/profile/card#me
    let webIdOrigin = await getWebIdOrigin(webIdFromUrl); // e.g. https://devolution.inrupt.net/
    let dvoFolder = `${webIdOrigin}/public/DVO/`; // e.g. https://devolution.inrupt.net/public/DVO/

    if (session) {
        $('.home').attr('href', '?webId=' + session.webId);
        const me = await solid.data[session.webId];
        const them = webIdOrigin;
        if (await checkFriends(me, them)) {
            $('#addFriend').text('UNFRIEND');
        }
    }

    if (webIdFromUrl) {

        // LOAD VCARD DATA  - js/functions/vcard.js
        await fetcher.load(webIdFromUrl); // Do i still need this? 
        let photo = await solid.data[webIdFromUrl].vcard$hasPhoto;
        let note = await solid.data[webIdFromUrl].vcard$note;
        let fullName = await solid.data[webIdFromUrl].vcard$fn;
        let firstName = fullName.toString().split(' ');
        firstName = firstName[0];
        let email = await getVcardEmail(webIdFromUrl);
        if (email) email = email.split('mailto:')[1];
        let phone = await getVcardPhone(webIdFromUrl);
        if (phone) phone = phone.split('tel:')[1];
        let address = await getVcardAddress(webIdFromUrl);
        let role = await solid.data[webIdFromUrl].vcard$role;

        // DISPLAY VCARD DATA
        document.title = fullName;
        $('#name').html(`${fullName}`);
        $(".name").html(`${firstName}`);
        if (role) $('.sidebar-sub-header').html(`${role}`);
        $('#webId').attr("href", webIdFromUrl);
        $(".profile-photo").attr("src", photo);
        if (note) $(".note").html(`${note}`);
        $('#email').html(email);
        $('#phone').html(phone);
        $('#region').html(address[0]);
        $('#country').html(address[1]);
        $('#posts').html("");
        showFriends(webIdFromUrl);

        try {
            let about = await fileClient.readFile(dvoFolder + "about.html");
            $(".editable").html(`${await about}`);
        } catch (e) {
            $(".editable").html("This will be your extended note. When you log in, a file called about.html will uploaded to /public/DVO/. Additionally, two folders will be created: /DVO/posts and DVO/comments. You can edit this file from the font-end.");
        }

        try {
            let folder = await fileClient.readFolder(dvoFolder + "posts");
            let array = folder.files;
            if (!array || !array.length) {
                $("#posts").html(`${firstName} hasn't posted anything yet.`);
            } else {
                for (let i = 0; i < array.length; i++) {
                    let label = array[i]['label'];
                    let id = label.split('.');
                    await $.get(array[i]['url'], '', function (data) {
                        $("#posts").prepend(`<div class="post-icons"><i data-button-type='${id[0]}' class="delete fa fa-close"></i><i data-button-type='${id[0]}' class="edit-post fa fa-edit"></i></div><div class='post ${id[0]}'>${data}</div>`);
                    });
                }
            }
        } catch (e) {
            $("#posts").html(`${firstName} hasn't posted anything yet.`);
        }

        // CHECK IF DVO FOLDER EXISTS
        // CHECK THAT THE WEBID FROM THE QUERY STRING MATCHED THE LOGGED IN USERS WEBID
        if (session && (session.webId === webIdFromUrl)) {
            $('.status').html('Logout');
            $('.edit-icons').show();
            $('.post-icons').show();
            $('#add-new-post').show();
            $("#addPost").attr("placeholder", `What's on your mind, ${firstName}?`);
            $('#addPost').trumbowyg({
                semantic: false,
                resetCss: true
            });

            // Need to remove createFolders.js, as i no longer need it

            try {
                await fileClient.readFolder(dvoFolder);
            } catch (e) {
                console.log("DVO folder doesn't exist. Creating it now...");
                await fileClient.createFolder(dvoFolder);
            }
            try {
                await fileClient.readFolder(dvoFolder + "posts");
            } catch (e) {
                console.log("Posts folder doesn't exist. Creating it now...");
                await fileClient.createFolder(dvoFolder + 'posts');
            }
            /*
            I won't create a photos folder, instead, i'll use the Pixolid photo manager
            try {
                await fileClient.readFolder(dvoFolder + "photos");
            } catch (e) {
                console.log("Photos folder doesn't exist. Creating it now...");
                await fileClient.createFolder(dvoFolder + 'photos');
            }*/
            try {
                await fileClient.readFolder(dvoFolder + "comments");
            } catch (e) {
                console.log("Comments folder doesn't exist. Creating it now...");
                await fileClient.createFolder(dvoFolder + 'comments');
            }
            try {
                let about = await fileClient.readFile(dvoFolder + "about.html");
                $(".editable").html(`${await about}`);
            } catch (e) {
                console.log("About.html doesn't exist. Creating it now...");
                let fileCreated = await fileClient.createFile(dvoFolder + 'about.html');
                await fileClient.updateFile(`${await fileCreated}`, "This is your about page", 'text/html');
                let about = await fileClient.readFile(dvoFolder + "about.html");
                $(".editable").html(`${await about}`);
            }
        }

        $(".edit-content").click(async function () {
            if ($(this).hasClass('fa-edit')) {
                $('.editable').trumbowyg({
                    semantic: false
                });
            } else if ($(this).hasClass('fa-save')) {
                $('.editable').trumbowyg('destroy');
                // would be better to have all edit function in one event but trumbowyg doesn't like $(this)
                let update = $('.editable').html();
                await updateAboutPage(dvoFolder, update);
            }
            $(this).toggleClass("fa-edit fa-save");
        });

        $(".close-content").click(function () {
            $('.editable').trumbowyg('destroy');
        });

        $(".edit-note").click(async function () {
            if ($(this).hasClass('fa-edit')) {
                $('.note').trumbowyg({
                    semantic: false
                });
            } else if ($(this).hasClass('fa-save')) {
                $('.note').trumbowyg('destroy');
                // would be better to have all edit functions in one event but trumbowyg doesn't like $(this)
                let update = $('.note').html();
                await solid.data[session.webId].vcard$note.set(update);
            }
            $(this).toggleClass("fa-edit fa-save");
        });

        $(".close-note").click(function () {
            $('.editable').trumbowyg('destroy');
        });

        $('.sidebar').on('click', '.edit-details', async function () { // edit-details should be called 'save'
            let field = $(this).attr("data-field");
            let update = $(`#${field}`).html();

            if (field === 'name') {
                await solid.data[session.webId].vcard$name.set(update);
            } else if (field === 'email') {
                update = "mailto:" + update;
                await updateVcardEmail(session.webId, update);
            } else if (field === 'phone') {
                update = "tel:" + update;
                await updateVcardPhone(session.webId, update);
            } else if (field === 'region') {
                await updateVcardRegion(session.webId, update);
            } else if (field === 'country') {
                await updateVcardCountry(session.webId, update);
            } else {
                alert('Sorry, you need to login to update your profile');
            }
            $(this).fadeOut('slow');
        });

        $('.editable-item').click(function () {
            $(this).attr("contenteditable", 'true').focus();
            let field = $(this).attr('id');
            $(this).parent().next('span').html(`<i class="edit-details fa fa-save" data-field="${field}"></i>`);
        });
    }
});
