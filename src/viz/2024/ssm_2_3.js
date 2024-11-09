const width = 500;
const height = 300;

createMainView();

function createMainView() {

    const vizCanvas = d3.select('#ssm_2_viz_3').append('svg')
        .attr('width', width)
        .attr('height', height);

    const blockWidth = width / 10;

    const xStart = width / 2 - blockWidth * 4.5;
    const yStart = height / 2 - blockWidth / 2;

    const horizontalPadding = blockWidth;
    const verticalPadding = blockWidth + blockWidth / 4;

    // ------------------------- X

    vizCanvas.append('rect')
        .attr("id", "00")
        .attr("x", xStart)
        .attr("y", yStart)
        .attr("width", blockWidth)
        .attr("height", blockWidth)
        .attr("fill", "gray")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("rx", 10)
        .attr("ry", 10);

    vizCanvas.append("text")
        .attr("x", xStart + blockWidth / 2)
        .attr("y", yStart + blockWidth / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-family", "Arial, sans-serif")
        .attr("fill", "black")
        .text("0");

    vizCanvas.append('rect')
        .attr("id", "01")
        .attr("x", xStart + blockWidth * 1 + horizontalPadding)
        .attr("y", yStart)
        .attr("width", blockWidth)
        .attr("height", blockWidth)
        .attr("fill", "gray")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("rx", 10)
        .attr("ry", 10);

    vizCanvas.append("text")
        .attr("x", xStart + blockWidth * 1 + horizontalPadding + blockWidth / 2)
        .attr("y", yStart + blockWidth / 2) // Adjust this value as needed for spacing
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-family", "Arial, sans-serif")
        .attr("fill", "black")
        .text("0");

    vizCanvas.append('rect')
        .attr("id", "x1")
        .attr("x", xStart + blockWidth * 3 + horizontalPadding)
        .attr("y", yStart)
        .attr("width", blockWidth)
        .attr("height", blockWidth)
        .attr("fill", "#ADD8E6")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("rx", 10)
        .attr("ry", 10);

    vizCanvas.append("text")
        .attr("x", xStart + blockWidth * 3 + horizontalPadding + blockWidth / 2)
        .attr("y", yStart + blockWidth / 2) // Adjust this value as needed for spacing
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-family", "Arial, sans-serif")
        .attr("fill", "black")
        .text("A");
        
    vizCanvas.append('rect')
        .attr("id", "x2")
        .attr("x", xStart + blockWidth * 5 + horizontalPadding)
        .attr("y", yStart)
        .attr("width", blockWidth)
        .attr("height", blockWidth)
        .attr("fill", "#ADD8E6")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("rx", 10)
        .attr("ry", 10);

    vizCanvas.append("text")
        .attr("x", xStart + blockWidth * 5 + horizontalPadding + blockWidth / 2)
        .attr("y", yStart + blockWidth / 2) // Adjust this value as needed for spacing
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-family", "Arial, sans-serif")
        .attr("fill", "black")
        .text("nice");

    vizCanvas.append('rect')
        .attr("id", "x2")
        .attr("x", xStart + blockWidth * 7 + horizontalPadding)
        .attr("y", yStart)
        .attr("width", blockWidth)
        .attr("height", blockWidth)
        .attr("fill", "#ADD8E6")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("rx", 10)
        .attr("ry", 10);

    vizCanvas.append("text")
        .attr("x", xStart + blockWidth * 7 + horizontalPadding + blockWidth / 2)
        .attr("y", yStart + blockWidth / 2) // Adjust this value as needed for spacing
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-family", "Arial, sans-serif")
        .attr("fill", "black")
        .text("cat");
    
    // ------------------------- Y

    selectedY = "y1";

    vizCanvas.append('rect')
        .attr("id", "y1")
        .attr("x", xStart + blockWidth * 3 + horizontalPadding)
        .attr("y", yStart + blockWidth + verticalPadding)
        .attr("width", blockWidth)
        .attr("height", blockWidth)
        .attr("fill", "#D6F49D")
        .attr("stroke", "#878C8F")
        .attr("stroke-width", 3)
        .attr("rx", 10)
        .attr("ry", 10)
        .style("cursor", "pointer")
        .on("mouseover", function() { 
            d3.select(this)
                .attr("fill", "#D6F49D")
                .attr("stroke", "#878C8F")
                .attr("stroke-width", 3);
        })
        .on("mouseout", function() { 
            if (selectedY !== "y1") {
                d3.select(this)
                    .attr("fill", "#ADD8E6")
                    .attr("stroke", "black")
                    .attr("stroke-width", 2);
            }
        })
        .on("mousedown", function() { d3.select(this).attr("fill", "#4682B4"); })
        .on("mouseup", function() { d3.select(this).attr("fill", "#87CEEB"); })
        .on("click", function() { handleClick("y1"); });

    vizCanvas.append("text")
        .attr("x", xStart + blockWidth * 3 + horizontalPadding + blockWidth / 2)
        .attr("y", yStart + blockWidth + verticalPadding + blockWidth / 2) // Adjust this value as needed for spacing
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-family", "Arial, sans-serif")
        .attr("fill", "black")
        .text("y1")
        .style("cursor", "pointer")
        .on("click", function() { handleClick("y1"); });
        
    vizCanvas.append('rect')
        .attr("id", "y2")
        .attr("x", xStart + blockWidth * 5 + horizontalPadding)
        .attr("y", yStart + blockWidth + verticalPadding)
        .attr("width", blockWidth)
        .attr("height", blockWidth)
        .attr("fill", "#ADD8E6")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("rx", 10)
        .attr("ry", 10)
        .style("cursor", "pointer")
        .on("mouseover", function() { 
            d3.select(this)
                .attr("fill", "#D6F49D")
                .attr("stroke", "#878C8F")
                .attr("stroke-width", 3);
        })
        .on("mouseout", function() { 
            if (selectedY !== "y2") {
                d3.select(this)
                    .attr("fill", "#ADD8E6")
                    .attr("stroke", "black")
                    .attr("stroke-width", 2);
            }
        })
        .on("mousedown", function() { d3.select(this).attr("fill", "#4682B4"); })
        .on("mouseup", function() { d3.select(this).attr("fill", "#87CEEB"); })
        .on("click", function() { handleClick("y2"); });

    vizCanvas.append("text")
        .attr("x", xStart + blockWidth * 5 + horizontalPadding + blockWidth / 2)
        .attr("y", yStart + blockWidth + verticalPadding + blockWidth / 2) // Adjust this value as needed for spacing
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-family", "Arial, sans-serif")
        .attr("fill", "black")
        .text("y2")
        .style("cursor", "pointer")
        .on("click", function() { handleClick("y2"); });

    vizCanvas.append('rect')
        .attr("id", "y3")
        .attr("x", xStart + blockWidth * 7 + horizontalPadding)
        .attr("y", yStart + blockWidth + verticalPadding)
        .attr("width", blockWidth)
        .attr("height", blockWidth)
        .attr("fill", "#ADD8E6")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("rx", 10)
        .attr("ry", 10)
        .style("cursor", "pointer")
        .on("mouseover", function() { 
            d3.select(this)
                .attr("fill", "#D6F49D")
                .attr("stroke", "#878C8F")
                .attr("stroke-width", 3);
        })
        .on("mouseout", function() { 
            if (selectedY !== "y3") {
                d3.select(this)
                    .attr("fill", "#ADD8E6")
                    .attr("stroke", "black")
                    .attr("stroke-width", 2);
            }
        })
        .on("mousedown", function() { d3.select(this).attr("fill", "#4682B4"); })
        .on("mouseup", function() { d3.select(this).attr("fill", "#87CEEB"); })
        .on("click", function() { handleClick("y3"); });

    vizCanvas.append("text")
        .attr("x", xStart + blockWidth * 7 + horizontalPadding + blockWidth / 2)
        .attr("y", yStart + blockWidth + verticalPadding + blockWidth / 2) // Adjust this value as needed for spacing
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-family", "Arial, sans-serif")
        .attr("fill", "black")
        .text("y3")
        .style("cursor", "pointer")
        .on("click", function() { handleClick("y3"); });

    // --------------------------------------- X to Y arrows

    lineStartX = xStart + blockWidth / 2;
    lineStartY = yStart + blockWidth;
    lineEndX = xStart + blockWidth * 3 + horizontalPadding + blockWidth / 2;
    lineEndY = yStart + blockWidth + verticalPadding;

    // to y1
    createArrow(vizCanvas, "arrow_00_y1", lineStartX, lineEndX, lineStartY, lineEndY);
    createArrow(vizCanvas, "arrow_01_y1", lineStartX + blockWidth * 2, lineEndX, lineStartY, lineEndY);
    createArrow(vizCanvas, "arrow_a_y1", lineStartX + blockWidth*4, lineEndX, lineStartY, lineEndY);

    // to y2
    createArrow(vizCanvas, "arrow_01_y2", lineStartX + blockWidth * 2, lineEndX + blockWidth * 2, lineStartY, lineEndY);
    createArrow(vizCanvas, "arrow_a_y2", lineStartX + blockWidth * 4, lineEndX + blockWidth * 2, lineStartY, lineEndY);
    createArrow(vizCanvas, "arrow_nice_y2", lineStartX + blockWidth * 6, lineEndX + blockWidth * 2, lineStartY, lineEndY);

    // to y3
    createArrow(vizCanvas, "arrow_a_y3", lineStartX + blockWidth*4, lineEndX + blockWidth*4, lineStartY, lineEndY);
    createArrow(vizCanvas, "arrow_nice_y3", lineStartX + blockWidth*6, lineEndX + blockWidth*4, lineStartY, lineEndY);
    createArrow(vizCanvas, "arrow_cat_y3", lineStartX + blockWidth*8, lineEndX + blockWidth*4, lineStartY, lineEndY);

    // kernel 1
    createKernel(vizCanvas, xStart, yStart - blockWidth - verticalPadding, "kernel_1", blockWidth, horizontalPadding, verticalPadding);

    // kernel 2
    createKernel(vizCanvas, xStart + blockWidth*2, yStart - blockWidth - verticalPadding, "kernel_2", blockWidth, horizontalPadding, verticalPadding);

    // kernel 3
    createKernel(vizCanvas, xStart + blockWidth*4, yStart - blockWidth - verticalPadding, "kernel_3", blockWidth, horizontalPadding, verticalPadding);

    // set default to y1
    handleClick("y1");
}

function hideKernel(id) {
    // hide kernels
    d3.select(`#kernel_${id}_1`).attr("visibility", "hidden");
    d3.select(`#kernel_${id}_2`).attr("visibility", "hidden");
    d3.select(`#kernel_${id}_3`).attr("visibility", "hidden");

    // hide kernel lines
    d3.select(`#kernel_${id}_arrow_1`).attr("visibility", "hidden");
    d3.select(`#kernel_${id}_arrow_2`).attr("visibility", "hidden");
    d3.select(`#kernel_${id}_arrow_3`).attr("visibility", "hidden");

    // hide arrow shapes
    d3.select(`#kernel_${id}_arrow_1_marker`).attr("visibility", "hidden");
    d3.select(`#kernel_${id}_arrow_2_marker`).attr("visibility", "hidden");
    d3.select(`#kernel_${id}_arrow_3_marker`).attr("visibility", "hidden");

    // hide kernel text
    d3.select(`#kernel_${id}_1_text`).attr("visibility", "hidden");
    d3.select(`#kernel_${id}_2_text`).attr("visibility", "hidden");
    d3.select(`#kernel_${id}_3_text`).attr("visibility", "hidden");
}

function showKernel(id) {
    // show kernels
    d3.select(`#kernel_${id}_1`).attr("visibility", "visible");
    d3.select(`#kernel_${id}_2`).attr("visibility", "visible");
    d3.select(`#kernel_${id}_3`).attr("visibility", "visible");

    // show kernel lines
    d3.select(`#kernel_${id}_arrow_1`).attr("visibility", "visible");
    d3.select(`#kernel_${id}_arrow_2`).attr("visibility", "visible");
    d3.select(`#kernel_${id}_arrow_3`).attr("visibility", "visible");

    // show arrow shapes
    d3.select(`#kernel_${id}_arrow_1_marker`).attr("visibility", "visible");
    d3.select(`#kernel_${id}_arrow_2_marker`).attr("visibility", "visible");
    d3.select(`#kernel_${id}_arrow_3_marker`).attr("visibility", "visible");

    // show kernel text
    d3.select(`#kernel_${id}_1_text`).attr("visibility", "visible");
    d3.select(`#kernel_${id}_2_text`).attr("visibility", "visible");
    d3.select(`#kernel_${id}_3_text`).attr("visibility", "visible");
}

function setColor(id) {

    if (id === "y1") {
        // put color
        d3.select("#y1")
            .attr("fill", "#D6F49D")
            .attr("stroke", "#878C8F")
            .attr("stroke-width", 3);

        // remove color from others
        d3.select("#y2")
            .attr("fill", "#ADD8E6")
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        d3.select("#y3")
            .attr("fill", "#ADD8E6")
            .attr("stroke", "black")
            .attr("stroke-width", 2);
    } else if (id === "y2") {
        // put color
        d3.select("#y2")
            .attr("fill", "#D6F49D")
            .attr("stroke", "#878C8F")
            .attr("stroke-width", 3);

        // remove color from others
        d3.select("#y1")
            .attr("fill", "#ADD8E6")
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        d3.select("#y3")
            .attr("fill", "#ADD8E6")
            .attr("stroke", "black")
            .attr("stroke-width", 2);
    } else if (id === "y3") {
        // put color
        d3.select("#y3")
            .attr("fill", "#D6F49D")
            .attr("stroke", "#878C8F")
            .attr("stroke-width", 3);

        // remove color from others
        d3.select("#y1")
            .attr("fill", "#ADD8E6")
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        d3.select("#y2")
            .attr("fill", "#ADD8E6")
            .attr("stroke", "black")
            .attr("stroke-width", 2);
    }
}

function handleClick(id) {
    if (id === "y1") {
        // hide x to y lines
        d3.select(`#arrow_01_y2`).attr("visibility", "hidden");

        d3.select(`#arrow_a_y2`).attr("visibility", "hidden");
        d3.select(`#arrow_a_y3`).attr("visibility", "hidden");

        d3.select(`#arrow_nice_y2`).attr("visibility", "hidden");
        d3.select(`#arrow_nice_y3`).attr("visibility", "hidden");

        d3.select(`#arrow_cat_y3`).attr("visibility", "hidden");

        // show x to y lines
        d3.select(`#arrow_00_y1`).attr("visibility", "visible");
        d3.select(`#arrow_01_y1`).attr("visibility", "visible");
        d3.select(`#arrow_a_y1`).attr("visibility", "visible");

        // hide kernels
        hideKernel(2);
        hideKernel(3);

        // show kernels
        showKernel(1);

        setColor("y1");

        selectedY = "y1";
    }

    if (id === "y2") {
        // hide x to y lines
        d3.select(`#arrow_00_y1`).attr("visibility", "hidden");
        d3.select(`#arrow_01_y1`).attr("visibility", "hidden");

        d3.select(`#arrow_a_y1`).attr("visibility", "hidden");
        d3.select(`#arrow_a_y3`).attr("visibility", "hidden");

        d3.select(`#arrow_nice_y3`).attr("visibility", "hidden");

        d3.select(`#arrow_cat_y3`).attr("visibility", "hidden");

        // show x to y lines
        d3.select(`#arrow_01_y2`).attr("visibility", "visible");
        d3.select(`#arrow_a_y2`).attr("visibility", "visible");
        d3.select(`#arrow_nice_y2`).attr("visibility", "visible");

        // hide kernels
        hideKernel(1);
        hideKernel(3);

        // show kernels
        showKernel(2);
        
        setColor("y2");

        selectedY = "y2";
    } 

    if (id === "y3") {
        // hide x to y lines
        d3.select(`#arrow_00_y1`).attr("visibility", "hidden");
        d3.select(`#arrow_01_y1`).attr("visibility", "hidden");
        d3.select(`#arrow_01_y2`).attr("visibility", "hidden");

        d3.select(`#arrow_a_y1`).attr("visibility", "hidden");
        d3.select(`#arrow_a_y2`).attr("visibility", "hidden");

        d3.select(`#arrow_nice_y2`).attr("visibility", "hidden");

        // show x to y lines
        d3.select(`#arrow_a_y3`).attr("visibility", "visible");
        d3.select(`#arrow_nice_y3`).attr("visibility", "visible");
        d3.select(`#arrow_cat_y3`).attr("visibility", "visible");

        // hide kernels
        hideKernel(1);
        hideKernel(2);

        // show kernels
        showKernel(3);

        setColor("y3");

        selectedY = "y3";
    }
}

function createArrow(canvas, id, x1, x2, y1, y2, endMarker = false) {
    canvas.append("line")
        .attr("id", id)
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", "#b1d7dd")
        .attr("stroke-width", 3);

    markerSize = 7;

    if (endMarker) {
        canvas.append("path")
            .attr("id", `${id}_marker`)
            .attr("d", `M${x2},${y2} L${x2 - markerSize},${y2 - markerSize} L${x2 + markerSize},${y2 - markerSize} L${x2},${y2} Z`)
            .attr("fill", "#7dbdc7");
    }
}

function createKernel(vizCanvas, startPosX, startPosY, id_prefix, blockWidth, horizontalPadding, verticalPadding) {
    vizCanvas.append('rect')
    .attr("id", `${id_prefix}_1`)
    .attr("x", startPosX)
    .attr("y", startPosY)
    .attr("width", blockWidth)
    .attr("height", blockWidth)
    .attr("fill", "#ADD8E6")
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("rx", 10)
    .attr("ry", 10);

vizCanvas.append("text")
    .attr("id", `${id_prefix}_1_text`)
    .attr("x", startPosX + blockWidth / 2)
    .attr("y", startPosY + blockWidth / 2) // Adjust this value as needed for spacing
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("font-family", "Arial, sans-serif")
    .attr("fill", "black")
    .text("K(1)");
    
vizCanvas.append('rect')
    .attr("id", `${id_prefix}_2`)
    .attr("x", startPosX + blockWidth + horizontalPadding)
    .attr("y", startPosY)
    .attr("width", blockWidth)
    .attr("height", blockWidth)
    .attr("fill", "#ADD8E6")
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("rx", 10)
    .attr("ry", 10);

vizCanvas.append("text")
    .attr("id", `${id_prefix}_2_text`)
    .attr("x", startPosX + blockWidth + horizontalPadding + blockWidth / 2)
    .attr("y", startPosY + blockWidth / 2) // Adjust this value as needed for spacing
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("font-family", "Arial, sans-serif")
    .attr("fill", "black")
    .text("K(2)");

vizCanvas.append('rect')
    .attr("id", `${id_prefix}_3`)
    .attr("x", startPosX + blockWidth * 2 + horizontalPadding * 2)
    .attr("y", startPosY)
    .attr("width", blockWidth)
    .attr("height", blockWidth)
    .attr("fill", "#ADD8E6")
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("rx", 10)
    .attr("ry", 10);

vizCanvas.append("text")
    .attr("id", `${id_prefix}_3_text`)
    .attr("x", startPosX + blockWidth * 2 + horizontalPadding * 2 + blockWidth / 2)
    .attr("y", startPosY + blockWidth / 2) // Adjust this value as needed for spacing
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("font-family", "Arial, sans-serif")
    .attr("fill", "black")
    .text("K(3)");


    lineStartX = startPosX + blockWidth / 2;
    lineStartY = startPosY + blockWidth;
    lineEndX = lineStartX;
    lineEndY = startPosY + blockWidth + verticalPadding;

    createArrow(vizCanvas, `${id_prefix}_arrow_1`, lineStartX, lineEndX, lineStartY, lineEndY, true);
    createArrow(vizCanvas, `${id_prefix}_arrow_2`, lineStartX + blockWidth*2, lineEndX + blockWidth*2, lineStartY, lineEndY, true);
    createArrow(vizCanvas, `${id_prefix}_arrow_3`, lineStartX + blockWidth*4, lineEndX + blockWidth*4, lineStartY, lineEndY, true);


}