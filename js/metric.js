// Adds a bar metric for the staff pick number

class Metric {

    constructor(parentElement, num, min_num, max_num) {
        this.parentElement = parentElement;
        this.num = num;
        this.min_num = min_num;
        this.max_num = max_num;

        this.initVis();
    }

    /*
     * Initialize visualization (static content; e.g. SVG area, axes)
     */

    initVis() {
        let vis = this;


        // Add margin and height/width specifications
        vis.margin = {top: 50, right: 50, bottom: 0, left: 50};
        vis.width =  document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 120 - vis.margin.top - vis.margin.bottom;

        // Initialize svg
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
            .attr("opacity", 0)

        // Create scales
        vis.x = d3.scaleLinear()
            .domain([vis.min_num, vis.max_num])
            .range([0, vis.width])

        //Create the labels
        vis.svg
            .append("text")
            .attr("class", "title")
            .attr("x", 10)
            .attr("y", 0 - (vis.margin.top / 2) + 10)
            .attr('text-anchor', 'start')
            .text("Number Chosen for 'Projects We Love' ");

        vis.svg
            .append("text")
            .attr("class", "title")
            .attr("x", -15)
            .attr("y", 12)
            .attr('text-anchor', 'start')
            .text("0");


        vis.svg
            .append("text")
            .attr("class", "title")
            .attr("x", vis.width + 5)
            .attr("y", 12)
            .attr('text-anchor', 'start')
            .text(vis.max_num);

    }


    /*
     * Data wrangling -- not needed in this case
     */

    wrangleData() {
        let vis = this;

        // Update the visualization
        vis.updateVis();
    }


    updateVis() {
        let vis = this;

        //Add initial bar
        let bars = vis.svg.selectAll("rect")
            .data([0])

        bars
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", vis.width - 10)
            .attr("height", 15)
            .attr("fill", "#037362")

        bars
            .exit()
            .remove()

        // Add Tick Mark
        let tic = vis.svg.selectAll("tic-mark")
            .data([vis.num])

        tic
            .enter()
            .append("rect")
            .attr("class", "tic-mark")
            .attr("fill", "black")
            .attr("y", -10)
            .attr("width", 5)
            .attr("height", 40)
            .merge(tic)
            .attr("x", d => vis.x(d))

        tic
            .exit()
            .remove()

        // Draw labels
        let tickLabelText = vis.svg.selectAll("text.bar-label")
            .data([vis.num])

        tickLabelText
            .enter()
            .append("text")
            .attr("class", "bar-label")
            .style("text-anchor", "middle")
            .style("font-size", "15px")
            .style("font-weight", "bold")
            .attr("opacity", 1)
            .attr("y", 45)
            .merge(tickLabelText)
            .attr("x", d => vis.x(d) + 2)
            .text(d=>d);

        tickLabelText
            .exit()
            .remove()

        vis.svg
            .attr("opacity", 1)

    }

    //hides svg
    hide(){
        let vis = this
        vis.svg
            .attr("opacity", 0)
    }


}
