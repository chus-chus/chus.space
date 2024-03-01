// scroll progress bar for entries

document.addEventListener('DOMContentLoaded', function() {
    // Select all the sections and the progress bar container
    const sections = document.querySelectorAll('.entry section');
    const progressBarContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    
    // Determine the total height of the content for percentage calculation
    const contentHeight = sections[sections.length - 1].offsetTop + sections[sections.length - 1].offsetHeight;

    // Create markers
    sections.forEach((section, index) => {
        const marker = document.createElement('div');
        marker.classList.add('progress-marker');
        marker.textContent = section.getAttribute('id'); // Use the section's ID as text
        // Calculate position percentage (top offset / total content height)
        const positionPercent = (section.offsetTop / contentHeight) * 100;
        marker.style.top = Math.max(0, (positionPercent - 9)) + '%'; // Set the top position as a percentage
        progressBarContainer.appendChild(marker); // Append marker to the progress container
    });

    function updateProgressBarOpacity() {
        let scrollDistance = window.scrollY + window.innerHeight / 2;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        let scrolledPercentage = Math.max(0, (scrollDistance / maxScroll) * 100 - 13);
        progressBar.style.height = scrolledPercentage + '%';

        let markers = document.querySelectorAll('.progress-marker'); // Directly use the marker elements
        let marker_positions = [];
        let closestMarkerIndex = null;
        let closestDistance = Number.MAX_VALUE;

        // Compute markers' positions and find the closest marker
        sections.forEach((section, index) => {
            const positionPercent = (section.offsetTop / document.documentElement.scrollHeight) * 100;
            const positionPixels = (positionPercent / 100) * document.documentElement.scrollHeight;
            marker_positions.push(positionPixels);

            let distance = Math.abs(scrollDistance - positionPixels);

            // Determine if this marker is the closest to the viewport's midpoint
            if (distance < closestDistance) {
                closestDistance = distance;
                closestMarkerIndex = index;
            }
        });

        // Toggle the active class based on the closest marker
        markers.forEach((marker, index) => {
            if (index === closestMarkerIndex) {
                marker.classList.add('active');
            } else {
                marker.classList.remove('active');
            }
        });

        // Sort markers to ensure they are in order
        marker_positions.sort((a, b) => a - b);

        // Find markers above and below the current scroll position
        let aboveMarker = null, belowMarker = null;
        for (let i = 0; i < markers.length; i++) {
            if (marker_positions[i] < scrollDistance) {
                aboveMarker = marker_positions[i];
            } else {
                belowMarker = marker_positions[i];
                break; // Found the first marker below the scroll position
            }
        }

        let opacity = 1;

        if (aboveMarker !== null && belowMarker !== null) {
            const midpoint = (aboveMarker + belowMarker) / 2;
            const distanceToMidpoint = Math.abs(scrollDistance - midpoint);
            const maxDistance = ((belowMarker - aboveMarker) / 2) * 0.9;
            const normalizedDistance = distanceToMidpoint / maxDistance;
            // Squaring the normalized distance to make opacity drop faster and stay at 0 longer.
            opacity = 1 - Math.pow(normalizedDistance, 2);
            opacity = Math.max(0, opacity); // Ensure opacity isn't negative and doesn't exceed the bounds
        } else {
            // Increase opacity starting from last marker towards the end
            const fadeStart = marker_positions[marker_positions.length - 1];
            const normalizedScrollDistance = (scrollDistance - fadeStart) / (maxScroll - fadeStart);
            // Squaring can be applied here too if a more gradual increase is desired
            opacity = Math.pow(normalizedScrollDistance, 2);
            opacity = Math.min(1, opacity); // Ensure opacity doesn't exceed 1
        }

        progressBar.style.opacity = opacity;

    }

    window.addEventListener('scroll', updateProgressBarOpacity);
    updateProgressBarOpacity(); // Initialize on page load
});

