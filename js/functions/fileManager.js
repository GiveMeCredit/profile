import {
    fileClient
}
from './namespaces.js';

export async function createAboutPage(url) {
    console.log(url);
    let html = `<p>This is your extended note. It is located at public/DVO/about.html. Here you can provide detailed information about yourself, without needing to dump large amounts of html markup into your profile document.</p>`;
    let aboutUrl = url + 'about.html';
    fileClient.createFile(aboutUrl).then(fileCreated => {
        console.log(`Created about.html.`);
        fileClient.updateFile(fileCreated, html, 'text/html').then(success => {
            console.log(`Initialized about.html.`);
        }, err => console.log(err));
    }, err => console.log(err));
}

export async function getAboutPage(url) {
    return new Promise(resolve => {
        url = url + "about.html";
        fileClient.readFile(url).then(file => {
            resolve(file);
        }, err => {
            resolve(err);
        });
    });
}

export function updateAboutPage(url, update) {
    url = url + "about.html"; // needs to be changed to about.html
    fileClient.updateFile(url, update, 'text/html').then(success => {
        console.log(`Updated ${url}.`)
    }, err => console.log(err));
}
