// Sidebar table-of-contents for blog posts.
// Builds a fixed TOC from <section> elements, highlights the active
// section on scroll, and supports click-to-navigate.

document.addEventListener('DOMContentLoaded', function() {
    var sections = document.querySelectorAll('.entry section');
    var container = document.getElementById('progress-container');

    if (!sections.length || !container) return;

    var defaultIncludeSubsections = container.getAttribute('data-toc-subsections') === 'true';
    var usedIds = new Set();
    document.querySelectorAll('[id]').forEach(function(el) {
        usedIds.add(el.id);
    });

    function normalizeTocText(text) {
        return (text || '').replace(/\s+/g, ' ').trim();
    }

    function slugify(text) {
        return normalizeTocText(text)
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    function ensureId(el, fallbackText) {
        var existing = el.getAttribute('id');
        if (existing) {
            usedIds.add(existing);
            return existing;
        }

        var base = slugify(fallbackText || '') || 'section';
        var candidate = base;
        var counter = 2;

        while (usedIds.has(candidate)) {
            candidate = base + '-' + counter;
            counter += 1;
        }

        el.setAttribute('id', candidate);
        usedIds.add(candidate);
        return candidate;
    }

    function sectionWantsSubsections(section) {
        var setting = section.getAttribute('data-toc-subsections');
        if (setting) setting = setting.toLowerCase();
        if (setting === 'true') return true;
        if (setting === 'false') return false;
        return defaultIncludeSubsections;
    }

    function addSectionLink(links, sectionGroups, label, id, target) {
        var group = document.createElement('div');
        group.className = 'toc-section';

        var a = document.createElement('a');
        a.className = 'toc-section-link';
        a.href = '#' + id;
        a.textContent = label || id;
        group.appendChild(a);

        var subsections = document.createElement('div');
        subsections.className = 'toc-subsections';
        group.appendChild(subsections);

        container.appendChild(group);
        links.push({ el: a, id: id, target: target, sectionId: id });
        sectionGroups[id] = group;

        return { group: group, subsections: subsections };
    }

    function addSubsectionLink(links, subsectionContainer, sectionId, label, id, target) {
        var a = document.createElement('a');
        a.className = 'toc-subsection-link';
        a.href = '#' + id;
        a.textContent = label || id;
        subsectionContainer.appendChild(a);
        links.push({ el: a, id: id, target: target, sectionId: sectionId });
    }

    container.innerHTML = '';

    // Build TOC links from sections (h2) and optional subsection headings (h3).
    var links = [];
    var sectionGroups = {};
    sections.forEach(function(section) {
        var h2 = section.querySelector('h2');
        var sectionLabel = normalizeTocText(h2 ? h2.textContent : section.getAttribute('id'));
        var sectionId = ensureId(section, sectionLabel);
        var sectionUi = addSectionLink(links, sectionGroups, sectionLabel, sectionId, section);

        if (!sectionWantsSubsections(section)) {
            sectionUi.subsections.remove();
            return;
        }

        var subsectionCount = 0;
        section.querySelectorAll('h3').forEach(function(h3, index) {
            var subsectionLabel = normalizeTocText(h3.textContent);
            if (!subsectionLabel) return;
            var subsectionId = ensureId(h3, sectionId + '-' + subsectionLabel + '-' + (index + 1));
            addSubsectionLink(links, sectionUi.subsections, sectionId, subsectionLabel, subsectionId, h3);
            subsectionCount += 1;
        });

        if (!subsectionCount) {
            sectionUi.subsections.remove();
        }
    });

    if (!links.length) return;

    function setActive(id) {
        var activeLink = null;

        links.forEach(function(link) {
            var isActive = link.id === id;
            link.el.classList.toggle('active', isActive);
            if (isActive) activeLink = link;
        });

        Object.keys(sectionGroups).forEach(function(sectionId) {
            var isSectionActive = activeLink && activeLink.sectionId === sectionId;
            var isSubsectionActive = isSectionActive && activeLink.id !== sectionId;
            sectionGroups[sectionId].classList.toggle('section-active', isSectionActive);
            sectionGroups[sectionId].classList.toggle('subsection-active', isSubsectionActive);
        });
    }

    // Click: instantly reflect selection; scrolling takes over naturally.
    links.forEach(function(link) {
        link.el.addEventListener('click', function() {
            setActive(link.id);
        });
    });

    function update() {
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

        // Active = last heading whose top is above the reference line.
        var active = null;
        links.forEach(function(link) {
            if (!link.target) return;
            if (link.target.getBoundingClientRect().top <= refLine) {
                active = link.id;
            }
        });
        if (!active && links.length) {
            active = links[0].id;
        }
        if (active) setActive(active);
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('hashchange', update);
    update();
});
