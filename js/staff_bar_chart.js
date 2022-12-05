
class StaffBarChart {

    constructor(parentElement) {
        this.parentElement = parentElement;
        this.data = [];

        this.initVis();
    }

    /*
     * Initialize visualization (static content; e.g. SVG area, axes)
     */

    initVis() {
        let vis = this;


        // * TO-DO *

        // Add margin and height/width specifications
        vis.margin = {top: 50, right: 20, bottom: 70, left: 100};
        vis.width =  document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

        // Initialize svg
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
            .attr("opacity", 0)


        // Create scales
        vis.x = d3.scaleBand()
            .range([0, vis.width])
            .padding(.1);
        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);


        // Create axes
        vis.yAxis = d3.axisLeft()
            .scale(vis.y)
            //.tickFormat(dollarFormat);
        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.svg.append("g")
            .attr("class", "y-axis axis");
        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.svg
            .append("text")
            .attr("class", "title")
            .attr("x", 10)
            .attr("y", 0 - (vis.margin.top / 2) + 10)
            .attr('text-anchor', 'start')
            .text("Top Ten Categories");



        //No need to clean data or immediately update the vis

    }


    //create vis
    updateVis() {

        let vis = this;
        let category_names = []
        let category_values = []
        for (let i=0; i< vis.displayData.categories.length; i++ ){
            category_names.push(vis.displayData.categories[i].category)
            category_values.push(vis.displayData.categories[i].counts)
        }

        // Update domains
         vis.x.domain(category_names)
         vis.y.domain([0, d3.max(category_values)])


        // Draw rectangles
        vis.bars = vis.svg.selectAll("rect")
            .data(vis.displayData.categories)

        //create bars for chart
        vis.bars
            .enter()
            .append("rect")
            .merge(vis.bars)
            .attr("x", d => vis.x(d.category))
            .attr("width", vis.x.bandwidth())
            .attr("fill", "#037362")
            .transition()
            .duration(100)
            .attr("y", d => vis.y(d.counts))
            .attr("height", d => vis.height - vis.y(d.counts))

        vis.bars
            .exit()
            .remove()


        // Draw labels
        vis.barLabelText = vis.svg.selectAll("text.bar-label")
            .data(vis.displayData.categories)

        vis.barLabelText
            .enter()
            .append("text")
            .merge(vis.barLabelText)
            .attr("class", "bar-label")
            .attr("x", (d,i) => {
                return vis.x(d.category) + (vis.x.bandwidth()/2);
            })
            .transition()
            .duration(100)
            .attr("opacity", 1)
            .attr("y", (d,i) => {
                return vis.y(d.counts) - 2;
            })
            .text((d) => d.counts);

        vis.barLabelText
            .exit()
            .remove()

        // Update the x-axis
        vis.svg.select(".x-axis").call(vis.xAxis)
            .selectAll("text")
            .attr("transform", "rotate(45)");
        // Update the y-axis
        vis.svg.select(".y-axis").call(vis.yAxis);

        vis.svg
            .attr("opacity", 1)

    }

    //set opacity to 0 to hide
    hide(){
        let vis = this
        vis.svg
            .attr("opacity", 0)
    }


}
