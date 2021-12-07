document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("new_post").onsubmit = (e) => create_post(e);

    load_all_posts();
});

function load_all_posts() {
    document.querySelector("#not-found").style.display = "none";

    fetch("/posts")
        .then((response) => {
            if (!response.ok) {
                console.log(response);
                throw new Error();
            }
            return response.json();
        })
        .then((result) => {
            result.forEach((element) => {
                const date = new Date(element.timestamp);
                console.log(date);
                document.getElementById("all_posts_list").insertAdjacentHTML(
                    "beforeend",
                    `<li class="list-group-item"> 
                        <div class="card">
                            <div class="card-body">
                            <h5 class="card-title">${element.post}</h5>
                            <p class="card-text">Posted by: ${
                                element.author
                            }</p>
                            <p class="card-text"><small class="text-muted">${date.toUTCString()}</small></p>
                            <a href="#" class="btn btn-primary">Go somewhere</a>
                            </div>
                        </div>
                    </li>`
                );
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

function error_handler(error) {
    document.querySelector("#not-found").style.display = "block";

    document.getElementById("nf-title").innerHTML = error.title;
    document.getElementById("nf-body").innerHTML = error.body;
}
