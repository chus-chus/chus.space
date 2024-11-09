const canvasWidth = 550;
const canvasHeight = 300;

const hippoLeftLimit = canvasWidth / 10;
const hippoRightLimit = canvasWidth - canvasWidth / 6;
const hippoHeight = canvasHeight / 8;

const hippoPadding = 60;

const totalYOffset = canvasHeight - canvasHeight / 7;

var inputData = [
    {label: 'c1', value: 6, step: 1, min: 0, max: 15},
    {label: 'c2', value: 1, step: 1, min: 0, max: 15},
    {label: 'c3', value: 14, step: 1, min: 0, max: 15}
];

var coeffMaps = {
    0: 3,
    1: 9,
    2: 27
};

var init = true;

const vizCanvas = d3.select('#ssm_2_viz_7').append('svg')
    .attr('width', canvasWidth)
    .attr('height', canvasHeight);

// "total" text
vizCanvas.append('text')
    .attr('x', canvasWidth / 2)
    .attr('y', totalYOffset - 30)
    .attr('text-anchor', 'middle')
    .text('Reconstructed state history');

// "coefficients" text
vizCanvas.append('text')
    .attr('x', canvasWidth / 2)
    .attr('y', 13)
    .attr('text-anchor', 'middle')
    .text('Weighed Legendre polynomials');

appendHippoCoeffSliders();
paintAll(init = true);

function normalizePosition(x) {
    // map to [0, 5]
    return (x - hippoLeftLimit) / (hippoRightLimit - hippoLeftLimit);
}

function paintAll(init = false) {
    paintHippo("c1", init);
    paintHippo("c2", init);
    paintHippo("c3", init);
    paintTotal(init, totalYOffset);
}

function paintTotal(init = false, yOffset) {
    // evaluate the whole legendre polynomial with the three coefficients
    const c1 = getHippoCoeff("c1");
    const c2 = getHippoCoeff("c2");
    const c3 = getHippoCoeff("c3");

    const data = d3.range(hippoLeftLimit, hippoRightLimit).map(function(x) {
        return {
            x: x,
            y: legendrePolynomial([c1, c2, c3], normalizePosition(x)) * 2 + yOffset
        };
    });

    const line = d3.line()
        .x(d => d.x)
        .y(d => d.y);

    if (!init) {
        d3.select('#total_path').remove();
    }

    vizCanvas.append('path')
        .attr("id", "total_path")
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'red')
        .attr('stroke-width', 2)
        .attr('d', line);
}

function paintHippo(hippoId, init = false) {
    const c = getHippoCoeff(hippoId);

    if (hippoId === "c1") {
        var yOffset = hippoHeight;
        var nCoef = coeffMaps[0];
    } else if (hippoId === "c2") {
        var yOffset = hippoHeight + hippoPadding;
        var nCoef = coeffMaps[1];
    } else if (hippoId === "c3") {
        var yOffset = hippoHeight + 2 * hippoPadding;
        var nCoef = coeffMaps[2];
    }

    const data = d3.range(hippoLeftLimit, hippoRightLimit).map(function(x) {
        return {
            x: x,
            y: c * legendrePolynomialTerm(nCoef, normalizePosition(x)) * 2 + yOffset
        };
    });

    const line = d3.line()
        .x(d => d.x)
        .y(d => d.y);

    if (!init) {
        d3.select(`#${hippoId}_path`).remove();
    }

    vizCanvas.append('path')
        .attr("id", `${hippoId}_path`)
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'blue')
        .attr('stroke-width', 2)
        .attr('d', line);
}

// evaluate Legendre polynomial
function legendrePolynomial(coefficients, x) {
    let result = 0;
    for (let n = 0; n < coefficients.length; n++) {
        result += coefficients[n] * legendrePolynomialTerm(coeffMaps[n], x);
    }
    return result;
}

// compute individual Legendre polynomial term
function legendrePolynomialTerm(n, x) {
    // evil closed formula azzazz
    if (n === 3) return 35*x**4/8 - 15*x**2/4 + 3/8;
    if (n === 9) return 46189*x**10/256 - 109395*x**8/256 + 45045*x**6/128 - 15015*x**4/128 + 3465*x**2/256 - 63/256;
    if (n === 27) return x*(121683714103007*x**26 - 805867616040669*x**24 + 2370198870707850*x**22 
                           - 4079321865912150*x**20 + 4556689318306125*x**18 - 3463083881912655*x**16 + 
                           1825501581163260*x**14 - 667866432132900*x**12 + 166966608033225*x**10 - 
                           27577067392875*x**8 + 2836498360410*x**6 - 164094946470*x**4 + 4411154475*x**2 - 35102025)/8388608
    // return ((2 * n - 1) * x * legendrePolynomialTerm(n - 1, x) - (n - 1) * legendrePolynomialTerm(n - 2, x)) / n;
}

function appendHippoCoeffSliders() {
    const container = d3.select('#ssm_2_viz_7').append('div')
        .style('display', 'flex')
        .style('flex-direction', 'column')
        .style('position', 'relative')
        .style('left', '0px')
        .style('top', `${hippoHeight}px`);

    container.selectAll('div')
        .data(inputData)
        .enter()
        .append('div')
        .style('margin-bottom', '1px')
        .html(d => `<label for="${d.label}">${d.label}:</label>
                    <input type="range" id="${d.label}_slider" value="${d.value}" step="${d.step}" min="${d.min}" max="${d.max}" style="width: 75px;">
                    <input type="number" id="${d.label}_number" value="${d.value}" step="${d.step}" min="${d.min}" max="${d.max}" style="width: 30px;" disabled>`);

    d3.selectAll('input[type="range"]').each(function() {
        var slider = d3.select(this);
        var number = d3.select(`#${slider.attr('id').replace('_slider', '_number')}`);

        // Update number input when slider changes
        slider.on('input', function() {
            var value = slider.property('value');
            number.property('value', value);
            paintAll();
        });
    });
}

function getHippoCoeff(hippoId) {
    return parseFloat(d3.select(`#${hippoId}_slider`).property('value'));
}
