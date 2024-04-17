var fileName = "../DATA/sample.csv";
var categoryFields = ["Transportation", "Food", "Fashion", "Leisure", "Health", "Home"];
var piechartFields = ["legitimate_count", "fraudulent_count"];

d3.csv(fileName, function (error, data) {
    var barGraph = {};
    var piechartMap = {};
    //console.log(data)
    data.forEach(function (d) {
        var customerId = d.customer_id;
        barGraph[customerId] = [];
        piechartMap[customerId] = [];

        // { customerIdName: [ bar1Val, bar2Val, ... ] }
        categoryFields.forEach(function (field) {
            barGraph[customerId].push(+d[field]);
        });

        piechartFields.forEach(function (field) {
            piechartMap[customerId].push(+d[field]);
        });

    });
    makeVis(barGraph, piechartMap);

});

var makeVis = function (barGraph, piechartMap) {
    // Define dimensions of vis
    var margin = {
            top: 0,
            right: 50,
            bottom: 30,
            left: 50
        },
        width = 550 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;
// var img = {src: "/swm.jpeg", alt: "nbgadjhdk,"};

    // Make x scale
    var xScale = d3.scale.ordinal()
        .domain(categoryFields)
        .rangeRoundBands([0, width], 0.1);

    // Make y scale, the domain will be defined on bar update
    var yScale = d3.scale.linear()
        .range([height, 0]);

    // Create canvas
    var canvas = d3.select("#vis-container")
        .append("svg")
        // .attr("width", width + margin.left + margin.right)
        // .attr("viewbox", "500 50 5000 5000")
        .attr("width", 600)
        // .attr("height", height + margin.top + margin.bottom)
        .attr("height", 400)
        .append("g")
        // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        // .attr("transform", "translate(" + 800 + "," + 450 + ")");
        .attr("transform", "translate(" + 50 + "," + 100 + ")");

    canvas.append("text")
        .text("Distribution of transactions by category")
        .attr("x", 220)
        .attr("y", -15)
        .attr("font-family", "sans-serif")
        .attr("font-size", "16px")
        .style("text-anchor", "middle");

    // canvas.append("text")
    //     .text("CUSTOMER PROFILE DASHBOARD")
    //     .attr("x", 620)
    //     .attr("y", -68)
    //     .attr("font-family", "sans-serif")
    //     .attr("font-size", "26px")
    //     .style("text-anchor", "middle");

    // var imgs = canvas.selectAll("image").data([0]);
    // imgs.enter()
    //     .append("svg:image")
    //     .attr("xlink:href", "/app/swm.jpeg")
    //     .attr("x", "500")
    //     .attr("y", "80")
    //     .attr("width", "400")
    //     .attr("height", "400");

    // Make x-axis and add to canvas
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom");

    canvas.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Make y-axis and add to canvas
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");

    var yAxisHandleForUpdate = canvas.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    yAxisHandleForUpdate.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -45)
        .attr("x", -90)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Value");

    var updateBars = function (data) {
        // First update the y-axis domain to match data
        yScale.domain(d3.extent(data));
        yAxisHandleForUpdate.call(yAxis);

        var bars = canvas.selectAll(".bar").data(data);

        // Add bars for new data
        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", function (d, i) {
                return xScale(categoryFields[i]);
            })
            .attr("width", xScale.rangeBand())
            .attr("y", function (d, i) {
                return yScale(d);
            })
            .attr("height", function (d, i) {
                return height - yScale(d);
            });

        // Update old ones, already have x / width from before
        bars
            .transition().duration(250)
            .attr("y", function (d, i) {
                return yScale(d);
            })
            .attr("height", function (d, i) {
                return height - yScale(d);
            });

        // Remove old ones
        bars.exit().remove();
    };

    // Handler for dropdown value change
    var dropdownChange = function () {
        var newcustomerId = d3.select(this).property('value'),
            newData = barGraph[newcustomerId];

        updateBars(newData);

        //update pie chart
        var newpiedata = {Legitimate: piechartMap[newcustomerId][0], Fraudulent: piechartMap[newcustomerId][1]};
        console.log(newpiedata);
        piechart.draw(newpiedata);
    };

    // Get names of customerIds, for dropdown
    var customerIds = Object.keys(barGraph).sort();

    var dropdown = d3.select("#vis-dropdown")
        .insert("select", "svg")
        .on("change", dropdownChange);
    // dropdown.append("g")
    //     .attr("transform", "translate(" + 850 + "," + 250 + ")");

    dropdown.selectAll("option")
        .data(customerIds)
        .enter().append("option")
        .attr("value", function (d) {
            return d;
        })
        .text(function (d) {
            return d; // capitalize 1st letter
        });

    var initialData = barGraph[customerIds[0]];
    updateBars(initialData);


    //initial pie chart
    var piedata = {Legitimate: piechartMap[customerIds[0]][0], Fraudulent: piechartMap[customerIds[0]][1]};
    piechart = new pie_chart(d3.select('.center'), piedata);

};

function pie_chart(svg, data) {

    this.svg = svg;

    var margin = 40,
        width = 450,
        height = 450;
    pie_width = 300;
    pie_height = 300;

    var radius = Math.min(pie_width, pie_height) / 2 - margin;


    this.draw = function (data) {

        d3.select('.center').selectAll("*").remove();

        var svg = this.svg.append("svg")
            .attr("width", width)
            .attr("height", height);


        svg.append("text")
            .text("Distribution of Transactions")
            .attr("x", 120)
            .attr("y", 12)
            .attr("font-family", "sans-serif")
            .attr("font-size", "16px")
            .style("text-anchor", "middle");


        var color = d3.scale.ordinal()
            .domain(["Legitimate", "Fraudulent"])
            .range(["#008000", "#FF0000"])

        piesvg = svg.append("g")
            .attr("transform", "translate(" + 110+ "," + 150 + ")");

        var pie_fn = d3.layout.pie();

        var path = d3.svg.arc()
            .outerRadius(radius)
            .innerRadius(0);

        var label = d3.svg.arc()
            .outerRadius(radius)
            .innerRadius(radius - 80);


        var arc = piesvg.selectAll(".arc")
            .data(pie_fn(Object.values(data)))
            .enter().append("g")
            .attr("class", "arc");

        arc.append("path")
            .attr("d", path)
            .attr("fill", function (d, i) {
                console.log(i);
                return color(i);
            })
            .attr("stroke", "white")
            .style("stroke-width", "2px")
            .style("opacity", 1);


        arc.append("text")
            .attr("transform", function (d) {
                return "translate(" + label.centroid(d) + ")";
            })
            .text(function (d) {
                t = Object.values(data).reduce(function (a, b) {
                    return a + b;
                }, 0);
                return Math.round((d.value / t) * 100) + '%';
            });


        // Add the legend
        svg.selectAll("legend")
            .data(color.domain().slice(0, 2))
            .enter().append("g")
            .append("rect")
            .attr("x", pie_width -5)
            .attr("y", function (d, n) {
                return (pie_height / 2 + n * 25);
            })
            .attr("width", 15)
            .attr("height", 15)
            .style("fill", function (d) {
                return color(d);
            });


        // Add the legend text
        svg.selectAll("legendtext")
            .data(color.domain().slice(0, 2))
            .enter().append("g")
            .append("text")
            .text(function (d) {
                return d;
            })
            .attr("x", pie_width + 15)
            .attr("y", function (d, n) {
                return (pie_height / 2 + n * 25 + 11);
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px");

    }

    this.draw(data);

}
