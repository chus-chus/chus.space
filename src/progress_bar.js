// Sidebar table-of-contents for blog posts.
// Builds a fixed TOC from <section> elements, highlights the active
// section on scroll, and supports click-to-navigate.

document.addEventListener('DOMContentLoaded', function() {
    var sections = document.querySelectorAll('.entry section');
    var container = document.getElementById('progress-container');

    if (!sections.length || !container) return;

    container.innerHTML = '';

    // Build TOC links
    var links = [];
    sections.forEach(function(section) {
        var id = section.getAttribute('id');
        if (!id) return;
        var a = document.createElement('a');
        a.href = '#' + id;
        a.textContent = id;
        container.appendChild(a);
        links.push({ el: a, id: id });
    });

    if (!links.length) return;

    var clickedId = null;

    function setActive(id) {
        links.forEach(function(link) {
            link.el.classList.toggle('active', link.id === id);
        });
    }

    // Click: force-activate until the user scrolls the section out of view
    links.forEach(function(link) {
        link.el.addEventListener('click', function() {
            clickedId = link.id;
            setActive(link.id);
        });
    });

    function update() {
        // If a TOC link was clicked, keep that section active while visible
        if (clickedId) {
            var el = document.getElementById(clickedId);
            if (el) {
                var r = el.getBoundingClientRect();
                if (r.top < window.innerHeight && r.bottom > 0) return;
            }
            clickedId = null;
        }

        // The "reference line": a section becomes active when its heading
        // scrolls above this line. Normally at 25% from the top.
        //
        // Near the bottom of the page, short sections can never reach 25%.
        // So we smoothly shift the reference line downward as the user
        // approaches the bottom, reaching 90% at the very end. This lets
        // every section activate naturally during scrolling.
        var vh = window.innerHeight;
        var scrollBottom = window.scrollY + vh;
        var pageHeight = document.documentElement.scrollHeight;
        var distRatio = Math.min(1, (pageHeight - scrollBottom) / (vh * 0.8));
        var refLine = vh * (0.25 + 0.65 * (1 - distRatio));

        // Active = last section whose heading is above the reference line
        var active = null;
        sections.forEach(function(section) {
            if (section.getBoundingClientRect().top <= refLine) {
                active = section.getAttribute('id');
            }
        });
        if (active) setActive(active);
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
});
