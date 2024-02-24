document.addEventListener('DOMContentLoaded', function() {
    // Sample data
    const dataset = [80, 100, 56, 120, 180, 30, 40, 120, 160];

    // SVG dimensions
    const svgWidth = 500, svgHeight = 300, barPadding = 5;
    const barWidth = (svgWidth / dataset.length);

    // Create SVG element
    const svg = d3.select('#visualization')
                  .append('svg')
                  .attr('width', svgWidth)
                  .attr('height', svgHeight)
                  .style('background-color', '#f4f4f4');

    // Create bars
    svg.selectAll('rect')
       .data(dataset)
       .enter()
       .append('rect')
       .attr('y', (d) => svgHeight - d)
       .attr('height', (d) => d)
       .attr('width', barWidth - barPadding)
       .attr('transform', (d, i) => {
           let translate = [barWidth * i, 0];
           return `translate(${translate})`;
       });
});
