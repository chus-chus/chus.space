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
