const d3 = require('d3');
const setting = require('../script/Setting');
const util = require('../script/Utility');

// The largest node for each cluster.
var clusters = new Array(setting.clusterNumber),
    dataPoints = createSusceptedDataPoints(setting.totalNumber),
    people = [0, 0, 0],
    params = [setting.parameters.alpha, setting.parameters.beta, setting.parameters.gamma]

var force = d3.layout.force()
    .nodes(dataPoints)
    .size([setting.width, setting.height])
    .gravity(.02)
    .charge(0)
    .on("tick", tick)
    .start()

function createDataPoints(n) {
    return d3.range(n).map(() => {
        let i = Math.floor(Math.random() * setting.clusterNumber),
            r = setting.maxRadius,
            node = {
                cluster: i,
                radius: r
            };
        if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = node;
        people[i]++;
        return node;
    });
}

function createSusceptedDataPoints(n) {
    people = [n, 0, 0];
    let array = d3.range(n).map(() => {
        let node = {
            cluster: 0,
            radius: setting.maxRadius
        };
        return node;
    })
    clusters[0] = array[0];
    return array;
}

function tick(e) {
    circle
        .each(cluster(10 * e.alpha * e.alpha))
        .each(collide(.5))
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
}

// Move d to be adjacent to the cluster node.
function cluster(alpha) {
    return function (d) {
        var cluster = clusters[d.cluster];
        if (cluster === d) return;
        var x = d.x - cluster.x,
            y = d.y - cluster.y,
            l = Math.sqrt(x * x + y * y),
            r = d.radius + cluster.radius;
        if (l != r) {
            l = (l - r) / l * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            cluster.x += x;
            cluster.y += y;
        }
    };
}

// Resolves collisions between d and all other circles.
function collide(alpha) {
    var quadtree = d3.geom.quadtree(dataPoints);
    return function (d) {
        var r = d.radius + setting.maxRadius +
            Math.max(setting.padding, setting.clusterPadding),
            nx1 = d.x - r,
            nx2 = d.x + r,
            ny1 = d.y - r,
            ny2 = d.y + r;
        quadtree.visit((quad, x1, y1, x2, y2) => {
            if (quad.point && (quad.point !== d)) {
                var x = d.x - quad.point.x,
                    y = d.y - quad.point.y,
                    l = Math.sqrt(x * x + y * y),
                    r = d.radius + quad.point.radius +
                        (d.cluster === quad.point.cluster ?
                            setting.padding : setting.clusterPadding);
                if (l < r) {
                    l = (l - r) / l * alpha;
                    d.x -= x *= l;
                    d.y -= y *= l;
                    quad.point.x += x;
                    quad.point.y += y;
                }
            }
            return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });
    };
}

function redrawCircle(circle) {
    circle.style(
        'fill', d => color(d.cluster)
    )
}

function updateDataPoints(type) {
    let changed = 0,
        total = Math.floor(people[type] * params[type]),
        index = Math.floor(Math.random() * setting.totalNumber),
        largestCluster = clusters[0],
        previousType = util.previousType(type),
        nextType = util.nextType(type)
    while (changed < total) {
        if (people[type] <= 0) break;
        if (index >= setting.totalNumber) index = 0;
        let thisNode = dataPoints[index++];
        if (thisNode.cluster != previousType || thisNode === largestCluster) continue;
        thisNode.cluster = type;
        people[previousType]--;
        people[type]++;
        changed++;
    }
    return dataPoints;
}

function getPeople() {
    console.log(people)
    return people;
}

module.exports = {
    clusters: clusters,
    dataPoints: dataPoints,
    forceLayout: force,
    updatePeopleData:getPeople,
    updateDataPoints: updateDataPoints,
    updateCircle: redrawCircle
};