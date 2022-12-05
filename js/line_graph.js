
/*
 * CountVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData
 */

fcopy = d3.format;
function myFormat(){
    function_ret = fcopy.apply(d3, arguments)
    return (function(args){return function (){
        return args.apply(d3, arguments).replace(/G/, "B");
    }})(function_ret)
}
d3.format = myFormat;


class LineVis {

    constructor(_parentElement, _data,) {
        this.parentElement = _parentElement;
        this.data = _data;

        this.initVis();
    }


    /*
     * Initialize visualization (static content, e.g. SVG area or axes)
     */

    initVis() {
        let vis = this;

        vis.margin = { top: 40, right: 80, bottom: 60, left: 80 };

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right,
            vis.height = 500 - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


        // SVG clipping path
        // ***TO-DO***
        vis.svg.append("defs")
            .append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", vis.width)
            .attr("height", vis.height);

        let dollarFormat = function(d) { return '$' + d3.format('.3s')(d) };

        // Scales and axes
        vis.x = d3.scaleTime()
            .range([0, vis.width]);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y)
            .tickFormat(dollarFormat);


        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.svg.append("g")
            .attr("class", "y-axis axis");

        // Axis title
        vis.svg.append("text")
            .attr("x", -50)
            .attr("y", -8)
            .text("Total Pledged");


        // Append a path for the area function, so that it is later behind the brush overlay
        vis.timePath = vis.svg.append("path")
            .attr("class", "area area-time");

        // Define the D3 path generator
        vis.line = d3.line()
            .x(function(d) { return vis.x(d.date) })
            .y(function(d) { return vis.y(d.pledged) })

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }



    /*
     * Data wrangling
     */

    wrangleData(){
        let vis = this

        vis.cleanData = []

        for(let i = 0; i < vis.data.length; i++){
            let day = vis.data[i]
                vis.cleanData.push(
                    {
                        date: dateParser(day["launched_at"]),
                        pledged: parseInt(day["cumsum"])
                    }

                )
            }
        let sorted = vis.cleanData.sort( (a,b) => a["date"] - b["date"])
        // console.log(sorted)

        vis.displayData = sorted


        vis.updateVis()
    }



    /*
     * The drawing function - should use the D3 update sequence (enter, update, exit)
     * Function parameters only needed if different kinds of updates are needed
     */

    updateVis() {
        let vis = this;

        // Set domains
        let minMaxY = [0, d3.max(vis.displayData.map(function (d) { return d.pledged; }))];
        vis.y.domain(minMaxY);

        let minMaxX = d3.extent(vis.displayData.map(function (d) { return d.date; }));
        vis.x.domain(minMaxX);


        // Call the area function and update the path
        // D3 uses each data point and passes it to the area function.
        // The area function translates the data into positions on the path in the SVG.
        vis.timePath
            .datum(vis.displayData)
            .attr("fill", "none")
            .attr("stroke", "#69b3a2")
            .attr("stroke-width", 4)
            .attr("d", vis.line);

        // create a tooltip
        // vis.tooltip = d3.select("body")
        //     .append("div")
        //     .style("opacity", 0)
        //     .attr("class", "tooltip")
        //     .style("background-color", "white")
        //     .style("border", "solid")
        //     .style("border-width", "2px")
        //     .style("border-radius", "5px")
        //     .style("padding", "5px")

        // Tooltip
        vis.tooltip = vis.svg.append("g")
            .attr("class", "tooltip")

        let line = vis.tooltip.append("line")
            .attr("stroke", "#000")
            .attr("y1", 0)
            .attr("y2", vis.height)
            .attr("stroke-width", 2)
            .attr("stroke", "red");

        let tooltipDate = vis.tooltip.append("text")
            .text("")
            .attr("class", "tooltip-text")
            .attr("x", 10)
            .attr("y", 10 + vis.margin.top);

        let tooltipText = vis.tooltip.append("text")
            .text("")
            .attr("class", "tooltip-text")
            .attr("x", 10)
            .attr("y", 30 + vis.margin.top);

        let dollarFormat = function(d) { return '$' + d3.format('.3s')(d) };
        let parseDate = d3.timeFormat("%Y-%m-%d")

        // Three function that change the tooltip when user hover / move / leave a cell
        let mouseover = function(event, d) {
            vis.tooltip
                .style("opacity", 1)
        }
        // let mousemove = function(event, d) {
        //     vis.tooltip
        //         .html('Total Pledged: ' + dollarFormat(d.pledged))
        //         .style("left", event.pageX + 15 + "px")
        //         .style("top", event.pageY + "px")
        // }
        let mousemove = function(event) {
            let bisectDate = d3.bisector(d => d.date).left;
            let mousePos = d3.pointer(event)[0]
            let mouseDate = vis.x.invert(mousePos);
            let i = bisectDate(vis.displayData, mouseDate);
            let d0 = vis.displayData[i - 1]
            let d1 = vis.displayData[i];
            let d = mouseDate - d0[0] > d1[0] - mouseDate ? d1 : d0;

            // console.log(mousePos)

            // updating tooltip
            line.attr("x1", mousePos);
            line.attr("x2", mousePos);
            tooltipText.html('Total Pledged: ' + dollarFormat(d.pledged));
            tooltipText.attr("x", (d) => {
                if (mousePos < vis.width / 2) {
                    return mousePos + 10
                } else {
                    return mousePos - 160
                }
            });
            tooltipDate.text(parseDate(d.date));
            tooltipDate.attr("x", (d) => {
                if (mousePos < vis.width / 2) {
                    return mousePos + 10
                } else {
                    return mousePos - 160
                }
            });
        }
        let mouseleave = function(event, d) {
            vis.tooltip
                .style("opacity", 0)
        }

        // rect to capture mouse
        vis.svg.append("rect")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseover", mouseover)
            .on("mouseout", mouseleave)
            .on("mousemove", mousemove);

        // // Add the points
        // vis.svg
        //     .append("g")
        //     .selectAll("dot")
        //     .data(vis.displayData)
        //     .enter()
        //     .append("circle")
        //     .attr("class", "myCircle")
        //     .attr("cx", function(d) { return vis.x(d.date) } )
        //     .attr("cy", function(d) { return vis.y(d.pledged) } )
        //     .attr("r", 1)
        //     .attr("stroke", "#037362")
        //     .attr("stroke-width", 1)
        //     .attr("fill", "#037362")
        //     .on("mouseover", mouseover)
        //     .on("mousemove", mousemove)
        //     .on("mouseleave", mouseleave)


        // Call axis functions with the new domain
        vis.svg.select(".x-axis").call(vis.xAxis);
        vis.svg.select(".y-axis").call(vis.yAxis);
    }
}