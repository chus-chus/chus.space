// dynamically update twitter and clipboard urls

document.addEventListener('DOMContentLoaded', function() {
    var twitterBtn = document.querySelector('a[aria-label="Twitter"]');
    if (twitterBtn) {
        var baseUrl = window.location.href.split('#')[0]; // Remove the hash part
        twitterBtn.href = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(baseUrl);
    }
});


function copyToClipboard() { // Removed the url parameter since it's always the current URL being copied
    var baseUrl = window.location.href.split('#')[0]; // Remove the hash part
    // Create a temporary text area to hold the URL
    var tempInput = document.createElement('textarea');
    // Prevent styling from affecting layout
    tempInput.style.position = 'absolute';
    tempInput.style.left = '-9999px';
    tempInput.value = baseUrl; // Use the modified URL
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    // Show the notification
    var notification = document.getElementById('copy-notification');
    notification.style.display = 'block';
    
    // Hide the notification after 2 seconds
    setTimeout(function() {
        notification.style.display = 'none';
    }, 2000);
}


window.copyToClipboard = copyToClipboard;