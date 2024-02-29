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
        marker.style.top = positionPercent + '%'; // Set the top position as a percentage
        progressBarContainer.appendChild(marker); // Append marker to the progress container
    });

    function updateProgressBar() {
        const scrollDistance = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const scrolledPercentage = (scrollDistance / maxScroll) * 100;
        progressBar.style.height = scrolledPercentage + '%';

        // Check proximity to each section to adjust the opacity of the progress bar
        let nearestSectionDistance = Number.MAX_VALUE; // Start with the maximum distance

        sections.forEach(section => {
            const sectionTop = section.offsetTop - window.innerHeight * 0.01; // Start checking 10% above the section
            const sectionBottom = section.offsetTop + section.offsetHeight + window.innerHeight * 0.01; // Continue checking 10% below the section

            // Determine the distance to the nearest section
            if (scrollDistance > sectionTop && scrollDistance < sectionBottom) {
                const distanceToTop = Math.abs(scrollDistance - sectionTop);
                const distanceToBottom = Math.abs(scrollDistance - sectionBottom);
                nearestSectionDistance = Math.min(distanceToTop, distanceToBottom, nearestSectionDistance);
            }
        });

        // Adjust the opacity based on the nearest section distance
        // The closer to the section, the lower the opacity
        const opacity = 1 - Math.min(1, nearestSectionDistance / (window.innerHeight * 0.99));
        progressBar.style.opacity = opacity;
    }

    window.addEventListener('scroll', updateProgressBar);
    updateProgressBar(); // Initialize on page load
});

