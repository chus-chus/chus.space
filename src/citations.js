// Citation popover and reference list builder.
// Expects a global `references` array to be defined before this script loads.

document.addEventListener('DOMContentLoaded', function() {
    if (typeof references === 'undefined' || !references.length) return;

    var refList = document.getElementById('reference-list');
    if (!refList) return;

    // Build the numbered reference list at the bottom of the page
    references.forEach(function(ref) {
        var li = document.createElement('li');
        li.id = ref.id;
        li.innerHTML = ref.author + '. (' + ref.year + '). <i>' + ref.title + '</i>. <a href="' + ref.url + '" target="_blank" rel="noopener">link</a>';
        refList.appendChild(li);
    });

    // Build a lookup map
    var refMap = {};
    references.forEach(function(ref) { refMap[ref.id] = ref; });

    // Create a single shared popover element
    var popup = document.createElement('div');
    popup.className = 'cite-popup';
    document.body.appendChild(popup);

    var hideTimeout;

    function showPopup(link, ref) {
        clearTimeout(hideTimeout);
        popup.innerHTML = '<strong>' + ref.author + '</strong> (' + ref.year + ')<br><i>' + ref.title + '</i>';
        popup.classList.add('visible');

        // Position: prefer above the link, fall back to below
        var rect = link.getBoundingClientRect();
        var ph = popup.offsetHeight;
        var pw = popup.offsetWidth;

        var left = rect.left + rect.width / 2 - pw / 2;
        left = Math.max(10, Math.min(left, window.innerWidth - pw - 10));
        popup.style.left = left + 'px';

        if (rect.top > ph + 16) {
            popup.style.top = (rect.top + window.scrollY - ph - 8) + 'px';
        } else {
            popup.style.top = (rect.bottom + window.scrollY + 8) + 'px';
        }
    }

    function scheduleHide() {
        hideTimeout = setTimeout(function() {
            popup.classList.remove('visible');
        }, 120);
    }

    // Keep popup alive when hovering over it
    popup.addEventListener('mouseenter', function() {
        clearTimeout(hideTimeout);
    });

    popup.addEventListener('mouseleave', function() {
        popup.classList.remove('visible');
    });

    // Find all citation links (anchors pointing to a reference id)
    var links = document.querySelectorAll('article a[href^="#"]');

    links.forEach(function(link) {
        var id = link.getAttribute('href').slice(1);
        if (!refMap[id]) return;

        link.classList.add('cite-link');

        link.addEventListener('mouseenter', function() {
            showPopup(link, refMap[id]);
        });

        link.addEventListener('mouseleave', function() {
            scheduleHide();
        });
    });
});
