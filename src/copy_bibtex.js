function copyBibtex() {
    var bibtexEl = document.getElementById("bibtex-text");
    if (!bibtexEl) return;
    var bibtexText = bibtexEl.innerText;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(bibtexText).then(showBibtexNotification);
    } else {
        // Fallback for older browsers
        var tempTextArea = document.createElement("textarea");
        tempTextArea.value = bibtexText;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand("copy");
        document.body.removeChild(tempTextArea);
        showBibtexNotification();
    }
}

function showBibtexNotification() {
    var notification = document.getElementById('copy-notification');
    if (!notification) return;
    notification.style.display = 'block';
    setTimeout(function() {
        notification.style.display = 'none';
    }, 2000);
}
