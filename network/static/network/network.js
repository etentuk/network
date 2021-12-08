document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("new_post").onsubmit = (e) => create_post(e);
    document.getElementById("follow_button").onclick = (e) => follow(e);

    document.querySelector("#nav").addEventListener("click", (e) => {
        console.log(e.target.id);
        if (!e.target.id) return;
        history.pushState({ page: `#${e.target.id}` }, "", `#${e.target.id}`);
        routes[e.target.id];
    });

    load_all_posts();
});

const routes = {
    all_posts: () => load_all_posts(),
    profile_page_nav: () => profile_page(),
};

const pageUpdater = (updater) => {
    routes[updater];
};

function singlePost(post, username, date, user_id) {
    const list = document.createElement("li");
    list.className = "list-group-item";
    list.insertAdjacentHTML(
        "beforeend",
        `<div class="card">
            <div class="card-body">
                <h5 class="card-title">${post}</h5>
                <div class="card-text to_profile" >${username}</div>
                <p class="card-text"><small class="text-muted">${date}</small></p>
            </div>
        </div>`
    );

    return list;
}

function load_all_posts() {
    document.querySelector("#not-found").style.display = "none";
    document.querySelector("#profile_page").style.display = "none";

    fetch("/posts")
        .then((response) => {
            if (!response.ok) {
                throw new Error();
            }
            return response.json();
        })
        .then((result) => {
            result.forEach((element) => {
                const date = new Date(element.timestamp);
                document
                    .getElementById("all_posts_list")
                    .append(
                        singlePost(
                            element.post,
                            element.author.username,
                            date.toUTCString(),
                            element.author.id
                        )
                    );
            });
            document.querySelectorAll(".to_profile").forEach((element) => {
                element.onclick = (e) => profile_page(e);
            });
        })
        .catch((e) => {
            console.log(e);
            error_handler({
                title: "Oops an Error Occurred!",
                body: "Please try again!",
            });
        });
}

function create_post(e) {
    e.preventDefault();
    const post = document.getElementById("post").value;

    fetch("create_post", {
        method: "POST",
        mode: "same-origin",
        headers: {
            "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]")
                .value,
        },
        body: JSON.stringify({
            post,
        }),
    })
        .then((response) => {
            if (!response.ok) {
                return response;
            }
            return response.json();
        })
        .then((result) => {
            const date = new Date(result.timestamp);
            const new_post = singlePost(
                result.post,
                result.author.username,
                date.toUTCString(),
                result.author.id
            );
            console.log(new_post);
            document.getElementById("all_posts_list").prepend(new_post);

            console.log("result", result);
        })
        .catch((e) => {
            console.log(e);
            error_handler({
                title: "Oops an Error Occurred!",
                body: "Please try again!",
            });
        });
}

function profile_page(e) {
    document.querySelector("#not-found").style.display = "none";
    document.querySelector("#all_posts_page").style.display = "none";
    document.querySelector("#profile_page").style.display = "none";

    fetch(`/${e.target.innerHTML}`)
        .then((response) => {
            if (!response.ok) throw new Error();
            return response.json();
        })
        .then((result) => {
            console.log("result", result);
            document.querySelector("#username").innerText =
                result.user.username;
            document
                .querySelector("#following")
                .insertAdjacentHTML("beforeend", String(result.user.following));
            document
                .querySelector("#followers")
                .insertAdjacentHTML("beforeend", String(result.user.followers));
            document.getElementById("follow_button").innerText =
                result.following ? "Unfollow" : "Follow";
            if (
                result.user.username ===
                document.getElementById("logged_in_user").innerText
            ) {
                document.getElementById("follow_button").style.display = "none";
            }
            result.posts.forEach((post) => {
                const date = new Date(post.timestamp);
                document
                    .getElementById("profile_posts_list")
                    .append(
                        singlePost(
                            post.post,
                            post.author.username,
                            date.toUTCString(),
                            post.author.id
                        )
                    );
            });
        })
        .catch((e) => {
            console.log(e);
            error_handler({
                title: "Oops an Error Occurred!",
                body: "Please try again!",
            });
        });
    document.querySelector("#profile_page").style.display = "block";
}

function follow(e) {
    username = document.getElementById("username").innerText;
    following =
        document.getElementById("follow_button").innerText === "Unfollow";
    console.log("username", username);
    fetch(`${username}`, {
        method: "PUT",
        mode: "same-origin",
        headers: {
            "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]")
                .value,
        },
        body: JSON.stringify({
            following,
            user_id: e.target.id.split("-")[1],
        }),
    })
        .then((response) => {
            if (!response.ok) throw new Error();
            return response.json();
        })
        .then((result) => {
            alert(result.message);
            document.getElementById("follow_button").innerText = following
                ? "Follow"
                : "Unfollow";
        })
        .catch((e) => {
            console.log(e);
            error_handler({
                title: "Oops an Error Occurred!",
                body: "Please try again!",
            });
        });
}

function error_handler(error) {
    document.querySelector("#profile_page").style.display = "none";
    document.querySelector("#all_posts_page").style.display = "none";
    document.querySelector("#not-found").style.display = "block";

    document.getElementById("nf-title").innerHTML = error.title;
    document.getElementById("nf-body").innerHTML = error.body;
}
