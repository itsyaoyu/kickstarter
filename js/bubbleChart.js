
/*
 * BubbleChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _kickstarter						-- the kickstarter data
 */

class BubbleChart {

    constructor(_parentElement, _kickstarter, _barchart) {
        this.parentElement = _parentElement;
        this.kickstarter = _kickstarter;
        this.barchart = _barchart;
        this.displayData = [];

        this.initVis();
    }


    /*
     * Initialize visualization (static content, e.g. SVG area or axes)
     */

    initVis() {
        let vis = this;

        vis.margin = { top: 50, right: 20, bottom: 20, left: 20 };

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right,
            vis.height = 450 - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }



    /*
     * Data wrangling
     */

    wrangleData() {
        let vis = this;

        let temp = d3.rollup(this.kickstarter, v => v.length, d => d.category_name, d => d.category_parent_name);

        // console.log(temp)

        this.displayData = Array.from(temp, ([category, par_grp]) => {
            let par;
            let cat = category;
            let val;
            this.displayData = Array.from(par_grp, ([parent, value]) => {
                par = parent;
                val = value;
            });

            return {
                ["parent"]: par,
                ["category"]: cat,
                ["value"]: val
            };
        });

        // console.log(this.displayData);

        // Update the visualization
        vis.updateVis();
    }



    /*
     * The drawing function
     */

    updateVis() {
        let vis = this;

        // https://d3-graph-gallery.com/graph/circularpacking_template.html

        // Color palette
        let color = d3.scaleOrdinal()
            .range(d3.schemeSet1);

        // Size scale for groups
        vis.size = d3.scaleLinear()
            .domain([0, d3.max(vis.displayData.map(function (d) { return d.value;}))])
            .range([7,55])  // circle will be between 7 and 55 px wide

        // create a tooltip
        vis.tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")

        // Three function that change the tooltip when user hover / move / leave a cell
        let mouseover = function(event, d) {
            vis.tooltip
                .style("opacity", 1)
        }
        let mousemove = function(event, d) {
            vis.tooltip
                .html('<u>' + d.category + '</u>' + "<br>" + d.value + " projects")
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

        let click = function(event, d){
            let filteredData = vis.kickstarter.filter(function(k_data) { return k_data.category_name == d.category})
            vis.barchart.wrangleData(filteredData)
        }

        // Initialize the circle: all located at the center of the svg area
        vis.node = vis.svg.append("g")
            .selectAll("circle")
            .data(vis.displayData)
            .enter()
            .append("circle")
            .attr("class", "node")
            .attr("r", d => vis.size(d.value))
            .attr("cx", vis.width / 2)
            .attr("cy", vis.height / 2)
            .style("fill", d => color(d.category))
            .style("fill-opacity", 0.8)
            .attr("stroke", "black")
            .style("stroke-width", 1)
            .on("mouseover", mouseover) // What to do when hovered
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            .on("click", click);

        // Features of the forces applied to the nodes:
        const simulation = d3.forceSimulation()
            .force("center", d3.forceCenter().x(vis.width / 2).y(vis.height / 2)) // Attraction to the center of the svg area
            .force("charge", d3.forceManyBody().strength(.1)) // Nodes are attracted one each other of value is > 0
            .force("collide", d3.forceCollide().strength(.2).radius(function(d){ return (vis.size(d.value)+3) }).iterations(1)) // Force that avoids circle overlapping

        // Apply these forces to the nodes and update their positions.
        // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
        simulation
            .nodes(vis.displayData)
            .on("tick", function(d){
                vis.node
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y)
            });
    }

}
