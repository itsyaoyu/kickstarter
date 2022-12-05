
/*
 * fallingMoney - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _kickstarter						-- the kickstarter data
 * @param _indiegogo						-- the indiegogo data
 */

class FallingMoney {

    constructor(_parentElement, _kickstarter, _indiegogo) {
        this.parentElement = _parentElement;
        this.kickstarter = _kickstarter;
        this.indiegogo = _indiegogo;

        this.initVis();
    }


    /*
     * Initialize visualization (static content, e.g. SVG area or axes)
     */

    initVis() {
        let vis = this;

        vis.margin = { top: 20, right: 20, bottom: 20, left: 20 };

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right,
            vis.height = document.documentElement.clientHeight  - vis.margin.top - vis.margin.bottom - 200;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Drawing piggy bank
        vis.bank = vis.svg.append("svg:image")
            .attr("class", "bank")
            .attr("x", vis.margin.left * -1)
            .attr("y", vis.height - vis.margin.top * 6.2)
            .attr("width", 100)
            .attr("height", 100)
            .attr("xlink:href", "https://creazilla-store.fra1.digitaloceanspaces.com/cliparts/21998/cute-piggy-bank-clipart-md.png");

        // Drawing money
        let i = 0;

        let t = d3.interval(function(elapsed) {
            vis.svg.append("svg:image")
                .attr("class", "money")
                .attr("x", vis.margin.left - 20)
                .attr("y", vis.margin.top - 90)
                .attr("width", 50)
                .attr("height", 50)
                .attr("xlink:href", "https://emojipedia-us.s3.amazonaws.com/source/noto-emoji-animations/344/money-with-wings_1f4b8.gif")
                .transition()
                .duration(3000) // How often $1 is donated!
                .attr("y", vis.height - vis.margin.bottom * 5)
            i = i + 1
            if (i == 1000) t.stop();
        }, 3000);

        // Adding Text
        vis.total = vis.svg.append("text")
            .attr("x",-20)
            .attr("y", vis.height)
            .text("Total Donated: $0");

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }



    /*
     * Data wrangling
     */

    wrangleData() {
        let vis = this;

        let dateParser = d3.timeParse("%m/%d/%y");

        let kickstarterUSD = d3.sum(vis.kickstarter, (d, i) => {
            return d.usd_pledged;
        });

        let kickstarterDates = vis.kickstarter.map((d, i) => {
            return dateParser(d.pulled_date);
        })

        let kickstartermaxDate = d3.max(kickstarterDates);
        let kickstarterminDate = d3.min(kickstarterDates);

        let kickstarterSeconds = Math.round((kickstartermaxDate - kickstarterminDate) / (25))

        vis.kickstarterUSDSecond = kickstarterUSD / kickstarterSeconds

        // Update the visualization
        vis.updateVis();
    }



    /*
     * The drawing function
     */

    updateVis() {
        let vis = this;

        let i = 0;
        let formatMoney = d3.format(".2f");

        d3.interval(function(elapsed) {
            vis.total
                .text("Total Donated: $" + formatMoney(vis.kickstarterUSDSecond * i))
            i = i + 1
        }, 25);


    }

}
