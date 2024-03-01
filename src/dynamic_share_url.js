// dynamically update twitter and clipboard urls

document.addEventListener('DOMContentLoaded', function() {
    var twitterBtn = document.querySelector('a[aria-label="Twitter"]');
    if (twitterBtn) {
        twitterBtn.href = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(window.location.href);
    }
});

function copyToClipboard(url) {
    // Create a temporary text area to hold the URL
    var tempInput = document.createElement('textarea');
    // Prevent styling from affecting layout
    tempInput.style.position = 'absolute';
    tempInput.style.left = '-9999px';
    tempInput.value = url;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    // Optional: Inform the user the text was copied
    alert('URL copied to clipboard');
}

window.copyToClipboard = copyToClipboard;