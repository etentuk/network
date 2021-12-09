window.onpopstate = function (event) {
    routes[event.state?.page?.split("#")[1] || "all_posts"]();
};

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("new_post").onsubmit = (e) => create_post(e);
    document.getElementById("follow_button").onclick = (e) => follow(e);

    document.querySelector("#nav").addEventListener("click", (e) => {
        if (!e.target.id) return;
        history.pushState({ page: `#${e.target.id}` }, "", `#${e.target.id}`);
        routes[e.target.id]();
    });

    (() => {
        routes[window.location.hash.split("#")[1] || "all_posts"]();
    })();
});

const routes = {
    all_posts: () => load_all_posts(),
    logged_in_user: () => load_all_posts(),
    posts_following: () => followed_posts(),
    profile_page: () => profile_page(e),
};

const pageUpdater = (updater) => {
    routes[updater];
};

const pagination_numbers = {
    all_posts: 1,
    profile: 1,
    followed: 1,
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

function load_all_posts(page_num) {
    document.querySelector("#not-found").style.display = "none";
    document.querySelector("#profile_page").style.display = "none";
    document.querySelector("#following_posts_page").style.display = "none";
    document.querySelector("#all_posts_page").style.display = "block";
    document.getElementById("all_posts_list").innerHTML = "";
    document.querySelector("#all_posts_pagination").innerHTML = "";
    page_num = page_num ? page_num : 1;
    pagination_numbers.all_posts = parseInt(page_num);
    fetch(`/posts/${page_num}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error();
            }
            return response.json();
        })
        .then((result) => {
            result.posts.forEach((element) => {
                const date = new Date(element.timestamp);
                document
                    .querySelector("#all_posts_list")
                    .append(
                        singlePost(
                            element.post,
                            element.author.username,
                            date.toUTCString(),
                            element.author.id
                        )
                    );
            });

            document.querySelector("#all_posts_pagination").insertAdjacentHTML(
                "beforeend",
                `           <li class="page-item ${
                    pagination_numbers.all_posts === 1 ? "disabled" : ""
                }"><div class="btn page-link all_pagination">Previous</div></li>
                    `
            );
            document.querySelector("#all_posts_pagination").insertAdjacentHTML(
                "beforeend",
                `           <li class="page-item ${
                    pagination_numbers.all_posts >= result.page_count
                        ? "disabled"
                        : ""
                }"><div class="btn page-link all_pagination">Next</div></li>
                            `
            );

            document.querySelectorAll(".all_pagination").forEach((element) => {
                element.onclick = (e) => {
                    const num = e.target.innerHTML;
                    if (
                        !num &&
                        (num === "..." ||
                            (num === "Previous" &&
                                pagination_numbers.all_posts <= 1) ||
                            (num === "Next" &&
                                pagination_numbers.all_posts >=
                                    result.page_count))
                    )
                        return;
                    if (num === "Next") {
                        load_all_posts(pagination_numbers.all_posts + 1);
                        return;
                    } else if (num === "Previous") {
                        load_all_posts(pagination_numbers.all_posts - 1);
                        return;
                    } else if (typeof num !== number) return;
                    load_all_posts(num);
                };
            });

            document.querySelectorAll(".to_profile").forEach((element) => {
                element.onclick = (e) => {
                    profile_page(e);
                };
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
            document.getElementById("all_posts_list").prepend(new_post);
        })
        .catch((e) => {
            console.log(e);
            error_handler({
                title: "Oops an Error Occurred!",
                body: "Please try again!",
            });
        });
}

function profile_page(e, page_num) {
    document.querySelector("#not-found").style.display = "none";
    document.querySelector("#all_posts_page").style.display = "none";
    document.querySelector("#profile_page").style.display = "none";
    document.querySelector("#following_posts_page").style.display = "none";
    document.querySelectorAll(".to_profile").forEach((element) => {
        element.removeEventListener("click", (e) => profile_page(e));
    });
    document.getElementById("profile_posts_list").innerHTML = "";
    document.querySelector("#profile_posts_pagination").innerHTML = "";

    page_num = page_num ? page_num : 1;
    pagination_numbers.profile = parseInt(page_num);

    fetch(`/${e.target.innerHTML}/${page_num}`)
        .then((response) => {
            if (!response.ok) throw new Error();
            return response.json();
        })
        .then((result) => {
            document.querySelector("#username").innerText =
                result.user.username;
            document.querySelector("#following").innerHTML =
                "Following: " + String(result.user.following);
            document.querySelector("#followers").innerHTML =
                "Followers: " + String(result.user.followers);
            document.getElementById("follow_button").innerText =
                result.following ? "Unfollow" : "Follow";
            if (
                document.getElementById("logged_in_user") &&
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

            document
                .querySelector("#profile_posts_pagination")
                .insertAdjacentHTML(
                    "beforeend",
                    `           <li class="page-item ${
                        pagination_numbers.profile === 1 ? "disabled" : ""
                    }"><div class="btn page-link profile_pagination">Previous</div></li>
                    `
                );
            document
                .querySelector("#profile_posts_pagination")
                .insertAdjacentHTML(
                    "beforeend",
                    `           <li class="page-item ${
                        pagination_numbers.profile >= result.page_count
                            ? "disabled"
                            : ""
                    }"><div class="btn page-link profile_pagination">Next</div></li>
                            `
                );

            document
                .querySelectorAll(".profile_pagination")
                .forEach((element) => {
                    element.onclick = (e) => {
                        const num = e.target.innerHTML;
                        if (
                            !num &&
                            (num === "..." ||
                                (num === "Previous" &&
                                    pagination_numbers.profile <= 1) ||
                                (num === "Next" &&
                                    pagination_numbers.profile >=
                                        result.page_count))
                        )
                            return;
                        if (num === "Next") {
                            profile_page(e, pagination_numbers.profile + 1);
                            return;
                        } else if (num === "Previous") {
                            profile(e, pagination_numbers.profile - 1);
                            return;
                        } else if (typeof num !== number) return;
                        profile(e, num);
                    };
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
    fetch(`follow/${username}`, {
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

function followed_posts(page_num) {
    document.querySelector("#profile_page").style.display = "none";
    document.querySelector("#all_posts_page").style.display = "none";
    document.querySelector("#not-found").style.display = "none";
    document.querySelector("#following_posts_page").style.display = "block";
    document.getElementById("following_posts_list").innerHTML = "";
    document.querySelector("#followed_posts_pagination").innerHTML = "";

    page_num = page_num ? page_num : 1;
    pagination_numbers.followed = parseInt(page_num);

    fetch(`posts/following/${page_num}`)
        .then((res) => {
            if (!res.ok) throw new Error();
            return res.json();
        })
        .then((result) => {
            result.posts.forEach((element) => {
                const date = new Date(element.timestamp);
                document
                    .getElementById("following_posts_list")
                    .append(
                        singlePost(
                            element.post,
                            element.author.username,
                            date.toUTCString(),
                            element.author.id
                        )
                    );
            });

            document
                .querySelector("#followed_posts_pagination")
                .insertAdjacentHTML(
                    "beforeend",
                    `           <li class="page-item ${
                        pagination_numbers.followed === 1 ? "disabled" : ""
                    }"><div class="btn page-link followed_pagination">Previous</div></li>
                    `
                );
            document
                .querySelector("#followed_posts_pagination")
                .insertAdjacentHTML(
                    "beforeend",
                    `           <li class="page-item ${
                        pagination_numbers.followed >= result.page_count
                            ? "disabled"
                            : ""
                    }"><div class="btn page-link followed_pagination">Next</div></li>
                            `
                );

            document
                .querySelectorAll(".followed_pagination")
                .forEach((element) => {
                    element.onclick = (e) => {
                        const num = e.target.innerHTML;
                        if (
                            !num &&
                            (num === "..." ||
                                (num === "Previous" &&
                                    pagination_numbers.followed <= 1) ||
                                (num === "Next" &&
                                    pagination_numbers.followed >=
                                        result.page_count))
                        )
                            return;
                        if (num === "Next") {
                            followed_posts(pagination_numbers.followed + 1);
                            return;
                        } else if (num === "Previous") {
                            followed_posts(pagination_numbers.followed - 1);
                            return;
                        } else if (typeof num !== number) return;
                        followed_posts(num);
                    };
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

function error_handler(error) {
    document.querySelector("#profile_page").style.display = "none";
    document.querySelector("#all_posts_page").style.display = "none";
    document.querySelector("#following_posts_page").style.display = "none";
    document.querySelector("#not-found").style.display = "block";

    document.getElementById("nf-title").innerHTML = error.title;
    document.getElementById("nf-body").innerHTML = error.body;
}
