window.onload = function() {
    let allThumbs = document.querySelector("#gallery").querySelectorAll(".thumbs");
    for (let i = 0; i < allThumbs.length; i++) {
        allThumbs[i].addEventListener("click", openModal);

    }
    document.querySelector("#modalClose").addEventListener("click", closeModal);
}

function openModal(event) {
    // Implementation for opening modal
    document.querySelector("#modalImage").src = "/gallery/normal/" + event.target.dataset.filename;
    document.querySelector("#modalCaption").innerHTML = event.target.alt;
    document.querySelector("#modal").showModal();
}

function closeModal() {
    // Implementation for closing modal
    document.querySelector("#modal").close();
    document.querySelector("#modalImage").src= "../pics/empty.png";
    document.querySelector("#modalCaption").innerHTML = "Galeriipilt";
}