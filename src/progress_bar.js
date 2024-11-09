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
        // Create an anchor element instead of a div
        const marker = document.createElement('a');
        marker.classList.add('progress-marker');
        marker.textContent = section.getAttribute('id'); // Use the section's ID as text
        // Set the href attribute to link to the section ID
        marker.href = '#' + section.getAttribute('id');
    
        // Calculate position percentage (top offset / total content height)
        const positionPercent = (section.offsetTop / contentHeight) * 100;
        marker.style.top = Math.max(0, (positionPercent - 9)) + '%'; // Set the top position as a percentage
        marker.style.position = 'absolute'; // Ensure the marker is positioned correctly
        marker.style.cursor = 'pointer'; // Change the cursor to indicate it's clickable
    
        progressBarContainer.appendChild(marker); // Append marker to the progress container
    });

    function updateProgressBar() {
        let scrollDistance = window.scrollY + window.innerHeight / 2;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        let scrolledPercentage = Math.max(0, (scrollDistance / maxScroll) * 100 - 13);
        progressBar.style.height = scrolledPercentage + '%';

        let markers = document.querySelectorAll('.progress-marker'); // Directly use the marker elements
        let closestMarkerIndex = null;
        let closestDistance = Number.MAX_VALUE;

        // Compute markers' positions and find the closest marker
        sections.forEach((section, index) => {
            const positionPercent = (section.offsetTop / document.documentElement.scrollHeight) * 100;
            const positionPixels = (positionPercent / 100) * document.documentElement.scrollHeight;

            // Calculate the distance from the viewport's midpoint to the marker
            let distance = Math.abs(scrollDistance - positionPixels - window.innerHeight / 2);

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

    }

    window.addEventListener('scroll', updateProgressBar);
    updateProgressBar(); // Initialize on page load
});

