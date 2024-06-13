const width = 500;
const height = 250;
const blockWidth = 90;
const blockHeight = 90;
const smallBlockWidth = 35;
const smallBlockHeight = 30;
const totalBlocks = 3;
const inputValues = [0.1, 0.2, 0.3];
const outputValues = [0.19, 0.31, 0.4];
const inputBlockOffset = 30;
const arrowHeadSize = 8;

// medViewId 2 are ssms with hidden state
// medViewId 1 are ssms without hidden state
// opType can be A, B, C, D

createMainView();

function createCrossSmallView(smallView, medViewId) {
    const crossGroup = smallView.append("g")
    .attr("cursor", "pointer")
    .on("click", function() {
        smallView.remove();
        createMediumView(medViewId);
    })
    .on("mouseover", function() {
        d3.select(this).selectAll("rect").attr("fill", "#d3d3d3");
        d3.select(this).selectAll("line").attr("stroke", "#505050");
    })
    .on("mouseout", function() {
        d3.select(this).selectAll("rect").attr("fill", "white");
        d3.select(this).selectAll("line").attr("stroke", "black");
    });

    // Square with rounded edges
    crossGroup.append("rect")
        .attr("x", 8)
        .attr("y", 8)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("rx", 5)
        .attr("ry", 5);

    // Smaller cross inside the square, centered
    crossGroup.append("line")
        .attr("x1", 13)
        .attr("y1", 13)
        .attr("x2", 23)
        .attr("y2", 23)
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    crossGroup.append("line")
        .attr("x1", 23)
        .attr("y1", 13)
        .attr("x2", 13)
        .attr("y2", 23)
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    crossGroup.append("line")
        .attr("x1", 23)
        .attr("y1", 13)
        .attr("x2", 13)
        .attr("y2", 23)
        .attr("stroke", "black")
        .attr("stroke-width", 2);
}

function createMatrix(svg, rows, cols, cellSize, fill, stroke, startX, startY, topText, valueInOut) {

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

            if (valueInOut) {
                matrixGroup.append("text")
                    .attr("x", x + cellSize / 2)
                    .attr("y", y + cellSize / 2)
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "central")
                    .text(valueInOut);
            }
        }
    }
}

// A, B, C or D
function createSmallView(medViewId, opType) {

    // Matrices
    matrixCellSize = 40;
    padding = 30;

    d3.select('#ssm_1_viz_4').selectAll('*').remove();

    const smallView = d3.select('#ssm_1_viz_4').append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('position', 'relative')
        .style('top', 0)
        .style('left', 0);

    // ----------------------------- A block
    if (opType == "A") {

        // Main A rectangle
        smallView.append("rect")
            .attr("x", 2)
            .attr("y", 2)
            .attr("width", width - 4)
            .attr("height", height - 4)
            .attr("fill", "#AAEEC9")
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("rx", 10)
            .attr("ry", 10);

        // A label, top right
        smallView.append("text")
            .attr("x", width - 20)
            .attr("y", 25)
            .attr("text-anchor", "end")
            .attr("font-size", "16px")
            .attr("font-family", "Arial, sans-serif")
            .attr("fill", "black")
            .attr("font-weight", "bold")
            .text("A");

        createCrossSmallView(smallView, medViewId);

        startx_A = width / 5;
        starty_A = height / 2 - (matrixCellSize * 3) / 2;
        n_a = 3;
        m_a = 3;
        createMatrix(smallView, n_a, m_a, matrixCellSize, "#28C76F", "black", startx_A, starty_A, "A");

        // Add the "·" symbol between matrices
        smallView.append("text")
        .attr("x", startx_A + matrixCellSize * m_a + padding / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", "24px")
        .attr("font-family", "Arial, sans-serif")
        .attr("fill", "black")
        .text("·");

        startx_h = startx_A + matrixCellSize * m_a + padding;
        starty_h = height / 2 - (matrixCellSize * 3) / 2;
        n_h = 3;
        m_h = 1;
        createMatrix(smallView, n_h, m_h, matrixCellSize, "#FCE4D8", "black", startx_h, starty_h, `h(${medViewId-1})`);

        // Add the "=" symbol
        smallView.append("text")
        .attr("x", startx_h + matrixCellSize * m_h + padding / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", "24px")
        .attr("font-family", "Arial, sans-serif")
        .attr("fill", "black")
        .text("=");

        startx_res = startx_h + matrixCellSize * m_h + padding;
        starty_res = height / 2 - (matrixCellSize * 3) / 2;
        n_res = 3;
        m_res = 1;
        createMatrix(smallView, n_res, m_res, matrixCellSize, "#FCE4D8", "black", startx_res, starty_res, "");
    }

    // ----------------------------- B block
    if (opType == "B") {
        // Main B rectangle
        smallView.append("rect")
            .attr("x", 2)
            .attr("y", 2)
            .attr("width", width - 4)
            .attr("height", height - 4)
            .attr("fill", "#FCB8B0")
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("rx", 10)
            .attr("ry", 10);

        // B label, top right
        smallView.append("text")
            .attr("x", width - 20)
            .attr("y", 25)
            .attr("text-anchor", "end")
            .attr("font-size", "16px")
            .attr("font-family", "Arial, sans-serif")
            .attr("fill", "black")
            .attr("font-weight", "bold")
            .text("B");

        createCrossSmallView(smallView, medViewId);

        n_b = 3;
        m_b = 1;

        startx_B = width / 3.2;
        starty_B = height / 2 - (matrixCellSize * n_b) / 2;

        createMatrix(smallView, n_b, m_b, matrixCellSize, "#FA8072", "black", startx_B, starty_B, "B");

        // Add the "·" symbol between matrices
        smallView.append("text")
        .attr("x", startx_B + matrixCellSize * m_b + padding / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", "24px")
        .attr("font-family", "Arial, sans-serif")
        .attr("fill", "black")
        .text("·");

        n_x = 1;
        m_x = 1;

        startx_x = startx_B + matrixCellSize * m_x + padding;
        starty_x = height / 2 - n_x * matrixCellSize / 2;

        createMatrix(smallView, n_x, m_x, matrixCellSize, "#FCE4D8", "black", startx_x, starty_x, `x(${medViewId-1})`, inputValues[medViewId-1]);

        // Add the "=" symbol
        smallView.append("text")
        .attr("x", startx_x + matrixCellSize * m_x + padding / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", "24px")
        .attr("font-family", "Arial, sans-serif")
        .attr("fill", "black")
        .text("=");

        n_res = 3;
        m_res = 1;

        startx_res = startx_x + matrixCellSize * m_res + padding;
        starty_res = height / 2 - (matrixCellSize * n_res) / 2;

        createMatrix(smallView, n_res, m_res, matrixCellSize, "#FCE4D8", "black", startx_res, starty_res, "");
    }

    // ----------------------------- C block
    if (opType == "C") {

        // Main C rectangle
        smallView.append("rect")
            .attr("x", 2)
            .attr("y", 2)
            .attr("width", width - 4)
            .attr("height", height - 4)
            .attr("fill", "#D8BFD8")
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("rx", 10)
            .attr("ry", 10);

        // C label, top right
        smallView.append("text")
            .attr("x", width - 20)
            .attr("y", 25)
            .attr("text-anchor", "end")
            .attr("font-size", "16px")
            .attr("font-family", "Arial, sans-serif")
            .attr("fill", "black")
            .attr("font-weight", "bold")
            .text("C");

        createCrossSmallView(smallView, medViewId);

        n_c = 1;
        m_c = 3;

        startx_C = width / 5;
        starty_C = height / 2 - (matrixCellSize * n_c) / 2;

        createMatrix(smallView, n_c, m_c, matrixCellSize, "#DDA0DD", "black", startx_C, starty_C, "C");

        // Add the "·" symbol between matrices
        smallView.append("text")
        .attr("x", startx_C + matrixCellSize * m_c + padding / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", "24px")
        .attr("font-family", "Arial, sans-serif")
        .attr("fill", "black")
        .text("·");

        n_h = 3;
        m_h = 1;

        startx_h = startx_C + matrixCellSize * m_c + padding;
        starty_h = height / 2 - n_h * matrixCellSize / 2;

        createMatrix(smallView, n_h, m_h, matrixCellSize, "#FCE4D8", "black", startx_h, starty_h, `h(${medViewId})`);

        // Add the "=" symbol
        smallView.append("text")
        .attr("x", startx_h + matrixCellSize * m_h + padding / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", "24px")
        .attr("font-family", "Arial, sans-serif")
        .attr("fill", "black")
        .text("=");

        n_res = 1;
        m_res = 1;

        startx_res = startx_h + matrixCellSize * m_res + padding;
        starty_res = height / 2 - (matrixCellSize * n_res) / 2;

        createMatrix(smallView, n_res, m_res, matrixCellSize, "#FCE4D8", "black", startx_res, starty_res, `y(${medViewId-1})`, outputValues[medViewId-1]);
        
    }
}

// SSM Rectangle
function createMediumView(medViewId) {

    const blockDim = 45;

    d3.select('#ssm_1_viz_4').selectAll('*').remove();

    const medView = d3.select('#ssm_1_viz_4').append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('position', 'relative')
        .style('top', 0)
        .style('left', 0);

    // Main SSM rectangle
    medView.append("rect")
        .attr("x", 2)
        .attr("y", 2)
        .attr("width", width - 4)
        .attr("height", height - 4)
        .attr("fill", "#ADD8E6")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("rx", 10)
        .attr("ry", 10);

    // SSM label, top right
    medView.append("text")
        .attr("x", width - 20)
        .attr("y", 30)
        .attr("text-anchor", "end")
        .attr("font-size", "16px")
        .attr("font-family", "Arial, sans-serif")
        .attr("fill", "black")
        .text("SSM");
    
    // Exit 
    // Create a square with a cross to return to the previous plot
    const crossGroup = medView.append("g")
        .attr("cursor", "pointer")
        .on("click", function() {
            medView.remove();
            createMainView();
        })
        .on("mouseover", function() {
            d3.select(this).selectAll("rect").attr("fill", "#d3d3d3");
            d3.select(this).selectAll("line").attr("stroke", "#505050");
        })
        .on("mouseout", function() {
            d3.select(this).selectAll("rect").attr("fill", "white");
            d3.select(this).selectAll("line").attr("stroke", "black");
        });

    // Square with rounded edges
    crossGroup.append("rect")
        .attr("x", 8)
        .attr("y", 8)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("rx", 5)
        .attr("ry", 5);

    // Smaller cross inside the square, centered
    crossGroup.append("line")
        .attr("x1", 13)
        .attr("y1", 13)
        .attr("x2", 23)
        .attr("y2", 23)
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    crossGroup.append("line")
        .attr("x1", 23)
        .attr("y1", 13)
        .attr("x2", 13)
        .attr("y2", 23)
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    crossGroup.append("line")
        .attr("x1", 23)
        .attr("y1", 13)
        .attr("x2", 13)
        .attr("y2", 23)
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    // no previous hidden state: A = 0, no h text
    if (medViewId == 1) {
        // ----------------------------- A block
        const ABlockGroup = medView.append("g")
        
        // rectangle
        ABlockGroup.append("rect")
            .attr("x", width / 6)
            .attr("y", height / 2 - blockDim / 2)
            .attr("width", blockDim)
            .attr("height", blockDim)
            .attr("fill", "lightgray")
            .attr("stroke", "gray")
            .attr("stroke-width", 2)
            .attr("rx", 5)
            .attr("ry", 5);

        // Text in top Rectangle
        ABlockGroup.append("text")
            .attr("x", width / 6 + blockDim / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("font-size", "20px")
            .attr("font-weight", "bold")
            .text("0");

        // ----------------------------- B block
        const BBlockGroup = medView.append("g")
            .attr("cursor", "pointer") // Make cursor show clickable
            .on("click", function() {
                createSmallView(medViewId, "B");
            })
            .on("mouseover", function() {
                d3.select(this).select("rect").attr("fill", "#FCB8B0");
            })
            .on("mouseout", function() {
                d3.select(this).select("rect").attr("fill", "#FA8072");
            });

        // rectangle
        BBlockGroup.append("rect")
            .attr("x", width / 2 - blockDim / 2)
            .attr("y", height / 2 - blockDim / 2 - 75)
            .attr("width", blockDim)
            .attr("height", blockDim)
            .attr("fill", "#FA8072")
            .attr("stroke", "#A52A2A")
            .attr("stroke-width", 2)
            .attr("rx", 5)
            .attr("ry", 5);

        // Text in top Rectangle
        BBlockGroup.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2 - 75)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("fill", "black")
            .attr("font-size", "20px")
            .attr("font-weight", "bold")
            .text("B");

        // ----------------------------- C block
        const CBlockGroup = medView.append("g")
            .attr("cursor", "pointer") // Make cursor show clickable
            .on("click", function() {
                createSmallView(medViewId, "C");
            })
            .on("mouseover", function() {
                d3.select(this).select("rect").attr("fill", "#D8BFD8");
            })
            .on("mouseout", function() {
                d3.select(this).select("rect").attr("fill", "#DDA0DD");
            });

        // rectangle
        CBlockGroup.append("rect")
            .attr("x", width / 2 - blockDim / 2)
            .attr("y", height / 2 + blockDim + 5)
            .attr("width", blockDim)
            .attr("height", blockDim)
            .attr("fill", "#DDA0DD")
            .attr("stroke", "#8A2BE2")
            .attr("stroke-width", 2)
            .attr("rx", 5)
            .attr("ry", 5);

        // Text in top Rectangle
        CBlockGroup.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2 + blockDim + 5 + blockDim / 2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("fill", "black")
            .attr("font-size", "20px")
            .attr("font-weight", "bold")
            .text("C");

        // -------------------------- Circle with + symbol (center)
        const plusCircleGroup = medView.append("g")

        const circleRadius = blockDim / 3.5;

        plusCircleGroup.append("circle")
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .attr("r", circleRadius)
            .attr("fill", "#FFFFFF")
            .attr("stroke", "#000000")
            .attr("stroke-width", 2);

        plusCircleGroup.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("dy", "-0.1em")
            .attr("dx", "0.005em")
            .attr("fill", "black")
            .attr("font-size", "25px")
            .text("+");

        // ----------------------------- Arrows

        // Arrow from A to sum circle
        let arrowStart = width / 6 + blockDim;
        let arrowEnd = width / 2 - circleRadius;

        medView.append("line")
            .attr("x1", arrowStart)
            .attr("y1", height / 2)
            .attr("x2", width / 2 - circleRadius)
            .attr("y2", height / 2)
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1);

        medView.append("path")
            .attr("d", `M${arrowEnd - arrowHeadSize},${height / 2 - arrowHeadSize} L${arrowEnd},${height / 2} L${arrowEnd - arrowHeadSize},${height / 2 + arrowHeadSize} Z`)
            .attr("fill", "steelblue");

        // Arrow from sum circle to right of block
        arrowStart = width / 2 + circleRadius;;
        arrowEnd = width - 2;

        medView.append("line")
            .attr("x1", arrowStart)
            .attr("y1", height / 2)
            .attr("x2", arrowEnd)
            .attr("y2", height / 2)
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1);

        medView.append("path")
        .attr("d", `M${arrowEnd - arrowHeadSize},${height / 2 - arrowHeadSize} L${arrowEnd},${height / 2} L${arrowEnd - arrowHeadSize},${height / 2 + arrowHeadSize} Z`)
        .attr("fill", "steelblue");

        // Arrow from top to B (now x is constant)
        arrowStart = 2;
        arrowEnd = height / 2 - blockDim / 2 - 75;

        medView.append("line")
            .attr("x1", width / 2)
            .attr("y1", arrowStart)
            .attr("x2", width / 2)
            .attr("y2", arrowEnd)
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1);

        // Arrow from top to plus circle
        arrowStart = arrowEnd + blockDim;
        arrowEnd = height / 2 - circleRadius;

        medView.append("line")
            .attr("x1", width / 2)
            .attr("y1", arrowStart)
            .attr("x2", width / 2)
            .attr("y2", arrowEnd)
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1);

        medView.append("path")
            .attr("d", `M${width / 2 - arrowHeadSize},${arrowEnd - arrowHeadSize} L${width / 2},${arrowEnd} L${width / 2 + arrowHeadSize},${arrowEnd - arrowHeadSize} Z`)
            .attr("fill", "steelblue");

        // Arrow from plus circle to C
        arrowStart = height / 2 + circleRadius;
        arrowEnd = height / 2 + blockDim + 5;

        medView.append("line")
            .attr("x1", width / 2)
            .attr("y1", arrowStart)
            .attr("x2", width / 2)
            .attr("y2", arrowEnd)
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1);

        // Arrow from C to bottom
        arrowStart = arrowEnd + blockDim;
        arrowEnd = height - 2;

        medView.append("line")
            .attr("x1", width / 2)
            .attr("y1", arrowStart)
            .attr("x2", width / 2)
            .attr("y2", arrowEnd)
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1);

        medView.append("path")
            .attr("d", `M${width / 2 - arrowHeadSize},${arrowEnd - arrowHeadSize} L${width / 2},${arrowEnd} L${width / 2 + arrowHeadSize},${arrowEnd - arrowHeadSize} Z`)
            .attr("fill", "steelblue");

        // ----------------------------- Texts

        // top text (x_t)
        medView.append("text")
            .attr("x", width / 2 + 15)
            .attr("y", height / 2 - 110)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("fill", "black")
            .attr("font-size", "13px")
            .text(`x(${medViewId-1})`);

        // bottom text (y_t)
        medView.append("text")
            .attr("x", width / 2 + 15)
            .attr("y", height / 2 + 104)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("fill", "black")
            .attr("font-size", "13px")
            .text(`y(${medViewId-1})`);

        // right text (h_t+1)
        medView.append("text")
            .attr("x", width - 30)
            .attr("y", height / 2 - 10)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("fill", "black")
            .attr("font-size", "13px")
            .text(`h(${medViewId})`);
    } else {

        // ----------------------------- A block
        const ABlockGroup = medView.append("g")
            .attr("cursor", "pointer") // Make cursor show clickable
            .on("click", function() {
                createSmallView(medViewId, "A");
            })
            .on("mouseover", function() {
                d3.select(this).select("rect").attr("fill", "#AAEEC9");
            })
            .on("mouseout", function() {
                d3.select(this).select("rect").attr("fill", "#31E981");
            });

        // rectangle
        ABlockGroup.append("rect")
            .attr("x", width / 6)
            .attr("y", height / 2 - blockDim / 2)
            .attr("width", blockDim)
            .attr("height", blockDim)
            .attr("fill", "#31E981")
            .attr("stroke", "#11A652")
            .attr("stroke-width", 2)
            .attr("rx", 5)
            .attr("ry", 5);

        // Text in top Rectangle
        ABlockGroup.append("text")
            .attr("x", width / 6 + blockDim / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("fill", "black")
            .attr("font-size", "20px")
            .attr("font-weight", "bold")
            .text("A");

        // ----------------------------- B block
        const BBlockGroup = medView.append("g")
            .attr("cursor", "pointer") // Make cursor show clickable
            .on("click", function() {
                createSmallView(medViewId, "B");
            })
            .on("mouseover", function() {
                d3.select(this).select("rect").attr("fill", "#FCB8B0");
            })
            .on("mouseout", function() {
                d3.select(this).select("rect").attr("fill", "#FA8072");
            });

        // rectangle
        BBlockGroup.append("rect")
            .attr("x", width / 2 - blockDim / 2)
            .attr("y", height / 2 - blockDim / 2 - 75)
            .attr("width", blockDim)
            .attr("height", blockDim)
            .attr("fill", "#FA8072")
            .attr("stroke", "#A52A2A")
            .attr("stroke-width", 2)
            .attr("rx", 5)
            .attr("ry", 5);

        // Text in top Rectangle
        BBlockGroup.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2 - 75)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("fill", "black")
            .attr("font-size", "20px")
            .attr("font-weight", "bold")
            .text("B");

        // ----------------------------- C block
        const CBlockGroup = medView.append("g")
            .attr("cursor", "pointer") // Make cursor show clickable
            .on("click", function() {
                createSmallView(medViewId, "C");
            })
            .on("mouseover", function() {
                d3.select(this).select("rect").attr("fill", "#D8BFD8");
            })
            .on("mouseout", function() {
                d3.select(this).select("rect").attr("fill", "#DDA0DD");
            });

        // rectangle
        CBlockGroup.append("rect")
            .attr("x", width / 2 - blockDim / 2)
            .attr("y", height / 2 + blockDim + 5)
            .attr("width", blockDim)
            .attr("height", blockDim)
            .attr("fill", "#DDA0DD")
            .attr("stroke", "#8A2BE2")
            .attr("stroke-width", 2)
            .attr("rx", 5)
            .attr("ry", 5);

        // Text in top Rectangle
        CBlockGroup.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2 + blockDim + 5 + blockDim / 2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("fill", "black")
            .attr("font-size", "20px")
            .attr("font-weight", "bold")
            .text("C");

        // -------------------------- Circle with + symbol (center)
        const plusCircleGroup = medView.append("g")

        const circleRadius = blockDim / 3.5;

        plusCircleGroup.append("circle")
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .attr("r", circleRadius)
            .attr("fill", "#FFFFFF")
            .attr("stroke", "#000000")
            .attr("stroke-width", 2);

        plusCircleGroup.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("dy", "-0.1em")
            .attr("dx", "0.005em")
            .attr("fill", "black")
            .attr("font-size", "25px")
            .text("+");

        // ----------------------------- Arrows

        // Arrow from left to beginning of A block
        medView.append("line")
            .attr("x1", 0)
            .attr("y1", height / 2)
            .attr("x2", width / 6)
            .attr("y2", height / 2)
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1);

        // Arrow from A to sum circle
        let arrowStart = width / 6 + blockDim;
        let arrowEnd = width / 2 - circleRadius;

        medView.append("line")
            .attr("x1", arrowStart)
            .attr("y1", height / 2)
            .attr("x2", width / 2 - circleRadius)
            .attr("y2", height / 2)
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1);

        medView.append("path")
            .attr("d", `M${arrowEnd - arrowHeadSize},${height / 2 - arrowHeadSize} L${arrowEnd},${height / 2} L${arrowEnd - arrowHeadSize},${height / 2 + arrowHeadSize} Z`)
            .attr("fill", "steelblue");

        // Arrow from sum circle to right of block
        arrowStart = width / 2 + circleRadius;;
        arrowEnd = width - 2;

        medView.append("line")
            .attr("x1", arrowStart)
            .attr("y1", height / 2)
            .attr("x2", arrowEnd)
            .attr("y2", height / 2)
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1);

        medView.append("path")
        .attr("d", `M${arrowEnd - arrowHeadSize},${height / 2 - arrowHeadSize} L${arrowEnd},${height / 2} L${arrowEnd - arrowHeadSize},${height / 2 + arrowHeadSize} Z`)
        .attr("fill", "steelblue");

        // Arrow from top to B (now x is constant)
        arrowStart = 2;
        arrowEnd = height / 2 - blockDim / 2 - 75;

        medView.append("line")
            .attr("x1", width / 2)
            .attr("y1", arrowStart)
            .attr("x2", width / 2)
            .attr("y2", arrowEnd)
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1);

        // Arrow from top to plus circle
        arrowStart = arrowEnd + blockDim;
        arrowEnd = height / 2 - circleRadius;

        medView.append("line")
            .attr("x1", width / 2)
            .attr("y1", arrowStart)
            .attr("x2", width / 2)
            .attr("y2", arrowEnd)
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1);

        medView.append("path")
            .attr("d", `M${width / 2 - arrowHeadSize},${arrowEnd - arrowHeadSize} L${width / 2},${arrowEnd} L${width / 2 + arrowHeadSize},${arrowEnd - arrowHeadSize} Z`)
            .attr("fill", "steelblue");

        // Arrow from plus circle to C
        arrowStart = height / 2 + circleRadius;
        arrowEnd = height / 2 + blockDim + 5;

        medView.append("line")
            .attr("x1", width / 2)
            .attr("y1", arrowStart)
            .attr("x2", width / 2)
            .attr("y2", arrowEnd)
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1);

        // Arrow from C to bottom
        arrowStart = arrowEnd + blockDim;
        arrowEnd = height - 2;

        medView.append("line")
            .attr("x1", width / 2)
            .attr("y1", arrowStart)
            .attr("x2", width / 2)
            .attr("y2", arrowEnd)
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1);

        medView.append("path")
            .attr("d", `M${width / 2 - arrowHeadSize},${arrowEnd - arrowHeadSize} L${width / 2},${arrowEnd} L${width / 2 + arrowHeadSize},${arrowEnd - arrowHeadSize} Z`)
            .attr("fill", "steelblue");

        // ----------------------------- Texts

        // top text (x_t)
        medView.append("text")
            .attr("x", width / 2 + 15)
            .attr("y", height / 2 - 110)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("fill", "black")
            .attr("font-size", "13px")
            .text(`x(${medViewId-1})`);

        // left text (h_t)
        medView.append("text")
            .attr("x", width / 6 - 30)
            .attr("y", height / 2 - 10)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("fill", "black")
            .attr("font-size", "13px")
            .text(`h(${medViewId-1})`);

        // bottom text (y_t)
        medView.append("text")
            .attr("x", width / 2 + 15)
            .attr("y", height / 2 + 104)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("fill", "black")
            .attr("font-size", "13px")
            .text(`y(${medViewId-1})`);

        // right text (h_t+1)
        medView.append("text")
            .attr("x", width - 30)
            .attr("y", height / 2 - 10)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("fill", "black")
            .attr("font-size", "13px")
            .text(`h(${medViewId})`);
    }
}

// ------------------------------
// ------------------------------
// ------------------------------
// MAIN VIEW

function createMainView() {
    const svg = d3.select('#ssm_1_viz_4').append('svg')
        .attr('width', width)
        .attr('height', height);

    for (let i = 0; i < totalBlocks; i++) {
        // Calculate the start x position of each block's third
        let thirdWidth = width / totalBlocks;
        // Centering the block inside its third
        let x = (thirdWidth * i) + (thirdWidth / 2) - (blockWidth / 2);

        svg.append("rect")
            .attr("x", x)
            .attr("y", (height / 2) - (blockHeight / 2))
            .attr("width", blockWidth)
            .attr("height", blockHeight)
            .attr("fill", "#ADD8E6")
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("rx", 10)
            .attr("ry", 10)
            .attr("cursor", "pointer") // Make cursor show clickable
            .on("mouseover", function() {
                d3.select(this).attr("fill", "#87CEEB"); // Lighter blue on hover
            })
            .on("mouseout", function() {
                d3.select(this).attr("fill", "#ADD8E6"); // Original color when not hovering
            })
            .on("click", function() {
                createMediumView(i+1);
            });

        // Text in Bottom Rectangle
        svg.append("text")
            .attr("x", x + blockWidth / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("fill", "black")
            .attr("cursor", "pointer") // Make cursor show clickable
            .text("SSM")
            .on("click", function() {
                createMediumView(i+1);
            });

        // Small Top Rectangle
        let smallX = x + (blockWidth / 2) - (smallBlockWidth / 2);
        let smallY = (height / 2) - (blockHeight / 2) - smallBlockHeight - inputBlockOffset;
        svg.append("rect")
            .attr("x", smallX)
            .attr("y", smallY)
            .attr("width", smallBlockWidth)
            .attr("height", smallBlockHeight)
            .attr("fill", "#dbdad5") // very light gray 
            .attr("stroke", "gray")
            .attr("stroke-width", 1)
            .attr("rx", 5)
            .attr("ry", 5);

        // Text in top Rectangle
        svg.append("text")
            .attr("x", smallX + smallBlockWidth / 2)
            .attr("y", smallY + smallBlockHeight / 2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("fill", "black")
            .text(inputValues[i]);

        // Arrow from Small Rectangle to Bottom Rectangle
        let arrowStartY = smallY + smallBlockHeight;
        let arrowEndY = (height / 2) - (blockHeight / 2);

        svg.append("line")
            .attr("x1", smallX + (smallBlockWidth / 2))
            .attr("y1", arrowStartY)
            .attr("x2", smallX + (smallBlockWidth / 2))
            .attr("y2", arrowEndY)
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1);

        svg.append("path")
            .attr("d", `M${smallX + (smallBlockWidth / 2)},${arrowEndY} L${smallX + (smallBlockWidth / 2) - 5},${arrowEndY - 5} L${smallX + (smallBlockWidth / 2) + 5},${arrowEndY - 5} Z`)
            .attr("fill", "steelblue");

        // Arrow between blocks
        let arrowStart = x + blockWidth;
        let arrowEnd = arrowStart + thirdWidth - blockWidth;

        svg.append("line")
            .attr("x1", arrowStart)
            .attr("y1", height / 2)
            .attr("x2", arrowEnd)
            .attr("y2", height / 2)
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1);

        svg.append("path")
            .attr("d", `M${arrowEnd},${height / 2} L${arrowEnd - 5},${height / 2 - 5} L${arrowEnd - 5},${height / 2 + 5} Z`)
            .attr("class", "arrow")
            .attr("fill", "steelblue");

        if (i == totalBlocks - 1) {
            svg.append("text")
            .attr("x", arrowStart + 15)
            .attr("y", (height / 2) - 15)
            .attr("dy", ".35em")
            .text("...");
        }

        // Small Bottom Rectangle
        let smallBottomY = (height / 2) + (blockHeight / 2) + inputBlockOffset;
        svg.append("rect")
            .attr("x", smallX)
            .attr("y", smallBottomY)
            .attr("width", smallBlockWidth)
            .attr("height", smallBlockHeight)
            .attr("fill", "#dbdad5")
            .attr("stroke", "gray")
            .attr("stroke-width", 1)
            .attr("rx", 5)
            .attr("ry", 5);

        // Arrow from Main Rectangle to Small Bottom Rectangle
        let arrowBottomStartY = (height / 2) + (blockHeight / 2);
        let arrowBottomEndY = smallBottomY;
        svg.append("line")
            .attr("x1", smallX + (smallBlockWidth / 2))
            .attr("y1", arrowBottomStartY)
            .attr("x2", smallX + (smallBlockWidth / 2))
            .attr("y2", arrowBottomEndY)
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1);

        svg.append("path")
            .attr("d", `M${smallX + (smallBlockWidth / 2)},${arrowBottomEndY} L${smallX + (smallBlockWidth / 2) - 5},${arrowBottomEndY - 5} L${smallX + (smallBlockWidth / 2) + 5},${arrowBottomEndY - 5} Z`)
            .attr("fill", "steelblue");

        // Text in bottom Rectangle
        svg.append("text")
            .attr("x", smallX + smallBlockWidth / 2)
            .attr("y", smallBottomY + smallBlockHeight / 2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("fill", "black")
            .text(outputValues[i]);

        // hidden state texts
        if (i == 0 || i == 1) {
            svg.append("text")
                .attr("x", x + blockWidth + blockWidth / 2 - 5)
                .attr("y", (height / 2) - 10)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "central")
                .attr("fill", "black")
                .attr("font-size", "14px")  // Added to make text smaller
                .text(`h(${i+1})`);
        }
    }
}
