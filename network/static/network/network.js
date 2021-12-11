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

function singlePost(post, username, date, post_id, page, liked, likes) {
    const list = document.createElement("li");
    list.className = "list-group-item";
    list.insertAdjacentHTML(
        "beforeend",
        `<div class="card">
            <div class="card-body">
                <div id=${page}-id-${post_id}>
                <h5 class="card-title">${post}</h5>
                <p class="card-text">Likes: ${likes}</p>

                </div>
                <div class="card-text to_profile" >${username}</div>

                <p class="card-text"><small class="text-muted">${date}</small></p>
                
                ${
                    document.getElementById("logged_in_user") &&
                    username ===
                        document.getElementById("logged_in_user").innerText
                        ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16" data-id=${page}-id-${post_id}>
                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
              </svg>`
                        : ""
                }
                ${
                    document.getElementById("logged_in_user")
                        ? liked
                            ? `<button class='btn btn-primary like' data-id=${post_id} data-target=${page}-id-${post_id}>Unlike</button>`
                            : `<button class='btn btn-primary like' data-id=${post_id} data-target=${page}-id-${post_id}>Like</button>`
                        : ""
                }
            
            </div>
        </div>`
    );

    return list;
}

const edit_post = (e) => {
    if (e.target.nodeName !== "svg") return;
    const head = document.querySelector(`#${e.target.dataset.id}`);

    e.target.style.display = "none";
    head.querySelector("h5").style.display = "none";

    const edit_field = document.createElement("textarea");

    edit_field.className = "form-control";
    edit_field.value = head.querySelector("h5").innerText;

    const submit = document.createElement("button");
    submit.innerHTML = "Save Post";
    submit.className = "btn btn-primary";

    head.insertAdjacentElement("beforeend", edit_field);
    head.insertAdjacentElement("beforeend", submit);

    submit.onclick = () => {
        fetch("edit_post", {
            method: "PUT",
            mode: "same-origin",
            headers: {
                "X-CSRFToken": document.querySelector(
                    "[name=csrfmiddlewaretoken]"
                ).value,
            },
            body: JSON.stringify({
                post_id: e.target.dataset.id.split("-")[2],
                post: edit_field.value,
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    return response;
                }
                return response.json();
            })
            .then((result) => {
                head.innerHTML = "";
                const h5 = document.createElement("h5");
                h5.className = "card-title";
                h5.innerText = result.post;
                head.insertAdjacentElement("beforeend", h5);
                e.target.style.display = "inline-block";
            })
            .catch((e) => {
                console.log(e);
                error_handler({
                    title: "Oops an Error Occurred!",
                    body: "Please try again!",
                });
            });
    };
};

const like_unlike_post = (e) => {
    liked = e.target.innerText === "Unlike";
    console.log(e);
    fetch("like", {
        method: "PUT",
        mode: "same-origin",
        headers: {
            "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]")
                .value,
        },
        body: JSON.stringify({
            liked,
            post_id: e.target.dataset.id,
        }),
    })
        .then((response) => {
            if (!response.ok) throw new Error();
            return response.json();
        })
        .then((result) => {
            document.querySelector(
                `#${e.target.dataset.target} p`
            ).innerText = `Likes: ${result.post_likes}`;
            e.target.innerText = liked ? "Like" : "Unlike";
        });
};

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
                let liked = undefined;
                if (document.getElementById("logged_in_user")) {
                    liked = result.liked_posts.find(
                        (post) => element.id === post.id
                    );
                }
                document
                    .querySelector("#all_posts_list")
                    .append(
                        singlePost(
                            element.post,
                            element.author.username,
                            date.toUTCString(),
                            element.id,
                            "all_posts",
                            !!liked,
                            element.likes
                        )
                    );
            });

            document.querySelectorAll(".bi-pencil").forEach((pencil) => {
                pencil.onclick = (e) => edit_post(e);
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

            document.querySelectorAll(".like").forEach((el) => {
                el.onclick = (e) => like_unlike_post(e);
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
                throw new Error();
            }
            return response.json();
        })
        .then((result) => {
            const date = new Date(result.timestamp);
            const new_post = singlePost(
                result.post,
                result.author.username,
                date.toUTCString(),
                result.id,
                "create_post",
                0
            );
            new_post.querySelector(".bi-pencil").onclick = (e) => edit_post(e);
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
    document.querySelectorAll(".bi-pencil").forEach((pencil) => {
        pencil.removeEventListener("click", (e) => edit_post(e));
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

            console.log(document.querySelector("#logged_in_user"), "user");
            if (document.getElementById("logged_in_user")) {
                document.getElementById("follow_button").style.display =
                    "inline-block";
                document.getElementById("follow_button").innerText =
                    result.following ? "Unfollow" : "Follow";
            } else {
                document.getElementById("follow_button").style.display = "none";
            }

            if (
                document.getElementById("logged_in_user") &&
                result.user.username ===
                    document.getElementById("logged_in_user").innerText
            ) {
                document.getElementById("follow_button").style.display = "none";
            }

            result.posts.forEach((post) => {
                const date = new Date(post.timestamp);
                let liked = undefined;
                if (document.getElementById("logged_in_user")) {
                    liked = result.liked_posts.find((p) => p.id === post.id);
                }
                document
                    .getElementById("profile_posts_list")
                    .append(
                        singlePost(
                            post.post,
                            post.author.username,
                            date.toUTCString(),
                            post.id,
                            "profile_page",
                            liked,
                            post.likes
                        )
                    );
            });

            document.querySelectorAll(".bi-pencil").forEach((pencil) => {
                pencil.onclick = (e) => edit_post(e);
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

            document.querySelectorAll(".like").forEach((el) => {
                el.onclick = (e) => like_unlike_post(e);
            });

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
                let liked = undefined;
                if (document.getElementById("logged_in_user")) {
                    liked = result.liked_posts.find(
                        (post) => element.id === post.id
                    );
                }
                document
                    .getElementById("following_posts_list")
                    .append(
                        singlePost(
                            element.post,
                            element.author.username,
                            date.toUTCString(),
                            element.id,
                            "followed",
                            liked,
                            element.likes
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

            document.querySelectorAll(".like").forEach((el) => {
                el.onclick = (e) => like_unlike_post(e);
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
