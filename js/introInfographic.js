class IntroInfographic {

    constructor(parentElement, data) {
        this.parentElement = parentElement

        this.initVis()
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 20, right: 20, bottom: 20, left: 20 };

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right,
            vis.height = 80 - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Drawing founder thinking
        // vis.founder = vis.svg.append("svg:image")
        //     .attr("class", "founder")
        //     .attr("x", 0)
        //     .attr("y", vis.height - 200)
        //     .attr("width", 200)
        //     .attr("height", 200)
        //     .attr("xlink:href", "img/idea.png");

        // Founder text
        vis.founder_text = vis.svg.append("g")
            .attr("transform", function(d, i) { return "translate(0, 10)"; });

        vis.founder_text.append('rect')
            .attr('width', 250)
            .attr('height', 50)
            .attr('stroke', 'black')
            .attr('fill', '#d9d9d9');

        vis.founder_text.append("text")
            .attr("x", 30)
            .attr("y", vis.margin.top)
            .text("A person with an idea for")
            .append('tspan')
            .attr('x', 30)
            .attr('dy', 20)
            .text("a product...")

        // Drawing right arrow
        // vis.arrow_r = vis.svg.append("svg:image")
        //     .attr("class", "right-arrow")
        //     .attr("x", 200)
        //     .attr("y", 75)
        //     .attr("width", 150)
        //     .attr("height", 150)
        //     .attr("xlink:href", "img/right_arrow.png");

        // Drawing Kickstarter K
        // vis.arrow_r = vis.svg.append("svg:image")
        //     .attr("class", "logo-k")
        //     .attr("x", 375)
        //     .attr("y", 100)
        //     .attr("width", 100)
        //     .attr("height", 100)
        //     .attr("xlink:href", "img/kickstarter_k.png");

        // Kickstarter K text
        vis.kickstarter_text = vis.svg.append("g")
            .attr("transform", function(d, i) { return "translate(400, 10)"; });

        vis.kickstarter_text.append('rect')
            .attr('width', 200)
            .attr('height', 50)
            .attr('stroke', 'black')
            .attr('fill', '#6bccca');

        vis.kickstarter_text.append("text")
            .attr("x", 30)
            .attr("y", vis.margin.top)
            .text("... shares this idea")
            .append('tspan')
            .attr('x', 30)
            .attr('dy', 20)
            .text("on Kickstarter...")

        // Left Arrows
        // vis.arrow_l = vis.svg.append("svg:image")
        //     .attr("class", "left-arrow")
        //     .attr("x", 500)
        //     .attr("y", 75)
        //     .attr("width", 150)
        //     .attr("height", 150)
        //     .attr("xlink:href", "img/left_arrows.png");

        // Investors
        // vis.investor = vis.svg.append("svg:image")
        //     .attr("class", "founder")
        //     .attr("x", 650)
        //     .attr("y", vis.height - 200)
        //     .attr("width", 200)
        //     .attr("height", 200)
        //     .attr("xlink:href", "img/salary.png");

        // Investors text
        vis.investor_text = vis.svg.append("g")
            .attr("transform", function(d, i) { return "translate(750, 10)"; });

        vis.investor_text.append('rect')
            .attr('width', 250)
            .attr('height', 50)
            .attr('stroke', 'black')
            .attr('fill', '#decc7f');

        vis.investor_text.append("text")
            .attr("x", 30)
            .attr("y", vis.margin.top)
            .text("... and people that like it ")
            .append('tspan')
            .attr('x', 30)
            .attr('dy', 20)
            .text("help fund it's development!")

    }
}