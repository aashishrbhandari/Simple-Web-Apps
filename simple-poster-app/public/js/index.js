/**
	{
		post_id: "unique_id",
		post_name: "Just Created A Account in Poster",
		post_desc: "Exploring PostTer",
		post_date_time: ""
	}
*/

function showMsg(msgType, msg, alert_bg = "light") {
	let alert_content = `
		<div class="alert alert-${alert_bg} text-${msgType} shadow-sm" role="alert">
            <strong>${msg}</strong>
            <button type="button" class="btn-close btn-close-${msgType} hide-alert" aria-label="Close"></button>
        </div>
	`;
	document.querySelector(".alert-content").innerHTML = alert_content;

	setTimeout(() => {
		console.log(document.querySelector(".alert-content .btn-close").parentElement);
		document.querySelector(".alert-content .btn-close").parentElement.style.opacity = 0;
	}, 2000);


	setTimeout(() => {
		document.querySelector(".btn-close").parentElement.remove();
	}, 2400);
}

function create_post(post_data) {

	let post = `
		<div class="card all_post_card shadow-sm" post_id=${post_data.post_id}>
			<div class="card-header">
				<h4 class="card-title">${post_data.post_name}</h4>
			</div>
			<div class="card-body pb-0">
				<h5 style="white-space: pre-wrap">${post_data.post_desc}</h5>
			</div>
			<ul class="list-group list-group-flush">
				<li class="list-group-item">
					<div class="profile-img">
						<img class="w-100" src="/images/svgs/user.png" alt="" style="
							border: 4px solid #ccc;
							border-radius: 50%;
						">
					</div>
					<div class="user-info">
						<h6 class="user_id_name">${post_data.post_user}(@${post_data.post_user})</h6>
						<b class="">${new Date(parseInt(post_data.post_date_time)).toLocaleString()}</b>
					</div>
				</li>
			</ul>
			
		</div>
	`;

	/***
	 * 
	 * <div class="card-footer" style="
				display: flex;
				align-items: center;
				justify-content: space-around;
			">
				<div>Like</div>
				<div>Comment</div>
				<div>Share</div>
			</div>
	 */

	return post;
}


function create_my_post(post_data) {

	let post = `
		<div class="card my_post_card shadow-sm" post_id=${post_data.post_id}>
			<div class="card-header">
				<h4 class="card-title">${post_data.post_name}</h4>
			</div>
			<div class="card-body pb-0">
				<h5 style="white-space: pre-wrap">${post_data.post_desc}</h5>
			</div>
			<ul class="list-group list-group-flush">
				<li class="list-group-item">
					<div class="profile-img">
						<img class="w-100" src="/images/svgs/user.png" alt="" style="
							border: 4px solid #ccc;
							border-radius: 50%;
						">
					</div>
					<div class="user-info">
						<h6 class="user_id_name">Me</h6>
						<b class="">${new Date(parseInt(post_data.post_date_time)).toLocaleString()}</b>
					</div>
				</li>
			</ul>
			<div class="card-footer">
				<a href="#" class="btn btn-sm btn-danger delete-this-post" style="font-weight: 700">REMOVE</a>
			</div>
		</div>
	`;

	return post;
}

function customEventListeners() {

	let delete_this_post_list = document.querySelectorAll(".delete-this-post");

	delete_this_post_list.forEach((one_delete_this_post) => {
		one_delete_this_post.onclick = (event) => {
			let my_post_card = event.target.closest(".my_post_card");
			let my_post_id = my_post_card.getAttribute("post_id");
			console.log({ my_post_card, my_post_id });
			fetchFromServer('/delete_post', "POST", { "post_id": my_post_id })
				.then(data => {
					console.log(data); // JSON data parsed by `data.json()` call
					if (data.success) {
						let to_delete_element = document.querySelector(`div.my_post_card[post_id="${my_post_id}"]`);
						console.log(to_delete_element); // JSON data parsed by `data.json()` call
						to_delete_element.style.opacity = 0;
						setTimeout(() => {
							to_delete_element.remove();
						}, 600);
						showMsg("danger", `<strong>Post Deleted</strong> ID(${to_delete_element.getAttribute("post_id")})`);
					} else {
						showMsg("danger", `<strong>Something Went Wrong, Post Is Invalid, Please Check</strong> ID(${to_delete_element.getAttribute("post_id")})`);
					}
				});
		}
	})

	let create_this_post = document.querySelector(".create-this-post");

	create_this_post.onclick = (event) => {

		let new_post_name = document.querySelector(".input_post_name").value;
		let new_post_desc = document.querySelector(".input_post_desc").value;

		if (new_post_name === "" || new_post_desc === "") {
			//our-modal-component
			showMsg("danger", `<h4> Post is Empty </h4>`);
		} else {
			fetchFromServer('/create_post', "POST", { "post_name": new_post_name, "post_desc": new_post_desc })
				.then(data => {
					console.log(data); // JSON data parsed by `data.json()` call
					if (data.success) {
						console.log("Post Created");
						showMsg("success", `<strong>New!!!</strong> Post Created`);
						// Empty it Up
						document.querySelector(".input_post_name").value = "";
						document.querySelector(".input_post_desc").value = "";

					} else {
						showMsg("danger", `<strong>Something Went Wrong, Post is invalid, Please Check!!!</strong> Post NOT!!! Created`);
						alert();
					}
				});
		}
	}

	let clear_these_fields = document.querySelector(".clear-these-fields");

	clear_these_fields.onclick = () => {
		// Empty it Up
		document.querySelector(".input_post_name").value = "";
		document.querySelector(".input_post_desc").value = "";
	};

}

function populate_all_posts(all_posts_data_json, clean_first = true, add_events = true) {
	let all_posts_container = document.querySelector(".all-posts-container");
	console.log("Populate All Post With Data As ", all_posts_data_json);

	if (clean_first) {
		all_posts_container.innerHTML = ""; //EMPTY
	}

	for (let one_posts_data_json of all_posts_data_json) {
		all_posts_container.innerHTML += create_post(one_posts_data_json);
	}

	if (add_events) {
		customEventListeners();
	}
}

function populate_my_posts(my_posts_data_json) {
	let my_posts_container = document.querySelector(".my-posts-container");
	console.log("Populate My Post With Data As ", my_posts_data_json);

	my_posts_container.innerHTML = ""; //EMPTY

	for (let one_posts_data_json of my_posts_data_json) {
		my_posts_container.innerHTML += create_my_post(one_posts_data_json);
	}
	if (my_posts_data_json.length === 0) {
		my_posts_container.innerHTML = `
		<div class="card">
			<div class="card-body">
				<div class="p-3 bg-warning bg-gradient text-dark h4" style="border-radius: 8px;">No Post Added By U, Click on Create Post to add one</div>
			</div>
		</div>`;
	}
	customEventListeners();
}

// Example POST method implementation:
async function fetchFromServer(url = '', http_method, data) {
	const response = await fetch(url, {
		method: http_method,
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	});
	return response.json();
}

function main() {
	let all_posts_container = document.querySelector(".all-posts-container");

	if (all_posts_container == null || all_posts_container == undefined) {
		console.log(`Error No Element as [.all-posts-container], Not Processing: `, all_posts_container)
	} else {
		console.log("Fetch data From Server: /get_all_posts_v2")
		fetchFromServer('/get_all_posts_v2', "GET")
			.then(data => {
				console.log("Fetched Data For [/get_all_posts_v2]", data); // JSON data parsed by `data.json()` call
				let all_posts = data;
				populate_all_posts(all_posts);
			});
		fill_users_list();
	}

}

function fill_users_list() {
	let all_users_list = document.querySelector(".all-user-list");
	fetchFromServer('/users_list', "GET")
		.then(data => {
			console.log("Fetched Data For [/users_list]", data); // JSON data parsed by `data.json()` call
			let all_users_list_data = data.users_list;
			all_users_list.innerHTML = "";
			all_users_list_data.forEach(one_user => {
				all_users_list.innerHTML += `
				<li class="list-group-item user_post_filter" style="gap: 6px;">
					<img width="26" height="26" src="/images/svgs/user.png" alt="" style="border: 1px solid #ccc; border-radius: 50%;">
					<span>@${one_user}</span>
				</li>`;
			})
			user_post_filter_func();
		});

}


function user_post_filter_func() {
	let user_post_filter = document.querySelectorAll(".user_post_filter");
	console.log(user_post_filter);

	user_post_filter.forEach((one_user_post_filter) => {

		one_user_post_filter.addEventListener("click", function (event) {

			let curr_user_name = this.textContent.split("@")[1].trim();
			console.log("Data: Filter: ", curr_user_name);

			fetchFromServer('/get_all_posts_v2', "GET")
				.then(data => {
					console.log("Fetched Data For [/get_all_posts_v2]", data); // JSON data parsed by `data.json()` call
					let all_posts = data;
					filtered_post = all_posts.filter(function (one_post) {
						return one_post.post_user === curr_user_name;
					})
					console.log(filtered_post);
					populate_all_posts(filtered_post);
					showMsg("primary", `Filtered Posts By User: <strong>${curr_user_name}!!!</strong>`);
				});

		})
	});
}

document.querySelector("#list-my-posts-list").addEventListener("click", function () {
	fetchFromServer('/get_my_posts', "GET")
		.then(data => {
			console.log("Fetched Data For [/get_all_posts_v2]", data); // JSON data parsed by `data.json()` call
			let my_posts = data;
			populate_my_posts(my_posts);
		});
})

document.querySelector("#list-home-list").addEventListener("click", function () {
	fetchFromServer('/get_all_posts_v2', "GET")
		.then(data => {
			console.log("Fetched Data For [/get_all_posts_v2]", data); // JSON data parsed by `data.json()` call
			let all_posts = data;
			populate_all_posts(all_posts);
		});
})

document.querySelector("#create-post-nav").addEventListener("click", function () {
	document.querySelector(`a[aria-controls="messages"]`).click();
})

main();