/***** TO DO ****/
/*
logout
DOB
*/

const fileClient = SolidFileClient;

$(document).ready(async function () {
    const session = await solid.auth.currentSession();

    function getWebIdFromUrl() {
        let urlParams = new URLSearchParams(window.location.search);
        let webIdFromUrl = urlParams.get('webId');
        return webIdFromUrl;
    }

    function getWebIdOrigin(webId) {
        let a = document.createElement("a");
        a.href = webId;
        return a.origin;
    }

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
        // automatically add Glen as friend (for tech support)
        let glen = 'https://devolution.inrupt.net/profile/card#me';
        if (!await checkFriends(me, glen)) {
            await me.friends.add(glen);
        }
        /* logout not working
        $('#login').click(function () {
            e.preventDefault;
            solid.auth.logout();
            localStorage.removeItem("solid-auth-client");
        });*/
    }

    async function checkFriends(me, them) {
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

    if (webIdFromUrl) {

        $('#addFriend').attr("href", webIdFromUrl);

        // Expand additional information section on sidebar
        $('.expand').click(function () {
            $('#additional-info').toggle();
            $(".sidebar").animate({
                scrollTop: $(document).height()
            }, "slow");
            return false;
        });

        // LOAD VCARD DATA
        let user = await solid.data[webIdFromUrl];
        let photo = await user.vcard$hasPhoto;
        let note = await user.vcard$note;
        let fullName = await user.vcard$fn;
        let firstName = fullName.toString().split(' ');
        firstName = firstName[0];
        let email = await getVcardEmail(webIdFromUrl);
        if (email) email = email.split('mailto:')[1];
        let phone = await getVcardPhone(webIdFromUrl);
        if (phone) phone = phone.split('tel:')[1];
        let address = await getVcardAddress(webIdFromUrl);
        let role = await user.vcard$role;
        let dob = await user.vcard$bday;
        const getAge = birthDate => Math.floor((new Date() - new Date(birthDate).getTime()) / 3.15576e+10);
        let age = await getAge(dob);
        let gender = await user.gender;
        let profileType = await user.vcard$profileType;
        let employmentStatus = await user.vcard$employmentStatus;
        let maritalStatus = await user.vcard$maritalStatus;
        let sexualOrientation = await user.vcard$sexualOrientation;
        let ethnicity = await user.vcard$ethnicity;
        let religion = await user.vcard$religion;
        let height = await user.vcard$height;
        let weight = await user.vcard$weight;

        // DISPLAY VCARD DATA

        document.title = fullName;
        $('#name').val(`${fullName}`);
        $(".name").html(`${firstName}`);
        if (role) $('#role').val(`${role}`);
        $('#webId').attr("href", webIdFromUrl);
        $(".profile-photo").attr("src", photo);
        if (note) $(".note").html(`${note}`);
        if (age) {
            $('#age').val(`${age}`);
            //$('#age').removeClass('editable-item');
        }
        $('#email').val(email);
        $('#phone').val(phone);
        $('#region').val(address[0]);
        $('#country').val(address[1]);

        // Additional info
        if (profileType) {
            $(`#profile-type option[value="${profileType}"]`).prop("selected", true);
            let profType = `'${profileType}'`;
            profType = profileType.toString();
            if (profType === 'Personal') {
                $('#personal').css("display", "block");
                $(`#gender option[value="${gender}"]`).prop("selected", true);
                $(`#employment-status option[value="${employmentStatus}"]`).prop("selected", true);
                $(`#marital-status option[value="${maritalStatus}"]`).prop("selected", true);
                $(`#sexual-orientation option[value="${sexualOrientation}"]`).prop("selected", true);
                $(`#ethnicity option[value="${ethnicity}"]`).prop("selected", true);
                $(`#religion option[value="${religion}"]`).prop("selected", true);
                $(`#height option[value="${height}"]`).prop("selected", true);
                $(`#weight option[value="${weight}"]`).prop("selected", true);
            }
            if (profType === 'Business') {
                $('#business').css("display", "block");
            }
        } else {
            $('#personal').css("display", "block");
        }

        $('#posts').html("");

        showFriends(webIdFromUrl);
        async function showFriends(webId) {
            const subject = await solid.data[webId];
            for await (const friend of subject.friends) {
                console.log(`  - ${await friend} is a friend of ${await fullName}`);
                // need to make sure that all urls are consistent
                try {
                    let fr = `${await getWebIdOrigin(await friend)}/profile/card#me`;
                    let friendUrl = "?webId=" + fr;
                    let friendPhoto = await solid.data[fr].vcard$hasPhoto;
                    if (!friendPhoto) friendPhoto = 'images/profilepic.jpg';
                    let friendName = await solid.data[friend].vcard$fn;
                    $('.friends .photos').prepend(`<a alt="${friendName}" href='${friendUrl}'><img class="friend-photo-small active-friend-photo" src="${friendPhoto}" /></a>`);
                } catch (e) {
                    console.log(e);
                }
            }
        }

        try {
            let about = await fileClient.readFile(dvoFolder + "about.html");
            $(".editable").html(`${await about}`);
        } catch (e) {
            $(".editable").html("This will be your extended note. When you log in, a file called about.html will uploaded to /public/DVO/. You can edit this file from the font-end. Additionally, two folders will be created: /DVO/posts and DVO/comments.");
        }

        displayPosts();

        // If user is logged in, and on their own profile page

        if (session && (session.webId === webIdFromUrl)) {
            $('.status').html('Logout');
            $('.sidebar .fa-save').show();
            $('.edit-icons').show();
            $('#add-new-post').show();
            $("#addPost").attr("placeholder", `What's on your mind, ${firstName}?`);
            $('#addPost').trumbowyg({
                semantic: false,
                resetCss: true
            });

            // Check if DVO folders exist, if not, create them 

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

            // Event Handlers that will only apply to a user if they are logged in, and on their own profile page
            $(".edit-content").click(function () {
                let $this = $(this);
                editContent($this);
            });
            $(".close-content").click(function () {
                $('.editable').trumbowyg('destroy');
            });
            $(".edit-note").click(function () {
                let $this = $(this);
                editNote($this);
            });
            $(".close-note").click(function () {
                $('.note').trumbowyg('destroy');
            });
            $('.sidebar').on('click', '.fa-save', function () {
                let $this = $(this);
                editItem($this);
            });
            $('.editable-item').click(function () {
                $(this).attr("contenteditable", 'true').focus();
            });
            $('#addFriend').click(function () {
                let $this = $(this);
                addFriend($this);
            });
            $('#addPostBtn').click(async function () {
                addPost();
            });
            $('.content').on('click', '.edit-post', function () {
                let $this = $(this);
                editPost($this);
            });
            $('.content').on('click', '.save-post', function () {
                let $this = $(this);
                savePost($this);
            });
            $('.content').on('click', '.delete-post', function () {
                let $this = $(this);
                deletePost($this);
            });
        }

        async function displayPosts() {
            try {
                let folder = await fileClient.readFolder(dvoFolder + "posts");
                let array = folder.files;
                if (!array || !array.length) {
                    $("#posts").html(`${firstName} hasn't posted anything yet.`);
                } else {
                    let display = 'display:none';
                    if (session) display = 'display:block';
                    for (let i = 0; i < array.length; i++) {
                        let label = array[i]['label'];
                        let id = label.split('.');
                        $.get(array[i]['url'], '', function (data) {
                            $("#posts").prepend(`<div class="edit-icons" style="${display}"><i data-button-type='${id[0]}' class="delete-post fa fa-close"></i><i data-button-type='${id[0]}' class="edit-post fa fa-edit"></i></div><div class='post ${id[0]}'>${data}</div>`);
                        });
                    }
                }
            } catch (e) {
                $("#posts").html(`${firstName} hasn't posted anything yet.`);
            }
        }

        async function editPost($this) {
            let id = $this.attr('data-button-type');
            $('.' + id).trumbowyg({
                semantic: false
            });
            $this.removeClass('edit-post');
            $this.removeClass('fa-edit');
            $this.addClass('save-post');
            $this.addClass('fa-save');
        }

        async function savePost($this) {
            let id = $this.attr('data-button-type');
            $('.' + id).trumbowyg('destroy');
            $this.removeClass('save-post');
            $this.removeClass('fa-save');
            $this.addClass('edit-post');
            $this.addClass('fa-edit');
            let url = `${webIdOrigin}/public/DVO/posts/${id}.html`;
            let update = $('.' + id).html();
            fileClient.updateFile(url, update, 'text/html').then(success => {
                console.log(`Updated ${url}.`)
            }, err => console.log(err));
        }

        async function deletePost($this) {
            let id = $this.attr('data-button-type');
            let url = `${webIdOrigin}/public/DVO/posts/${id}.html`;
            fileClient.deleteFile(url).then(success => {
                console.log(`Deleted ${url}.`);
                $('.' + id).remove();
                $this.parent().remove();
            }, err => console.log(err));
        }

        async function addPost() {
            let newNote = $("#addPost").val();
            // need to add a title field and prepend to file name
            let url = `${webIdOrigin}/public/DVO/posts/${new Date().getTime()}.html`;
            fileClient.createFile(url).then(fileCreated => {
                console.log(`Created file ${fileCreated}.`);
                fileClient.updateFile(fileCreated, newNote, 'text/html').then(success => {
                    console.log(`Updated ${url}.`);
                    $("#posts").html("");
                    displayPosts();
                }, err => console.log(err));
            }, err => console.log(err));
        }

        async function addFriend($this) {
            let me = await solid.data[session.webId];
            let friendId = $this.attr('href');
            let friend = await solid.data[friendId];
            friend = await getWebIdOrigin(friend);
            let isFriend = await checkFriends(me, friend);
            if (isFriend) {
                await me.friends.delete(friendId);
            } else {
                await me.friends.add(friend);
            }
        }

        async function editContent($this) {
            if ($this.hasClass('fa-edit')) {
                $('.editable').trumbowyg({
                    semantic: false
                });
            } else if ($this.hasClass('fa-save')) {
                $('.editable').trumbowyg('destroy');
                // would be better to have all edit functions in one event but trumbowyg doesn't like $(this)
                let update = $('.editable').html();
                let url = dvoFolder + "about.html";
                fileClient.updateFile(url, update, 'text/html').then(success => {
                    console.log(`Updated ${url}.`)
                }, err => console.log(err));
            }
            $this.toggleClass("fa-edit fa-save");
        }

        async function editNote($this) {
            if ($this.hasClass('fa-edit')) {
                $('.note').trumbowyg({
                    semantic: false
                });
            } else if ($this.hasClass('fa-save')) {
                $('.note').trumbowyg('destroy');
                // would be better to have all edit functions in one event but trumbowyg doesn't like $(this)
                let update = $('.note').html();
                await solid.data[session.webId].vcard$note.set(update);
            }
            $this.toggleClass("fa-edit fa-save");
        }

        async function editItem($this) {
            let field = $this.attr("data-type");
            let update = $('#' + field).val();
            let user = solid.data[session.webId];
            if (field === 'name') {
                await user.vcard$fn.set(update);
            }
            if (field === 'role') {
                await user.vcard$role.set(update);
            }
            if (field === 'email') {
                update = "mailto:" + update;
                await updateVcardEmail(session.webId, update);
            }
            if (field === 'phone') {
                update = "tel:" + update;
                await updateVcardPhone(session.webId, update);
            }
            if (field === 'region') {
                await updateVcardRegion(session.webId, update);
            }
            if (field === 'country') {
                await updateVcardCountry(session.webId, update);
            }
            if (field === 'age') {
                await user.vcard$bday.set(update);
            }
            if (field === 'gender') {
                await user.foaf$gender.set(update);
            }
            if (field === 'profile-type') {
                await user.vcard$profileType.set(update);
            }
            if (field === 'employment-status') {
                await user.vcard$employmentStatus.set(update);
            }
            if (field === 'marital-status') {
                await user.vcard$maritalStatus.set(update);
            }
            if (field === 'sexual-orientation') {
                await user.vcard$sexualOrientation.set(update);
            }
            if (field === 'ethnicity') {
                await user.vcard$ethnicity.set(update);
            }
            if (field === 'religion') {
                await user.vcard$religion.set(update);
            }
            if (field === 'height') {
                await user.vcard$height.set(update);
            }
            if (field === 'weight') {
                await user.vcard$weight.set(update);
            }

            alert(`${field} has been updated to ${update}`);
        }

        async function updateVcardEmail(webId, update) {
            for await (const emailId of solid.data[webId].vcard$hasEmail) {
                await solid.data[`${emailId }`].vcard$value.set(update);
            }
        }

        async function getVcardEmail(webIdFromUrl) {
            return new Promise(async resolve => {
                let array = [];
                for await (const emailId of solid.data[webIdFromUrl].vcard$hasEmail) {
                    let email = await solid.data[`${emailId }`].vcard$value
                    array.push(`${email}`);
                }
                resolve(array[0]);
            });
        }

        async function updateVcardPhone(webId, update) {
            for await (const phoneId of solid.data[webId].vcard$hasTelephone) {
                await solid.data[`${phoneId }`].vcard$value.set(update);
            }
        }

        function getVcardPhone(webIdFromUrl) {
            return new Promise(async resolve => {
                let array = [];
                for await (const phoneNum of solid.data[webIdFromUrl].vcard$hasTelephone) {
                    let phone = await solid.data[`${phoneNum}`].vcard$value;
                    array.push(`${phone}`);
                }
                resolve(array[0]);
            });
        }

        async function updateVcardRegion(webId, update) {
            for await (const addressId of solid.data[webId].vcard$hasAddress) {
                await solid.data[`${addressId }`].vcard$region.set(update);
            }
        }

        async function updateVcardCountry(webId, update) {
            for await (const addressId of solid.data[webId].vcard$hasAddress) {
                await solid.data[addressId]["http://www.w3.org/2006/vcard/ns#country-name"].set(update);
            }
        }

        function getVcardAddress(webIdFromUrl) {
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
    }
});
