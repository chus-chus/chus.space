function copyBibtex() {
    const bibtexText = document.getElementById("bibtex-text").innerText;

    // Create a temporary text area to copy the text
    const tempTextArea = document.createElement("textarea");
    tempTextArea.value = bibtexText;
    document.body.appendChild(tempTextArea);

    // Select and copy the text
    tempTextArea.select();
    document.execCommand("copy");

    // Remove the temporary text area
    document.body.removeChild(tempTextArea);

    // Show notification
    var notification = document.getElementById('copy-notification');
    notification.style.display = 'block';
    
    // Hide notification after 2s
    setTimeout(function() {
        notification.style.display = 'none';
    }, 2000);
}
