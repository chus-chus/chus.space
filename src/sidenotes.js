// Sidenotes: margin notes that appear beside the text on wide screens.
//
// Usage: place <span class="sidenote">Your note text.</span> inline in a
// paragraph at the point where you want the reference number to appear.
// This script auto-numbers them and inserts superscript markers.

document.addEventListener('DOMContentLoaded', function() {
    var sidenotes = document.querySelectorAll('.sidenote');
    if (!sidenotes.length) return;

    sidenotes.forEach(function(note, i) {
        var num = i + 1;

        // Insert a superscript number in the body text before the sidenote span
        var sup = document.createElement('sup');
        sup.className = 'sidenote-number';
        sup.textContent = num;
        note.parentNode.insertBefore(sup, note);

        // Prepend the same number inside the sidenote itself
        var inner = document.createElement('sup');
        inner.className = 'sidenote-number';
        inner.textContent = num;
        var space = document.createTextNode(' ');
        note.insertBefore(space, note.firstChild);
        note.insertBefore(inner, note.firstChild);
    });
});
