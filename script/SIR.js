const d3 = require('d3');
const config = require('../script/Config');
var core = require('../script/Visualize');

var clusters = core.clusters,
    dataPoints = core.dataPoints,
    color = config.color,
    params = [config.parameters.alpha, config.parameters.beta, config.parameters.gamma]

var svg = d3.select("svg")
    .attr("width", config.width)
    .attr("height", config.height)

var circle = svg.selectAll("circle")
    .data(dataPoints)
    .enter().append("circle")
    .attr("r", d => d.radius)
    .style({
        "fill": d => color(d.cluster),
        "stroke": "#000",
        "stroke-width": "1px"
    })
    .call(core.forceLayout.drag)

function becomeInfect() {
    dataPoints = core.updateDataPoints(1, params[0]);
    core.updateCircle(circle);
    updateViewData();
    setTimeout(becomeRecover, config.intervalTimeMS.toRecover);
}

function becomeRecover() {
    dataPoints = core.updateDataPoints(2, params[1]);
    core.updateCircle(circle);
    updateViewData();
    setTimeout(becomeInfect, config.intervalTimeMS.toInfect);
}

function updateViewData() {
    d3.select('#total').text(config.totalNumber)
    d3.select('#susceptible').text(core.people[0]).style("color", color(0))
    d3.select('#infectious').text(core.people[1]).style("color", color(1))
    d3.select('#recovered').text(core.people[2]).style("color", color(2))
    d3.select('#alpha').text(config.parameters.alpha)
    d3.select('#beta').text(config.parameters.beta)
    d3.select('#gamma').text(config.parameters.gamma)
}

updateViewData();
setTimeout(function () {
    becomeInfect();
}, config.intervalTimeMS.toInfect + 2000);