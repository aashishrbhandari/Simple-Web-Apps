const express = require('express')
const expressApp = express()
const expressSession = require('express-session');

// Uniqne ID Creator
const { v4: uuidv4 } = require('uuid');

// This is Require to create a File path so that it can be send to the client 
const path = require('path');

const fs = require('fs');

// App Socket
const APP_PORT = 80;
const APP_HOST_IP = '127.0.0.1';

// Express Session [Login Management]
expressApp.use(expressSession({ secret: 'node-express-js-login' }));

// Enable Post Request Sending JSON [Consume JSOn Requests]
expressApp.use(express.json());

// To Make to Vulnerable for CSRF Form Post
expressApp.use(express.urlencoded({
    extended: true
}));

// Set the Static Content Folder [So That all static files like css, js, images can be easily taken without any manual route]
// All the Client Side Data in Placed Inside Dir: public
expressApp.use(express.static('public'))

// Function to Properly Generate the FilePath & Send To Client
function _sendFile(response, filename) {
    console.log(`Sending File Usinng Func:[sendFile()], From Dir:[/public], File:[${filename}]`)
    response.sendFile(filename, { root: path.join(__dirname, '/public') });
}

// Used so that browser does not cache this Response, used for home page
// Problem if this is not used, after logout user can click browser back button and view the home page (He cannot post or add anything, but showing that is a bad practise)
function cacheControl(response) {
    response.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    })
}

function is_empty(json_obj) {
    if (json_obj.constructor === Object && Object.keys(json_obj).length === 0) {
        return true;
    } else {
        return false;
    }
}

function check_if_obj_match_condition(json_object, var_available) {
    for (one_var_available of var_available) {
        if (json_object[one_var_available] === undefined || json_object[one_var_available] === "" || json_object[one_var_available] === " ") {
            return false;
        }
    }
    return true;
}

function sortByProperty(property) {
    return function (a, b) {
        if (a[property] > b[property])
            return 1;
        else if (a[property] < b[property])
            return -1;
        return 0;
    }
}

function get_random(num = 3) {
    return Math.floor((Math.random() * num))
}


/* One Post Data Looks Like This
const post_structure = [
    {
        post_id: "unique_id",
        post_name: "Just Created A Account in Poster",
        post_desc: "Exploring PostTer",
        post_date_time: ""
    }
]
*/


/* UsersList 
Adding -> email_id, phone_no
This Details are for Testing Purpose and are Currently Added in Update REST API and not in Registration Form [To Showcase CSRF based User Details Update]

*/
let users_list = [
    { user_id: uuidv4(), full_name: "Ashish R Bhandari", user_name: "ashish", pass_word: "secret", email_id: "aashish.bhandari@gmail.com", phone_no: "7896752097", cc: "IN" },
    { user_id: uuidv4(), full_name: "Sammy L ri", user_name: "sammy", pass_word: "secret", email_id: "sammylei_09@yahoo.com", phone_no: "9278518787", cc: "IN" },
    { user_id: uuidv4(), full_name: "Ajay D Desai", user_name: "ajay", pass_word: "secret", email_id: "lorem_45@live.com", phone_no: "9821519387", cc: "IN" },
    { user_id: uuidv4(), full_name: "Haryy H Sadu", user_name: "haryy", pass_word: "secret", email_id: "lorem_45@live.com", phone_no: "9821519387", cc: "IN" },
    { user_id: uuidv4(), full_name: "Rohni m mehra", user_name: "rohni", pass_word: "secret", email_id: "lorem_45@live.com", phone_no: "9821519387", cc: "IN" },
    { user_id: uuidv4(), full_name: "Raj R Rao", user_name: "raj", pass_word: "secret", email_id: "lorem_45@live.com", phone_no: "9821519387", cc: "IN" },



];

// Initial PostData
let post_data = {};

function populateDefaultPostData() {

    let postDataFile = 'default_posts.json';
    let rawjsondata = fs.readFileSync(postDataFile);
    let default_posts_data = JSON.parse(rawjsondata);

    for (one_new_post of default_posts_data) {

        let random_user_no = get_random(users_list.length)
        let random_user_name = users_list[random_user_no].user_name;

        if (post_data[random_user_name] == undefined) {
            post_data[random_user_name] = [];
        }

        post_data[random_user_name].push(
            {
                post_id: post_data[random_user_name].length + 1,
                post_name: one_new_post.post_name,
                post_desc: one_new_post.post_desc,
                post_date_time: String(+new Date(+(new Date()) - Math.floor(Math.random() * 10000000000)))
            }
        )
    }

    console.log(`New Post Data Added!!! From: [File: ${postDataFile}] `);
}


populateDefaultPostData();

/**************************** */


/*********** Routes STARTS ************/

// Default
expressApp.get("/", function (request, response) {
    if (request.session.user_json) {
        response.redirect("home");
    } else {
        response.redirect("login");
    }
});


// Dashboard
expressApp.get("/home", function (request, response) {
    if (request.session.user_json) {
        console.log("User Session :", request.session.user_json);
        _sendFile(response, "home.html");
    } else {
        response.redirect("login");
    }
});

// User Info Details
expressApp.get("/user_info", function (request, response) {
    if (request.session.user_json) {
        console.log("User Session :", request.session.user_json);
        _sendFile(response, "user_info.html");
    } else {
        response.redirect("login");
    }
});

// Registration Page
expressApp.get("/register", function (request, response) {
    if (request.session.user_json) {
        response.redirect("home");
    } else {
        _sendFile(response, "register.html");
    }
});

// Login Page
expressApp.get("/login", function (request, response) {
    if (request.session.user_json) {
        response.redirect("home");
    } else {
        _sendFile(response, "login.html");
    }
});

// Authenticate
expressApp.post("/authenticate", function (request, response) {
    if (request.session.user_json) {
        console.log("[User Logged In] Already Logged in User Sending Request [/authenticate], [Manually Done or App Problem], [CHECK-IN] ");
        response.redirect("home");
    } else {
        console.log("[User Not Logged In] POST Request Body Data : ", request.body);
        if (request.body && !is_empty(request.body)) {
            const recv_user_name = request.body.user_name;
            const recv_pass_word = request.body.pass_word;

            if (check_if_obj_match_condition(request.body, ["user_name", "pass_word"])) {

                for (one_user_json of users_list) {
                    console.log("Received Data: ", request.body, ", Processing Data: ", one_user_json)
                    if (recv_user_name === one_user_json.user_name && recv_pass_word === one_user_json.pass_word) {
                        request.session.user_json = JSON.stringify(one_user_json);
                        break;
                    }
                }
                if (request.session.user_json) {
                    response.json({ success: true, info: request.body.user_name });
                } else {
                    response.json({ error: "Error: User or Password Incorrect, Please Check and Relogin" });
                }
            } else {
                response.json({ error: "Error: User or Password Missing, Please Check and Relogin" });
                console.log("Error: User or Password Missing, Please Check and Relogin", request.headers, request.body);
            }
        } else {
            response.json({ error: "Error: Request Data Corrupted, Please Check and Relogin" });
            console.log("Error: Request Data Corrupted, Please Check and Relogin", request.headers, request.body);
        }
    }
});


expressApp.post("/add_user", function (request, response) {
    if (request.session.user_json) {
        console.log("[User Logged In] Already Logged in User Sending Request [/add_user], [Manually Done or App Problem], [CHECK-IN] ");
        response.redirect("home");
    } else {
        console.log("[User Not Logged In] POST Request Body Data : ", request.body);

        if (request.body && !is_empty(request.body)) {

            const recv_full_name = request.body.full_name;
            const recv_user_name = request.body.user_name;
            const recv_pass_word = request.body.pass_word;
            const recv_reentered_pass_word = request.body.reentered_pass_word;

            let user_exists = false;

            if (check_if_obj_match_condition(request.body, ["full_name", "user_name", "pass_word", "reentered_pass_word"])) {

                if (recv_pass_word === recv_reentered_pass_word) {
                    for (one_user_json of users_list) {
                        if (recv_user_name === one_user_json.user_name) {
                            user_exists = true;
                            break;
                        }
                    }
                } else {
                    response.json({ error: "Passwords Do Not Match, Please ReLogin" });
                }

                if (user_exists) {
                    response.json({ error: "Use a Different User Name, Please ReLogin" });
                } else {

                    // Add The User
                    users_list.push({ user_id: uuidv4(), full_name: recv_full_name, user_name: recv_user_name, pass_word: recv_pass_word });

                    // Now Login
                    response.json({ success: true, info: request.body.user_name });
                }
            } else {
                response.json({ error: "Error: full_name, user_name, pass_word, reentered_pass_word is Missing, Please Check and Relogin" });
                console.log("Error: full_name, user_name, pass_word, reentered_pass_word is Missing, Please Check and Relogin", request.headers, request.body);
            }
        } else {
            response.json({ error: "Error: Request Data Corrupted, Please Check and Relogin" });
            console.log("Error: Request Data Corrupted, Please Check and Relogin", request.headers, request.body);
        }
    }
});

/** Get User list */
expressApp.get("/users_list", function (request, response) {
    if (request.session.user_json) {
        const users_name_list = users_list.map(one_user_json => one_user_json.user_name)
        response.json({ users_list: users_name_list });
    } else {
        console.log("[User NOT Logged In] & [Visited: /users_list] Please Login")
        response.redirect("login");
    }
});



expressApp.get("/logout", function (request, response) {
    if (request.session.user_json) {
        request.session.destroy();
        console.log("[User Logged In] Destroyed User Session: SuccessFul")
        response.redirect("login");
    } else {
        console.log("[User NOT Logged In] Please Login")
        response.redirect("login");
    }
});


/*********** Routes ENDS */

/**** Update User Details */

/*** Expected Details: Email, Phone-no */
expressApp.post("/update_user_details", function (request, response) {
    if (request.session.user_json) {

        const curr_user_json = JSON.parse(request.session.user_json);
        let curr_user = curr_user_json.user_name;

        if (request.body && !is_empty(request.body)) {

            /**
            * 
            * let users_list = [
                    { user_id: uuidv4(), full_name: "Ashish R Bhandari", user_name: "ashish", pass_word: "secret", email_id: "aashish.bhandari@gmail.com", phone_no: "7896752097", cc: "IN" },
                    { user_id: uuidv4(), full_name: "Sammy L ri", user_name: "sammy", pass_word: "secret", email_id: "", phone_no: "" },
                    { user_id: uuidv4(), full_name: "Lorem Ipsum", user_name: "lorem", pass_word: "secret", email_id: "", phone_no: "" },
                ];
            * 
            */

            const recv_user_email = request.body.email_id;
            const recv_user_phn = request.body.phone_no;
            const recv_user_phn_cc = request.body.cc;

            if (check_if_obj_match_condition(request.body, ["email_id"]) || check_if_obj_match_condition(request.body, ["phone_no"])) {
                /* ALERT: NO URL Encoding or Sanitization as we created it as Vulnerable App */
                let updated_fields = "";
                for (one_user_json_index in users_list) {
                    one_user_json = users_list[one_user_json_index];
                    if (curr_user === one_user_json.user_name) {
                        console.log("Users List [Before]", users_list[one_user_json_index]);
                        if (recv_user_email) {
                            users_list[one_user_json_index].email_id = recv_user_email;
                            updated_fields = "Email";
                        }
                        if (recv_user_phn) {
                            users_list[one_user_json_index].phone_no = recv_user_phn;
                            updated_fields = updated_fields === "" ? "Phone No." : updated_fields + " & Phone No.";
                            if (recv_user_phn_cc) {
                                users_list[one_user_json_index].cc = recv_user_phn_cc;
                            }
                        }
                        console.log("Users List [After]", users_list[one_user_json_index]);
                        console.log("Users List [After]", users_list);
                        response.json({ success: true, details: `Following details ${updated_fields} were updated` });
                        break;
                    }
                }
            } else {
                console.log(`Improper, Incomplete and Empty Data Received [CHECK-IN]: `, request.headers, request.body);
                response.json({ error: `Improper, Incomplete and Empty Data Received, Please Check & Re Update Fields` });
            }

        }
    } else {
        console.log("[User NOT Logged In] Please Login To Update any User Details")
        response.redirect("login");
    }
});

/**** Update User Details ENDS */

/*****************Post Related */

expressApp.get("/get_all_posts", function (request, response) {
    if (request.session.user_json) {
        console.log("Sending All data", post_data);
        response.send(post_data);
    } else {
        console.log("Please Login")
        response.redirect("login");
    }
});


expressApp.get("/get_all_posts_v2", function (request, response) {

    if (request.session.user_json) {

        let all_posts = []
        for (let one_user_posts in post_data) {
            let user = one_user_posts;
            for (one_posts of post_data[one_user_posts]) {
                all_posts.push({
                    post_id: one_posts.post_id,
                    post_user: user,
                    post_name: one_posts.post_name,
                    post_desc: one_posts.post_desc,
                    post_date_time: one_posts.post_date_time
                })
            }
        }

        all_posts = all_posts.sort(sortByProperty("post_date_time")); //sort according to id
        all_posts = all_posts.slice().reverse(); // doing reverse for date time sort
        console.log("Sent All Post Data To User");
        response.send(all_posts);
    } else {
        console.log("Please Login")
        response.redirect("login");
    }
});


expressApp.get("/get_my_posts", function (request, response) {

    if (request.session.user_json) {
        console.log("[User Logged In] Send User Data: SuccessFul");

        const curr_user_json = JSON.parse(request.session.user_json);
        let my_posts_data = post_data[curr_user_json.user_name];

        if (my_posts_data == undefined) {
            response.send([]);
        } else {
            my_posts_data = my_posts_data.slice().reverse(); // doing reverse for date time sort
            console.log("Sent All My Post To User");
            response.send(my_posts_data);
        }
    } else {
        console.log("[User NOT Logged In] Please Login");
        response.redirect("login");
    }

});

expressApp.get("/current_user", function (request, response) {

    if (request.session.user_json) {
        console.log("[User Logged In] Send User Data: SuccessFul");
        const curr_user_json = JSON.parse(request.session.user_json);
        const curr_user_id = curr_user_json.user_id
        let curr_user_json_details = {};

        for (one_user_json of users_list) {
            if (curr_user_id === one_user_json.user_id) {
                curr_user_json_details = one_user_json;
                break;
            }
        }
        let new_curr_user_json_details = JSON.parse(JSON.stringify(curr_user_json_details));

        delete new_curr_user_json_details.pass_word; // Remove Password
        response.json(new_curr_user_json_details);
    } else {
        console.log("[User NOT Logged In] Please Login");
        response.redirect("login");
    }

});

expressApp.post("/create_post", function (request, response) {

    if (request.session.user_json) {

        console.log("[User Logged In] Send User Data: SuccessFul");

        const curr_user_json = JSON.parse(request.session.user_json);
        curr_user = curr_user_json.user_name;

        if (request.body && !is_empty(request.body)) {

            const recv_post_name = request.body.post_name;
            const recv_post_desc = request.body.post_desc;

            if (check_if_obj_match_condition(request.body, ["post_name", "post_desc"])) {
                /* ALERT: NO URL Encoding or Sanitization as we created it as Vulnerable App */
                if (post_data[curr_user] == undefined) {
                    post_data[curr_user] = [];
                }
                post_data[curr_user].push({
                    post_id: post_data[curr_user].length + 1,
                    post_name: recv_post_name,
                    post_desc: recv_post_desc,
                    post_date_time: String(+new Date())
                });
                console.log(`[ADDED] Post For User: ${curr_user}`);
                response.json({ success: true });
            } else {
                console.log(`[NOT ADDED] Incorrect Data Received [CHECK-IN]: `, request.headers, request.body);
                response.json({ error: `Incorrect Data Received, Please Check & RePost` });
            }

        } else {
            console.log(`Improper, Incomplete and Empty Data Received [CHECK-IN]: `, request.headers, request.body);
            response.json({ error: `Improper, Incomplete and Empty Data Received, Please Check & RePost` });
        }
    } else {
        console.log("[User NOT Logged In] Please Login");
        response.redirect("login");
    }
});

// Delete Post
expressApp.post("/delete_post", function (request, response) {
    if (request.session.user_json) {

        const curr_user_json = JSON.parse(request.session.user_json);
        curr_user = curr_user_json.user_name;

        if (request.body && !is_empty(request.body)) {

            const recv_post_id = parseInt(request.body.post_id);

            if (check_if_obj_match_condition(request.body, ["post_id"])) {
                // NO URL Encoding or Sanitization as we created it as Vulnerable App
                post_data[curr_user] = post_data[curr_user].filter((one_post) => one_post.post_id !== recv_post_id);
                response.json({ success: `🗑️ [DELETED] Post With PostID:[${request.body.post_id}]` });
            } else {
                console.log(`[NOT DELETED] Incorrect Data Received [CHECK-IN]: `, request.headers, request.body);
                response.json({ error: `Incorrect Data Received, Please Check & Re-Delete` });
            }

        } else {
            console.log(`Improper, Incomplete and Empty Data Received [CHECK-IN]: `, request.headers, request.body);
            response.json({ error: `Improper, Incomplete and Empty Data Received, Please Check & Re-Delete` });
        }
    } else {
        console.log("[User NOT Logged In] Please Login");
        response.redirect("login");
    }
});

/* Posts Related [ENDS] */

// Express Starts
expressApp.listen(APP_PORT, APP_HOST_IP, function () {
    console.log(`Post-Ter Web App Running @ [${APP_HOST_IP}:${APP_PORT}]`)
});