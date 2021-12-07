document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("new_post").onsubmit = (e) => create_post(e);

    load_all_posts();
});

function load_all_posts() {
    document.querySelector("#not-found").style.display = "none";

    fetch("/posts")
        .then((response) => {
            console.log("response", response);
            if (!response.ok) {
                throw new Error();
            }
            return response.json();
        })
        .then((result) => {
            result.forEach((element) => {
                const date = new Date(element.timestamp);
                document.getElementById("all_posts_list").insertAdjacentHTML(
                    "beforeend",
                    `<li class="list-group-item"> 
                        <div class="card">
                            <div class="card-body">
                            <h5 class="card-title">${element.post}</h5>
                            <p class="card-text">Posted by: ${
                                element.author.username
                            }</p>
                            <p class="card-text"><small class="text-muted">${date.toUTCString()}</small></p>
                            <button id="follow-${
                                element.author.id
                            }"class="btn btn-primary" data-user_id=${
                        element.author.id
                    }>Follow user</button>
                            </div>
                        </div>
                    </li>`
                );
                document.getElementById(`follow-${element.author.id}`).onclick =
                    (e) => follow(e);
            });

            console.log(result);
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
    console.log(post);

    fetch("post", {
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
                console.log(response);
                return false;
            }
            return response.json();
        })
        .then((result) => console.log("result", result));
}

function follow(e) {
    console.log(e.target.dataset.user_id);
    fetch("follow", {
        method: "POST",
        mode: "same-origin",
        headers: {
            "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]")
                .value,
        },
        body: JSON.stringify({
            user_id: 2,
        }),
    })
        .then((res) => res.json())
        .then((res) => console.log(res));
}

function error_handler(error) {
    document.querySelector("#not-found").style.display = "block";

    document.getElementById("nf-title").innerHTML = error.title;
    document.getElementById("nf-body").innerHTML = error.body;
}
