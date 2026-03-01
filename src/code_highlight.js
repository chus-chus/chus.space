document.addEventListener("DOMContentLoaded", function () {
    if (!window.hljs || typeof window.hljs.highlightElement !== "function") {
        return;
    }

    var blocks = document.querySelectorAll(".content-container.entry pre code");
    blocks.forEach(function (block) {
        window.hljs.highlightElement(block);
    });
});
