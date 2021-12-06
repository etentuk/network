document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("new_post").onsubmit = (e) => create_post(e);
});

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
