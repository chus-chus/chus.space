import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm";
                        
const plot2 = Plot.rectY({length: 10000}, Plot.binX({y: "count"}, {x: Math.random})).plot();
const plot3 = Plot.rectY({length: 10000}, Plot.binX({y: "count"}, {x: Math.random})).plot();

const divplot2 = document.querySelector("#plot2");
divplot2.append(plot2);
divplot2.append(plot3);