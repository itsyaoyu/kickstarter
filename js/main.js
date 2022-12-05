// Function to convert date objects to strings or reverse
let dateFormatter = d3.timeFormat("%Y-%m-%d");
let dateParser = d3.timeParse("%Y-%m-%d");

let gradient = ['#FFD580','green']

// (1) Load data with promises

let promises = [
    d3.csv("data/kickstarter_2020_2022.csv"),
    d3.csv("data/indiegogo_2020_2022.csv"),
    d3.csv("data/grouped_data.csv")
];

Promise.all(promises)
    .then(function (data) {
        createVis(data)
    })
    .catch(function (err) {
        // console.log(err)
    });

function createVis(data) {
    let kickstarter = data[0]
    let indiegogo = data[1]
    let grouped = data[2]

    // console.log(data)

    // Create visualization instance
    let fallingMoney = new FallingMoney("fallingMoney", kickstarter, indiegogo);
    let mySqaure = new SquareGraph("staff_pick", kickstarter, new StaffBarChart("percent_charts"));
    let lineGraph = new LineVis("line_graph", grouped);
    let infographic = new IntroInfographic("intro_infographic");
    let barChart = new BarChart("bar_chart", kickstarter);
    let bubbleChart = new BubbleChart("bubble_chart", kickstarter, barChart);

}
