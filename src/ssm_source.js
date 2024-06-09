document.addEventListener('DOMContentLoaded', function() {
    const svg = d3.select('#sample_viz').append('svg')
        .attr('width', 800)
        .attr('height', 600);

    // sample bar chart
    const data = [4, 8, 15, 16, 23, 42];
    svg.selectAll('rect')
        .data(data)
        .enter().append('rect')
        .attr('x', (d, i) => i * 100)
        .attr('y', d => 600 - d * 10)
        .attr('width', 50)
        .attr('height', d => d * 10)
        .attr('fill', 'steelblue');
});

// -------------------------------------------------- References --------------------------------------------------
const references = [
    {id: "ref1", author: "Author Name", year: "Year", title: "Title of the Document", publisher: "Publisher", url: "url"},
    {id: "ref2", author: "Author Name", year: "Year", title: "Title of the Document", publisher: "Publisher", url: "url"}
    // Add more references as needed
];

document.addEventListener('DOMContentLoaded', function() {
    const refList = document.getElementById('reference-list');
    references.forEach(ref => {
        const listItem = document.createElement('li');
        listItem.id = ref.id;
        listItem.innerHTML = `${ref.author}. (${ref.year}). <i>${ref.title}</i>. ${ref.publisher}. <a href="${ref.url}">link</a>`;
        refList.appendChild(listItem);
    });
});
