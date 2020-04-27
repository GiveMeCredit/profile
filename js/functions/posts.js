import {
    getWebId, getWebIdOrigin, getWebIdFromUrl
}
from './webId.js';
import {
    fileClient
}
from './namespaces.js';

$(document).on('click', '#posts i', async function () {
    let id = $(this).attr('data-button-type');
    let webId = await getWebId();
    let webIdOrigin = await getWebIdOrigin(webId);
    let url = `${webIdOrigin}/public/DVO/posts/${id}.html`;
    if ($(this).hasClass('delete')) {
        fileClient.deleteFile(url).then(success => {
            console.log(`Deleted ${url}.`);
            $("#posts").html("");
            displayPosts(webId);
        }, err => console.log(err));
    } else if ($(this).hasClass('edit-post')) {
        if (!$(this).hasClass('editing')) {
            $('.' + id).attr('contenteditable', 'true');
            $(this).html('SAVE');
            $(this).addClass('editing');
        } else {
            $('.' + id).attr('contenteditable', 'false');
            $(this).html('EDIT');
            $(this).removeClass('editing');
            let update = $('.' + id).html();
            fileClient.updateFile(url, update, 'text/html').then(success => {
                console.log(`Updated ${url}.`)
            }, err => console.log(err));
        }
    }
});

$('#addPostBtn').click(async function () {
    let newNote = $("#addPost").val();
    let webId = await getWebId();
    let webIdOrigin = await getWebIdOrigin(webId);
    //maybe make post name more descriptive (include keywords)
    let url = `${webIdOrigin}/public/DVO/posts/${Math.round(Math.random()*100000)}.html`;
    fileClient.createFile(url).then(fileCreated => {
        console.log(`Created file ${fileCreated}.`);
        fileClient.updateFile(fileCreated, newNote, 'text/html').then(success => {
            console.log(`Updated ${url}.`);
            $("#posts").html("");
            displayPosts(webId);
        }, err => console.log(err));
    }, err => console.log(err));
});

export async function displayPosts(webId) {
    let postsArray = await getPosts(webId);
    if (postsArray !== null) {
        let webIdFromUrl = getWebIdFromUrl();
        const session = await solid.auth.currentSession();
        if (session.webId === webIdFromUrl + "#me") {
            for (let i = 0; i < postsArray.length; i++) {
                let label = postsArray[i]['label'];
                let id = label.split('.');
                $.get(postsArray[i]['url'], '', function (data) {
                    $("#posts").prepend(`<div class="post-icons"><i data-button-type='${id[0]}' class="delete fa fa-close"></i><i data-button-type='${id[0]}' class="edit-post fa fa-edit"></i></div><div class='post ${id[0]}'>${data}</div>`);
                });
            }
        } else {
            for (let i = 0; i < postsArray.length; i++) {
                let label = postsArray[i]['label'];
                let id = label.split('.');
                $.get(postsArray[i]['url'], '', function (data) {
                    $("#posts").prepend(`<div class='post ${id[0]}'>${data}</div>`);
                });
            }
        }
    }
}

export async function getPosts(webId) {
    let webIdOrigin = await getWebIdOrigin(webId);
    let url = `${webIdOrigin}/public/DVO/posts/`;
    let fullName = await solid.data[webId].vcard$fn;
    let firstName = fullName.toString().split(' ');
    firstName = firstName[0];
    return new Promise(resolve => {
        fileClient.readFolder(url).then(folder => {
            let array = folder.files;
            if (!array || !array.length) {
                $("#posts").html(firstName + " has not posted anything yet.");
                resolve(null);
            } else {
                let obj = JSON.stringify(array);
                resolve(JSON.parse(obj));
            }
        }, err => {
            console.log(err);
            $("#posts").html(firstName + " has not posted anything yet.");
        });
        resolve(null);
    });
}
