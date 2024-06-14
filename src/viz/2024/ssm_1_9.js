const widthSSM19 = 700;
const heightSSM19 = 325;

// Create input elements for k, b, and m with sliders
var inputData = [
    {label: 'k', value: 8, step: 1, min: 1, max: 10},
    {label: 'b', value: 5, step: 1, min: 1, max: 15},
    {label: 'm', value: 1, step: 1, min: 1, max: 5},
    {label: 'Δ', value: 10, step: 1, min: 1, max: 10}
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
        updateValuesParameterMatrices();
    });
});

// Read input values
function getSimulationParameters() {
    const k = parseFloat(document.getElementById('k_number').value) * 100;
    const b = parseFloat(document.getElementById('b_number').value);
    const m = parseFloat(document.getElementById('m_number').value);
    const step = parseFloat(document.getElementById('Δ_number').value) / 1000;
    return { k, b, m, step};
}

// get the x position of the weight rectangle
function getRectangleXPosition() {
    const rect = d3.select("#weightRect");
    const x = parseFloat(rect.attr("x"));
    return x - widthSSM19 / 10;
}

function getRectangleNormalizedXPosition() {
    var pos = getRectangleXPosition();
    var leftLimit = widthSSM19 / 2 - (widthSSM19 / 10) * 4;
    var rightLimit = (widthSSM19 / 2 + widthSSM19 / 10);

    // Normalize pos to the range [0, 1]
    var normalized_pos_0_1 = (pos) / (rightLimit - leftLimit);

    // Map from range [0, 1] to range [-1, 1]
    var normalized_pos = (normalized_pos_0_1 * 2) - 1;

    return normalized_pos;
}

function inverseNormalizeXPosition(normalized_pos) {
    var leftLimit = widthSSM19 / 2 - (widthSSM19 / 10) * 4;
    var rightLimit = (widthSSM19 / 2 + widthSSM19 / 10);

    // Map from range [-1, 1] to range [0, 1]
    var normalized_pos_0_1 = (normalized_pos + 1) / 2;

    // Map from range [0, 1] to the original position range [leftLimit, rightLimit]
    var pos = normalized_pos_0_1 * (rightLimit - leftLimit) + leftLimit;

    return pos;
}

function getForceApplied() {
    var pos = getRectangleNormalizedXPosition();
    if (pos > 0) {
        return 3**(pos) - 1;
    } else {
        return -1*(3**(-pos) - 1);
    }
}



// Create the simulation
createSimulation_1_9();

function createSimulation_1_9() {
    const width = 700;
    const height = 325;

    var weightWidth = width / 10;
    var weightHeight = width / 10;

    // Define the left and right limits for the input weight
    var leftDragLimit = width / 2 - weightWidth * 4;
    var rightDragLimit = width / 2 + weightWidth;

    var weightStartX = width / 2 - weightWidth;
    var weightStartY = height - weightWidth * 1.25;

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
        .attr("x", weightStartX)
        .attr("y", weightStartY)
        .attr("width", weightWidth)
        .attr("height", weightHeight)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("rx", Math.min(weightWidth, weightHeight) / 2)
        .attr("ry", Math.min(weightWidth, weightHeight) / 2)
        .style("cursor", "pointer")
        .call(drag)
        .on("mouseover", function() {
            d3.select(this)
                .attr("stroke-width", 4)
                .attr("stroke", "red");
        })
        .on("mouseout", function() {
            d3.select(this)
                .attr("stroke-width", 2)
                .attr("stroke", "black");
        });

    // Append the "spring" to the canvas
    var spring = simCanvas.append("line")
        .attr("id", "spring")
        .attr("x1", leftDragLimit)
        .attr("y1", weightStartY + weightHeight / 2)
        .attr("x2", weightStartX)
        .attr("y2", weightStartY + weightHeight / 2)
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("fill", "none");

    // Append left weight limit line
    simCanvas.append("line")
        .attr("x1", leftDragLimit)
        .attr("y1", weightStartY)
        .attr("x2", leftDragLimit)
        .attr("y2", weightStartY + weightHeight + 4)
        .attr("stroke", "gray")
        .attr("stroke-width", 6);

    // Append bottom limit line
    simCanvas.append("line")
        .attr("x1", leftDragLimit - 3)
        .attr("y1", weightStartY + weightHeight + 4)
        .attr("x2", rightDragLimit + weightWidth)
        .attr("y2", weightStartY + weightHeight + 4)
        .attr("stroke", "gray")
        .attr("stroke-width", 6);

    // Functions for the drag behavior
    function dragStarted(event) {
        stopAnimation();
        d3.select(this).raise()
            .attr("stroke", "red")
            .attr("stroke-width", 4)
            .attr("fill", "white");
        updateDynamicValues(math.matrix([[0], [0]]), math.matrix([[0], [0]]), 0, 0);
    }

    function dragged(event, d) {
        var newX = Math.max(leftDragLimit, Math.min(event.x, rightDragLimit));
        d3.select(this).attr("x", newX);

        // Update spring position too
        spring.attr("x2", newX + weightWidth / 2);

        updateDragValues(getForceApplied(), getRectangleNormalizedXPosition());
    }

    function dragEnded(event, d) {
        d3.select(this).attr("stroke", "black").attr("fill", "white");
        startAnimation();
    }

    let animationRunning = false;

    // stop the animation
    function stopAnimation() {
        animationRunning = false;
    }

    // start the SSM animation: when weight is released
    function startAnimation() {
        var params = getSimulationParameters();
        var force = getForceApplied();
        const weight = d3.select("#weightRect");
        const spring = d3.select("#spring");

        let velocity = 0;
        let position = getRectangleNormalizedXPosition();

        // declare matrices
        var Ab, Bb, C;
        [Ab, Bb, C] = get_SSM_params(params.k, params.b, params.m, params.step);

        // initial hidden state
        var h = math.matrix([[position], [0]]);

        firstFrame = true;
        animationRunning = true;

        updateDragValues(0, position);

        function animate() {
            if (!animationRunning) return;

            var prevH = h.clone();

            // Apply force
            [h, y] = SSM_step(Ab, Bb, C, force, h);
            
            updateDynamicValues(prevH, h, y.get([0, 0]))

            // map from 0 to 1 back to leftDragLimit to rightDragLimit
            position = inverseNormalizeXPosition(y.get([0, 0]));
            velocity = h.get([1, 0]);

            position = Math.max(leftDragLimit, position);

            // Update the weight and spring positions
            weight.attr("x", position);
            spring.attr("x2", position);

            if (Math.abs(velocity) > 0.001) {
                params = getSimulationParameters();
                requestAnimationFrame(animate);
            } else {
                stopAnimation();
                updateDynamicValues(math.matrix([[0], [0]]), math.matrix([[0], [0]]), 0, 0);
            }

            if (firstFrame) {
                force = 0;
                firstFrame = false;
            }
        }

        animate();
    }

    // matrices
    generateAllMatrices(simCanvas);

    // dynamic values
    updateValuesParameterMatrices();
    updateDynamicValues(math.matrix([[0], [0]]), math.matrix([[0], [0]]), 0, 0);
    updateDragValues(0, 0);
}

// ----------------------- SSM

// bilinear discretization
function discretize(A, B, step) {
    const I = math.identity(A.size()[0]);
    const stepDiv2 = math.divide(step, 2.0);
    const A_step = math.multiply(stepDiv2, A);

    const BL = math.inv(math.subtract(I, A_step));
    const Ab = math.multiply(BL, math.add(I, A_step));
    const Bb = math.multiply(math.multiply(BL, step), B);

    return [Ab, Bb];
}

function get_SSM_params_NoDisc(k, b, m) {
    const A = math.matrix([[0, 1], [-k/m, -b/m]]);
    const B = math.matrix([[0], [1/m]]);
    const C = math.matrix([[1, 0]]);

    return [A, B, C];
}

function get_SSM_params(k, b, m, step) {
    const A = math.matrix([[0, 1], [-k/m, -b/m]]);
    const B = math.matrix([[0], [1/m]]);
    const C = math.matrix([[1, 0]]);

    var [Ab, Bb] = discretize(A, B, step);

    return [Ab, Bb, C];
}

// single step of ssm, A, B and C are discretized, x is the input (force), h is the state
function SSM_step(Ab, Bb, C, u, h) {
    h = math.add(math.multiply(Ab, h), math.multiply(Bb, u));
    const y = math.multiply(C, h);
    return [h, y];
}

function updateValuesParameterMatrices() {
    var params = getSimulationParameters();

    var [A, B, C] = get_SSM_params(params.k, params.b, params.m, params.step);

    // Update matrices
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            d3.select("#A_" + i + "_" + j).text(A.get([i, j]).toFixed(2));
        }
    }

    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 1; j++) {
            d3.select("#B_" + i + "_" + j).text((B.get([i, j])).toFixed(2));
        }
    }

    for (let i = 0; i < 1; i++) {
        for (let j = 0; j < 2; j++) {
            d3.select("#C_" + i + "_" + j).text(C.get([i, j]).toFixed(0));
        }
    }
}

function updateDynamicValues(h1, h2, y) {
    d3.select("#h_one_0_0").text(h1.get([0, 0]).toFixed(2));
    d3.select("#h_one_1_0").text(h1.get([1, 0]).toFixed(2));

    d3.select("#h_two_0_0").text(h2.get([0, 0]).toFixed(2));
    d3.select("#h_two_1_0").text(h2.get([1, 0]).toFixed(2));

    d3.select("#h_three_0_0").text(h2.get([0, 0]).toFixed(2));
    d3.select("#h_three_1_0").text(h2.get([1, 0]).toFixed(2));

    d3.select("#y_0_0").text(y.toFixed(2));
}

function updateDragValues(force, y) {
    d3.select("#u_0_0").text(force.toFixed(2));
    d3.select("#y_0_0").text(y.toFixed(2));
}

// matrix utils
function createMatrix(svg, rows, cols, cellSize, fill, stroke, startX, startY, topText, matrixID) {

    const matrixGroup = svg.append("g")
        .attr("class", "matrix");

    // Append the top text
    matrixGroup.append("text")
        .attr("x", startX + (cols * cellSize) / 2)
        .attr("y", startY - 10) // Adjust this value as needed for spacing
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-family", "Arial, sans-serif")
        .attr("fill", "black")
        .text(topText);

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const x = startX + j * cellSize;
            const y = startY + i * cellSize;

            matrixGroup.append("rect")
                .attr("x", x)
                .attr("y", y)
                .attr("width", cellSize)
                .attr("height", cellSize)
                .attr("fill", fill)
                .attr("stroke", stroke)
                .attr("stroke-width", 1);

            matrixGroup.append("text")
                .attr("font-size", "13px")
                .attr("id", matrixID + "_" + i + "_" + j)
                .attr("x", x + cellSize / 2)
                .attr("y", y + cellSize / 2)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "central");
        }
    }
}


function generateAllMatrices(simCanvas) {
    var matrixCellSize = 35;
    var padding = 20;

    // A
    var startx_A = widthSSM19 / 2 - (widthSSM19 / 10) * 4;
    var starty_A = 30;
    var n_a = 2;
    var m_a = 2;
    createMatrix(simCanvas, n_a, m_a, matrixCellSize, "#28C76F", "black", startx_A, starty_A, "Ā", "A");

    // Times
    simCanvas.append("text")
        .attr("x", startx_A + matrixCellSize * m_a + padding / 2)
        .attr("y", 30 + matrixCellSize * n_a / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", "24px")
        .attr("font-family", "Arial, sans-serif")
        .attr("fill", "black")
        .text("·");

    // h
    var startx_h = startx_A + matrixCellSize * m_a + padding;
    var starty_h = 30;
    var n_h = 2;
    var m_h = 1;
    createMatrix(simCanvas, n_h, m_h, matrixCellSize, "#FCE4D8", "black", startx_h, starty_h, "h(i)", "h_one");

    // +
    simCanvas.append("text")
        .attr("x", startx_h + matrixCellSize * m_h + padding)
        .attr("y", 30 + matrixCellSize * n_h / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", "24px")
        .attr("font-family", "Arial, sans-serif")
        .attr("fill", "black")
        .text("+");

    // B
    var startx_B = startx_h + matrixCellSize * m_h + padding * 2;
    var starty_B = 30;
    var n_b = 2;
    var m_b = 1;
    createMatrix(simCanvas, n_b, m_b, matrixCellSize, "#FA8072", "black", startx_B, starty_B, "B̄", "B");

    // Times
    simCanvas.append("text")
        .attr("x", startx_B + matrixCellSize * m_b + padding / 2)
        .attr("y", 30 + matrixCellSize * n_a / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", "24px")
        .attr("font-family", "Arial, sans-serif")
        .attr("fill", "black")
        .text("·");

    // u
    var startx_x = startx_B + matrixCellSize * m_b + padding;
    var starty_x = 30 + matrixCellSize / 2;
    var n_x = 1;
    var m_x = 1;
    createMatrix(simCanvas, n_x, m_x, matrixCellSize, "lightgray", "black", startx_x, starty_x, "u", "u");

    // equals
    simCanvas.append("text")
        .attr("x", startx_x + matrixCellSize * m_x + padding)
        .attr("y", 30 + matrixCellSize * n_a / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", "24px")
        .attr("font-family", "Arial, sans-serif")
        .attr("fill", "black")
        .text("=");

    // h(i+1)
    var startx_h1 = startx_x + matrixCellSize * m_x + padding * 2;
    var starty_h1 = 30;
    var n_h1 = 2;
    var m_h1 = 1;
    createMatrix(simCanvas, n_h1, m_h1, matrixCellSize, "#FCE4D8", "black", startx_h1, starty_h1, "h(i+1)", "h_two");

    // C * h+1 = y

    // C
    var startx_C = startx_A;
    var starty_C = starty_A + matrixCellSize * n_a + padding * 3;
    var n_c = 1;
    var m_c = 2;
    createMatrix(simCanvas, n_c, m_c, matrixCellSize, "#DDA0DD", "black", startx_C, starty_C, "C", "C");

    // Times
    simCanvas.append("text")
        .attr("x", startx_C + matrixCellSize * m_c + padding / 2)
        .attr("y", starty_C + matrixCellSize * n_c / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", "24px")
        .attr("font-family", "Arial, sans-serif")
        .attr("fill", "black")
        .text("·");

    // h+1
    var startx_h2 = startx_A + matrixCellSize * m_a + padding;
    var starty_h2 = starty_C + matrixCellSize * n_c / 2 - matrixCellSize;
    var n_h2 = 2;
    var m_h2= 1;
    createMatrix(simCanvas, n_h2, m_h2, matrixCellSize, "#FCE4D8", "black", startx_h2, starty_h2, "h(i+1)", "h_three");

    // +
    simCanvas.append("text")
        .attr("x", startx_h + matrixCellSize * m_h + padding)
        .attr("y", starty_C + matrixCellSize * n_c / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", "24px")
        .attr("font-family", "Arial, sans-serif")
        .attr("fill", "black")
        .text("=");

    // y
    var startx_y = startx_B;
    var starty_y = starty_C;
    var n_y = 1;
    var m_y = 1;
    createMatrix(simCanvas, n_y, m_y, matrixCellSize, "lightgray", "black", startx_y, starty_y, "y", "y");
}
