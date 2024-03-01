// dynamically update twitter and clipboard urls

document.addEventListener('DOMContentLoaded', function() {
    var twitterBtn = document.querySelector('a[aria-label="Twitter"]');
    if (twitterBtn) {
        var baseUrl = window.location.href.split('#')[0]; // Remove hash
        twitterBtn.href = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(baseUrl);
    }
});


function copyToClipboard() {
    var baseUrl = window.location.href.split('#')[0]; // Remove hash
    // temporary text area to hold the URL
    var tempInput = document.createElement('textarea');
    // Prevent styling from affecting layout
    tempInput.style.position = 'absolute';
    tempInput.style.left = '-9999px';
    tempInput.value = baseUrl;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    // Show notification
    var notification = document.getElementById('copy-notification');
    notification.style.display = 'block';
    
    // Hide notification after 2s
    setTimeout(function() {
        notification.style.display = 'none';
    }, 2000);
}


window.copyToClipboard = copyToClipboard;