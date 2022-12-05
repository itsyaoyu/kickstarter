
class BarChart {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        //console.log(this.displayData);

        this.initVis();
    }

    /*
     * Initialize visualization (static content; e.g. SVG area, axes)
     */

    initVis() {
        let vis = this;


        // * TO-DO *

        // Add margin and height/width specifications
        vis.margin = {top: 50, right: 10, bottom: 10, left: 100};
        vis.width =  document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

        // Initialize svg
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Create scales
        vis.x = d3.scaleBand()
            .range([0, vis.width])
            .padding(.1);
        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);


        let dollarFormat = function(d) { return '$' + d3.format('.3s')(d) };

        // Create axes
        vis.yAxis = d3.axisLeft()
            .scale(vis.y)
            .tickFormat(dollarFormat);
        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.svg.append("g")
            .attr("class", "y-axis axis");
        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        // create a tooltip
        vis.tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")



        // (Filter, aggregate, modify data)
        vis.wrangleData(vis.data);
    }




    /*
     * Data wrangling
     */

    wrangleData(filteredData) {
        let vis = this;

        // (1) Group data by key variable (e.g. 'electricity') and count leaves
        // (2) Sort columns descending

        // * TO-DO *
        vis.displayData = filteredData

        vis.displayData.forEach(d =>
            d.usd_pledged = +d.usd_pledged
        )

        vis.displayData.sort(function(a, b){return b.usd_pledged - a.usd_pledged})
        vis.displayData = vis.displayData.slice(0,10)

        // Update the visualization
        vis.updateVis();
    }



    /*
     * The drawing function - should use the D3 update sequence (enter, update, exit)
     */

    updateVis() {
        let vis = this;

        //console.log(vis.displayData)

        // (1) Update domains
        vis.x.domain(vis.displayData.map(d => d.name))
        vis.y.domain([0, d3.max(vis.displayData, function (d) {
            return d.usd_pledged;
        })]);

        // console.log((d3.max(vis.displayData, function (d) {
        //     return d.usd_pledged;
        // })))

        // (2) Draw rectangles
        let bars = vis.svg.selectAll("rect")
            .data(vis.displayData)


        // Three function that change the tooltip when user hover / move / leave a cell
        let mouseover = function(event, d) {
            vis.tooltip
                .style("opacity", 1)
        }
        let mousemove = function(event, d) {
            vis.tooltip
                .html('Campaign: ' + d.name)
                .style("left", event.pageX + 20 + "px")
                .style("top", event.pageY + "px")
        }
        let mouseleave = function(event, d) {
            vis.tooltip
                .style("opacity", 0)
                .style("left", 0)
                .style("top", 0)
                .html(``);
        }

        bars
            .enter()
            .append("rect")
            .merge(bars)
            .attr("x", d => vis.x(d.name))
            .attr("y", d => vis.y(d.usd_pledged))
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            .on("click", function(d){
                window.open(vis.url);
            })
            .transition()
            .duration(800)
            .attr("width", vis.x.bandwidth())
            .attr("height", d => vis.height - vis.y(d.usd_pledged))
            .attr("fill", "#037362")


        bars
            .exit()
            .remove()


        // (3) Draw labels
        let barLabelText = vis.svg.selectAll("text.bar-label")
            .data(vis.displayData)

        let barLabelFormat = d3.format('.3s');

        barLabelText
            .enter()
            .append("text")
            .merge(barLabelText)
            .attr("class", "bar-label")

            .attr("opacity", 0)
            .attr("x", (d,i) => {
                return vis.x(d.name) + (vis.x.bandwidth()/2);
            })
            .transition(2000)
            .attr("opacity", 1)
            .attr("y", (d,i) => {
                return vis.y(d.usd_pledged) - 2;
            })
            .text((d,i) => {
                return barLabelFormat(d.usd_pledged);
            });

        barLabelText
            .exit()
            .remove()

        vis.svg
            .append("text")
            .attr("class", "title")
            .attr("x", 10)
            .attr("y", 0 - (vis.margin.top / 2) + 10)
            .attr('text-anchor', 'start')
            .text("Top Funded Kickstarter Campaigns");




        // * TO-DO *

        // Update the x-axis
        //vis.svg.select(".x-axis").call(vis.xAxis)
            //.selectAll("text")
            //.attr("transform", "rotate(45)");
        // Update the y-axis
        vis.svg.select(".y-axis").call(vis.yAxis);
    }


}
