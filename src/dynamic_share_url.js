// dynamically update social share and clipboard urls

document.addEventListener('DOMContentLoaded', function() {
    var xBtn = document.querySelector('a[data-share="x"]');
    if (xBtn) {
        var baseUrl = window.location.href.split('#')[0]; // Remove hash
        xBtn.href = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(baseUrl);
    }
});

function copyToClipboard() {
    var baseUrl = window.location.href.split('#')[0]; // Remove hash

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(baseUrl).then(showCopyNotification);
    } else {
        // Fallback for older browsers
        var tempInput = document.createElement('textarea');
        tempInput.style.position = 'absolute';
        tempInput.style.left = '-9999px';
        tempInput.value = baseUrl;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        showCopyNotification();
    }
}

function showCopyNotification() {
    var notification = document.getElementById('copy-notification');
    if (!notification) return;
    notification.style.display = 'block';
    setTimeout(function() {
        notification.style.display = 'none';
    }, 2000);
}

window.copyToClipboard = copyToClipboard;
