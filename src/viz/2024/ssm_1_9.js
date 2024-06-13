const widthSSM19 = 700;
const heightSSM19 = 250;

// Create input elements for k, b, and m with sliders
var inputData = [
    {label: 'k', value: 5, step: 1, min: 1, max: 10},
    {label: 'b', value: 3, step: 1, min: 1, max: 15},
    {label: 'm', value: 5, step: 1, min: 5, max: 20}
];

d3.select('#ssm_1_viz_9').append('div')
    .style('display', 'flex')
    .style('flex-direction', 'column')
    .style('position', 'relative')
    .style('left', '650px')
    .style('top', '10px')
    .selectAll('div')
    .data(inputData)
    .enter()
    .append('div')
    .style('margin-bottom', '10px')
    .html(d => `<label for="${d.label}">$${d.label}$:</label>
                <input type="range" id="${d.label}_slider" value="${d.value}" step="${d.step}" min="${d.min}" max="${d.max}" style="width: 75px;">
                <input type="number" id="${d.label}_number" value="${d.value}" step="${d.step}" min="${d.min}" max="${d.max}" style="width: 30px;" disabled>`);

d3.selectAll('input[type="range"]').each(function(d, i) {
    var slider = d3.select(this);
    var number = d3.select(`#${slider.attr('id').replace('_slider', '_number')}`);

    // Update number input when slider changes
    slider.on('input', function() {
        var value = slider.property('value');
        number.property('value', value);
    });
});

// Read input values
function getSimulationParameters() {
    const k = parseFloat(document.getElementById('k_number').value);
    const b = parseFloat(document.getElementById('b_number').value);
    const m = parseFloat(document.getElementById('m_number').value);
    return { k, b, m };
}

// get the x position of the weight rectangle
function getRectangleXPosition() {
    const rect = d3.select("#weightRect");
    const x = parseFloat(rect.attr("x"));
    return x - widthSSM19 / 10;
}

function getRectangleNormalizedXPosition() {
    pos = getRectangleXPosition();
    return pos / ((widthSSM19 / 2 + widthSSM19 / 10) - (widthSSM19 / 2 - (widthSSM19 / 10) * 4));
}

function getForceApplied() {
    var pos = getRectangleNormalizedXPosition();
    if (pos > 0.5) {
        return 4**(pos - 0.5) - 1;
    } else {
        return 4**(-pos + 0.5) - 1;
    }
}

// Create the simulation
createSimulation_1_9();

function createSimulation_1_9() {
    const width = 700;
    const height = 350;

    var weightWidth = width / 10;
    var weightHeight = width / 10;

    // Define the left and right limits for the input weight
    var leftDragLimit = width / 2 - weightWidth * 4;
    var rightDragLimit = width / 2 + weightWidth;

    var weidthStartX = width / 2 - weightWidth / 2;
    var weidthStartY = height - weightWidth * 1.5;

    const simCanvas = d3.select('#ssm_1_viz_9').append('svg')
        .attr('width', width)
        .attr('height', height);

    // Define the drag behavior
    var drag = d3.drag()
        .on("start", dragStarted)
        .on("drag", dragged)
        .on("end", dragEnded);

    // Append weight to the canvas
    var weight = simCanvas.append("rect")
        .attr("id", "weightRect")
        .attr("x", weidthStartX)
        .attr("y", weidthStartY)
        .attr("width", weightWidth)
        .attr("height", weightHeight)
        .attr("fill", "black")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("rx", 10)
        .attr("ry", 10)
        .style("cursor", "pointer")
        .call(drag);

    // Append the "spring" to the canvas
    var spring = simCanvas.append("line")
        .attr("id", "spring")
        .attr("x1", leftDragLimit)
        .attr("y1", weidthStartY + weightHeight / 2)
        .attr("x2", weidthStartX)
        .attr("y2", weidthStartY + weightHeight / 2)
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    // Append left weight limit line
    simCanvas.append("line")
        .attr("x1", leftDragLimit)
        .attr("y1", weidthStartY)
        .attr("x2", leftDragLimit)
        .attr("y2", weidthStartY + weightHeight)
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    // Functions for the drag behavior
    function dragStarted(event) {
        d3.select(this).raise().attr("stroke", "red").attr("fill", "red");
    }

    function dragged(event, d) {
        var newX = Math.max(leftDragLimit, Math.min(event.x, rightDragLimit));
        d3.select(this).attr("x", newX);

        // Update the spring position
        spring.attr("x2", newX + weightWidth / 2);

        var forceApplied = getForceApplied();
        console.log('Current force applied:', forceApplied);
    }

    function dragEnded(event, d) {
        d3.select(this).attr("stroke", "black").attr("fill", "black");
        startAnimation();
    }

        // Function to start the animation
    function startAnimation() {
        var params = getSimulationParameters();
        const force = getForceApplied();
        const weight = d3.select("#weightRect");
        const spring = d3.select("#spring");

        let velocity = 0;
        let position = parseFloat(weight.attr("x"));

        function animate() {
            const acceleration = force / params.m;
            velocity += acceleration;
            position += velocity;

            // Apply damping
            velocity *= (1 - params.b / 100);

            // Apply spring force
            const springForce = -params.k * (position - weidthStartX);
            velocity += springForce / params.m;

            position = Math.max(leftDragLimit, Math.min(position - weightWidth, rightDragLimit));

            weight.attr("x", position);
            spring.attr("x2", position);

            if (Math.abs(velocity) > 0.001) {
                params = getSimulationParameters();
                requestAnimationFrame(animate);
            }
        }

        animate();
    }

}
