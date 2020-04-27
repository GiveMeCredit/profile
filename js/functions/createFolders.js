// let url = `${webIdOrigin}/public/DVO/`;

import {
    fileClient
}
from './namespaces.js';

export async function createFolders(url) {

    fileClient.createFolder(url).then(success => {
        console.log(`Created DVO folder.`);
    }, err => console.log(err));

    //let postsFolder = url + 'posts';
    fileClient.createFolder(url + 'posts').then(success => {
        console.log(`Created posts folder.`);
    }, err => console.log(err));

    //let photosFolder = url + 'photos';
    fileClient.createFolder(url + 'photos').then(success => {
        console.log(`Created photos folder.`);
    }, err => console.log(err));

    //let commentsFolder = url + 'comments';
    fileClient.createFolder(url + 'comments').then(success => {
        console.log(`Created comments folder.`);
    }, err => console.log(err));
}