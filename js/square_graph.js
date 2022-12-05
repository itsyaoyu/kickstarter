
class SquareGraph {

    constructor(parentElement, data, bar_chart) {
        this.parentElement = parentElement
        this.data = data
        this.displayData = data
        this.bar_chart = bar_chart
        this.gradient = ['white','#037362']

        this.initVis()
    }

    initVis(){
        let vis = this

        //Setup Margins
        vis.margin = {top: 20, right: 10, bottom: 20, left: 30};
        vis.width = 440
        vis.height = 650

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        //set scales and ranges
        vis.colorScale = d3.scaleLinear()
            .range(vis.gradient)

        vis.gradientRange = d3.range(50);

        //setup legend
        vis.legendGroup = vis.svg.append("g")
            .attr('transform', `translate(${vis.width * 2.8 / 4 - 100}, ${50})`)

        vis.legend = vis.legendGroup.append("g")
            .attr('class', 'legend')

        vis.texts = vis.legendGroup.selectAll(".text")

        vis.legendColorScale = d3.scaleSequential()
            .domain([0,50])
            .interpolator(d3.interpolate(vis.gradient[0], vis.gradient[1]))

        vis.legendGroup.append("text")
            .attr('class', 'text')
            .attr('x', -100)
            .attr('y', 5)
            .text('0%')
            .style("font-size", "12px")
            .style('text-anchor', 'middle');

        vis.max = vis.legendGroup.append("text")
            .attr('class', 'label text')
            .attr('x', 150)
            .attr('y', 5)
            .style("font-size", "12px")
            .style('text-anchor', 'middle')
            .text("100%");

        vis.legend_title = vis.legendGroup.append("text")
            .attr('class', 'label text')
            .attr('x', 25)
            .attr('y', -25)
            .style("font-size", "12px")
            .style('text-anchor', 'middle')
            .text("Percent Funded");

        vis.legend.selectAll()
            .data(vis.gradientRange)
            .enter()
            .append("rect")
            .attr("x", function(d,i){return i * 5 - 100})
            .attr("y", -20)
            .attr("width", 5)
            .attr("height", 10)
            .attr("fill", d=>vis.legendColorScale(d))
            .append("text")
            .text(function(d) { return d; });

        vis.wrangleData()
    }

    wrangleData(){
        let vis = this

        vis.cleanedData = []
        vis.max_percent = 0

        //clean data for id, goal, pledge amount, percent funded, and staff pick
        for(let i = 0; i < vis.data.length; i++){
            let campaign = vis.data[i]
            if(parseInt(campaign["goal"]) > 0){

                if(parseInt(campaign["pledged"]) / parseInt(campaign["goal"]) > vis.max_percent){
                    vis.max_percent = parseInt(campaign["pledged"]) / parseInt(campaign["goal"])
                }


                vis.cleanedData.push(
                    {
                        id:campaign["id"],
                        goal: parseInt(campaign["goal"]),
                        pledged: parseInt(campaign["pledged"]),
                        percent_funded: parseInt(campaign["pledged"]) / parseInt(campaign["goal"]),
                        staff_pick: campaign["staff_pick"] == "TRUE",
                        category: campaign["category_name"]
                    }

                )
            }


        }

        //sort the cleaned data
        let sorted = vis.cleanedData.sort( (a,b) => a["percent_funded"] - b["percent_funded"])
        vis.cleanedData = sorted

        //make displayData the cleanedData
        vis.displayData = vis.cleanedData

        //calculate values
        vis.tile_growth = 20
        vis.num_tiles = 100
        vis.large_width =  vis.width - 70
        vis.tile_width = vis.large_width  / Math.sqrt(vis.num_tiles)
        vis.tile_height = vis.large_width / Math.sqrt(vis.num_tiles)

       vis.initSquare()
    }


    //init all things that need the wrangled data, but don't need to be called in updateVis()
    initSquare(){
        let vis = this
        //add large rectangle (outline)
        vis.parentRect = vis.svg.selectAll("rect")
            .data([0])
            .enter()
            .append("rect")
            .attr("x", "10")
            .attr("y", "10")
            .attr("width", vis.large_width)
            .attr("height", vis.large_width)
            .attr("fill", "white")
            .attr("stroke", "black")

        vis.colorScale.domain([vis.displayData[0]["percent_funded"], 1])

        //create list of all segments with metric info for each
        vis.segmented_dict = []

        //Get items per square/bin
        let items_per_bin = Math.round(vis.displayData.length / vis.num_tiles)

        //For all our tiles/squares, get all the categories associated
        for(let i = 0; i < vis.num_tiles; i++) {
            let slice = vis.displayData.slice(i * items_per_bin, i * items_per_bin + items_per_bin + 1)
            let mean_slice = d3.mean(slice, d=>d["percent_funded"])

            function get_categories(data_slice){
                let map1 = d3.rollup(data_slice, v => v.length, d => d.category)
                let array1 = []
                map1.forEach(function (value, key) {
                        array1.push(
                            {
                                category: key,
                                counts: value
                            }
                        )
                    }
                )
                return array1.sort((a, b) => d3.descending(a.counts, b.counts)).slice(0,10)
            }

            //push each item to the list
            vis.segmented_dict.push(
                {
                    average_percent: mean_slice,
                    min_percent: slice[0].percent_funded,
                    max_percent: slice[slice.length - 1].percent_funded,
                    staff_pick_count: slice.filter(d => d.staff_pick).length,
                    categories: get_categories(slice)
                }
            )

        }

        //create the staff metric to show how much "Staff Picks" there are
        vis.staff_metric = new Metric("staff_picks_metric", 0, 0, 200)

        //create and add curly brackets and titles
        let coords = []

        function createCoords(startRow, endRow){
            coords.push(
                {
                    x1: 55,
                    x2: 55,
                    y1: startRow * vis.tile_height + 80,
                    y2: endRow  * vis.tile_height + 80 + vis.tile_height
                }
            )

        }

        createCoords(0,3)
        createCoords(7,9)

        vis.bracket = vis.svg.selectAll("paths")
            .data(coords)
            .enter()
            .append("path")
            .attr("class","curlyBrace")
            .attr("d", function(d) {
                return makeCurlyBrace(d.x1,d.y1,d.x2,d.y2,15,.6); });

        vis.bracket.exit().remove();


        vis.svg
            .append("text")
            .attr('class', 'text')
            .attr('x', 0)
            .attr('y', 163)
            .style("font-size", "12px")
            .text('< 10%')

        vis.svg
            .append("text")
            .attr('class', 'text')
            .attr('x', 0)
            .attr('y', 425)
            .style("font-size", "12px")
            .text('>100%')


        vis.updateVis()

    }

    updateVis(){

        let vis = this

        //create each individual square
        vis.normal_rec = vis.svg.selectAll("rects")
            .data(vis.segmented_dict)
            .enter()
            .append("rect")
            .attr("x", (d,i) => (i % Math.sqrt(vis.num_tiles)) * vis.tile_width + 60)
            .attr("y", function(d,i){
                return (Math.floor(i / Math.sqrt(vis.num_tiles)))  * vis.tile_height + 80
            })
            .attr("width", vis.tile_width)
            .attr("height", vis.tile_height)
            .attr("fill", function(d) {
                if(d.average_percent > 1){
                    return '#AEF359'
                }else{
                    return vis.colorScale(d.average_percent)}
            })
            .attr("stroke", "black")
            .attr("stroke-width", "2")
            .attr("prev_x", (d,i) => (i % Math.sqrt(vis.num_tiles)) * vis.tile_width + 10 + 50)
            .attr("prev_y" ,function(d,i){
                return (Math.floor(i / Math.sqrt(vis.num_tiles)))  * vis.tile_height + 80
            })

            .on('mouseover', function (event, d) {
                d3.select(this).raise()
                    .transition()
                    .duration('50')
                    .attr("prev_x", parseInt(d3.select(this).attr("x")))
                    .attr("prev_y" ,parseInt(d3.select(this).attr("y")))
                    .attr("x", parseInt(d3.select(this).attr("x")) - vis.tile_growth/2)
                    .attr("y", parseInt(d3.select(this).attr("y")) - vis.tile_growth/2)
                    .attr("width", vis.tile_width + vis.tile_growth)
                    .attr("height", vis.tile_height + vis.tile_growth)

                //set bar chart data
                vis.bar_chart.displayData = d
                vis.bar_chart.updateVis()

                //see how many to round to
                let multiplier = 1000
                if(d.average_percent > .01){
                    multiplier = 100
                }

                function round_num(num){return Math.round(num * multiplier * 100) / multiplier}

                //set html elements
                document.getElementById('metrics_title').innerHTML =
                    `<p class="metric_title metric_val">Percent Funded of Square</p>`
                document.getElementById('metrics_avg').innerHTML =
                    `<p class="metric_val">${round_num(d.average_percent)}%</p>
                      <p>Average</p>`
                document.getElementById('metrics_min').innerHTML =
                    `<p class="metric_val">${round_num(d.min_percent)}%</p>
                       <p>Minimum</p>`
                document.getElementById('metrics_max').innerHTML =
                    `<p class="metric_val">${round_num(d.max_percent)}%</p>
                       <p>Maximum</p>`

                //set data for staff metric
                vis.staff_metric.num = d.staff_pick_count
                vis.staff_metric.updateVis()

            })


            .on('mouseout', function (d, i) {
                d3.select(this).lower()
                    .transition()
                    .duration('50')
                    .attr("x", parseInt(d3.select(this).attr("prev_x")))
                    .attr("y", parseInt(d3.select(this).attr("prev_y")))
                    .attr("width", vis.tile_width)
                    .attr("height", vis.tile_height)

                //reset html
                document.getElementById('metrics_title').innerHTML = ``
                document.getElementById('metrics_avg').innerHTML = ``
                document.getElementById('metrics_min').innerHTML = ``
                document.getElementById('metrics_max').innerHTML = ``

                vis.bar_chart.hide()
                vis.staff_metric.hide()

            })


    }

}

//helper function to make curley braces
function makeCurlyBrace(x1,y1,x2,y2,w,q)
{
    //Calculate unit vector
    var dx = x1-x2;
    var dy = y1-y2;
    var len = Math.sqrt(dx*dx + dy*dy);
    dx = dx / len;
    dy = dy / len;

    //Calculate Control Points of path,
    var qx1 = x1 + q*w*dy;
    var qy1 = y1 - q*w*dx;
    var qx2 = (x1 - .25*len*dx) + (1-q)*w*dy;
    var qy2 = (y1 - .25*len*dy) - (1-q)*w*dx;
    var tx1 = (x1 -  .5*len*dx) + w*dy;
    var ty1 = (y1 -  .5*len*dy) - w*dx;
    var qx3 = x2 + q*w*dy;
    var qy3 = y2 - q*w*dx;
    var qx4 = (x1 - .75*len*dx) + (1-q)*w*dy;
    var qy4 = (y1 - .75*len*dy) - (1-q)*w*dx;

    let re = ( "M " +  x1 + " " +  y1 +
        " Q " + qx1 + " " + qy1 + " " + qx2 + " " + qy2 +
        " T " + tx1 + " " + ty1 +
        " M " +  x2 + " " +  y2 +
        " Q " + qx3 + " " + qy3 + " " + qx4 + " " + qy4 +
        " T " + tx1 + " " + ty1 )

    return re;
}
