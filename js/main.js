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

        if (await checkFriends(me, them)) {
            $('#addFriend').text('UNFRIEND');
        }
        // automatically add Glen as friend (for tech support)
        let glen = 'https://devolution.inrupt.net/profile/card#me';
        if (!await checkFriends(me, glen)) {
            await me.friends.add(glen);
        }
    }

    if (webIdFromUrl) {

        // LOAD VCARD DATA  - js/functions/vcard.js
        //await fetcher.load(webIdFromUrl); // Do i still need this? 
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
        let dob = await solid.data[webIdFromUrl].vcard$bday;
        const getAge = birthDate => Math.floor((new Date() - new Date(birthDate).getTime()) / 3.15576e+10);
        let age = await getAge(dob);

        // DISPLAY VCARD DATA

        document.title = fullName;
        $('#name').html(`${fullName}`);
        $(".name").html(`${firstName}`);
        if (role) $('#role').html(`${role}`);
        $('#webId').attr("href", webIdFromUrl);
        $(".profile-photo").attr("src", photo);
        if (note) $(".note").html(`${note}`);
        if (age) {
            $('#age').html(`${age}`);
            $('#age').removeClass('editable-item');
        }
        $('#email').html(email);
        $('#phone').html(phone);
        $('#region').html(address[0]);
        $('#country').html(address[1]);
        $('#posts').html("");

        try {
            let about = await fileClient.readFile(dvoFolder + "about.html");
            $(".editable").html(`${await about}`);
        } catch (e) {
            $(".editable").html("This will be your extended note. When you log in, a file called about.html will uploaded to /public/DVO/. You can edit this file from the font-end. Additionally, two folders will be created: /DVO/posts and DVO/comments.");
        }

        /*let darcy = `${webIdOrigin}/public/darcy/post`;

        try {
            let folder = await fileClient.readFolder(darcy);
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
        }*/

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

        $('.sidebar').on('click', '.fa-save', async function () {
            let field = $(this).attr("data-field");
            let update = $(`#${field}`).html();

            if (field === 'name') {
                await solid.data[session.webId].vcard$name.set(update);
            } else if (field === 'role') {
                await solid.data[session.webId].vcard$role.set(update);
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
            } else if (field === 'age') {
                await solid.data[`${session.webId}`].vcard$bday.set(update);
            } else {
                alert('Sorry, you need to login to update your profile');
            }
            $('.edit-details').fadeOut('slow');
        });

        $('.sidebar').on('click', '.fa-close', async function () {
            $(this).parent().attr("contenteditable", 'false');
            $('.edit-details').fadeOut('slow');
        });

        $('.editable-item').click(function () {
            $(this).attr("contenteditable", 'true').focus();
            let field = $(this).attr('id');
            console.log(field);
            $(this).next('span').html(`<span class="edit-details"><i class="fa fa-save" data-field="${field}"></i><i class="fa fa-close" data-field="${field}"></i></span>`);
        });

        $('.expand').click(function () {
            $('#additional-info').toggle();
            $(".sidebar").animate({
                scrollTop: $(document).height()
            }, "slow");
            return false;
        });

        showFriends(webIdFromUrl);
    }
});
