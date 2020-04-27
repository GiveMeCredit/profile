import {
    FOAF, VCARD, store, fetcher, updater, fileClient
}
from './namespaces.js';

export async function updateVcardEmail(webId, update) {
    for await (const emailId of solid.data[webId].vcard$hasEmail) {
        console.log(`- ${emailId}`);
        await solid.data[`${emailId }`].vcard$value.set(update);
    }
}

export async function getVcardEmail(webIdFromUrl) {
    return new Promise(async resolve => {
        let array = [];
        for await (const emailId of solid.data[webIdFromUrl].vcard$hasEmail) {
            console.log(`- ${emailId}`);
            let email = await solid.data[`${emailId }`].vcard$value
            console.log(`${email}`);
            array.push(`${email}`);
        }
        resolve(array[0]);
    });
}

export async function updateVcardPhone(webId, update) {
    for await (const phoneId of solid.data[webId].vcard$hasTelephone) {
        console.log(`- ${phoneId}`);
        await solid.data[`${phoneId }`].vcard$value.set(update);
    }
}

export function getVcardPhone(webIdFromUrl) {
    return new Promise(async resolve => {
        let array = [];
        for await (const phoneNum of solid.data[webIdFromUrl].vcard$hasTelephone) {
            console.log(`- ${phoneNum}`);
            let phone = await solid.data[`${phoneNum}`].vcard$value;
            console.log(`${phone}`);
            array.push(`${phone}`);
        }
        resolve(array[0]);
    });
}

export async function updateVcardRegion(webId, update) {
    for await (const addressId of solid.data[webId].vcard$hasAddress) {
        console.log(`- ${addressId}`);
        await solid.data[`${addressId }`].vcard$region.set(update);
    }
}

export async function updateVcardCountry(webId, update) {
    for await (const addressId of solid.data[webId].vcard$hasAddress) {
        console.log(`- ${addressId}`);
        await solid.data[addressId]["http://www.w3.org/2006/vcard/ns#country-name"].set(update);
    }
}

export function getVcardAddress(webIdFromUrl) {
    return new Promise(async resolve => {
        let array = [];
        for await (const addressId of solid.data[webIdFromUrl].vcard$hasAddress) {
            console.log(`- ${addressId}`);
            let country = await solid.data[addressId]["http://www.w3.org/2006/vcard/ns#country-name"];
            let region = await solid.data[`${addressId}`].vcard$region;
            console.log(`${region}, ${country}`);
            array.push(`${region}`);
            array.push(`${country}`);
        }
        resolve(array);
    });
}