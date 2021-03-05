createChart();


//Three empty arrays for storing data in
const obamaLabels = [];
const trumpLabels = [];
const bidenLabels = [];

var xMin = moment("2007-10-01").unix();
var xMax = moment("2021-02-01").unix();


//Have to make the chart global to access the update function outside
//of the chart creation element
var myChart;

// Function for read items from .csv and push into the corresponding label/array
async function getData(filename)
{
  //Fetching the data from the set and spliting it into rows
  const response = await fetch('datasets/'.concat(filename));
  const data = await response.text();
  const rows = data.split('\n').slice(1);

//Each row is split by the divider ',' and the valuable info is put into a point
  rows.forEach(element =>
  {
    const row = element.split(',');
    var date = row[0];
    var text = row[1];
    const likes = row[3];
    var date = moment(date).unix(); // Using moment.js for handling the dates
    const point = new Point(date, likes, text);

    //Pushing the point into the corresponding array
    if(filename == 'obamatweets.csv'){
      obamaLabels.push(point);
    }else if(filename == 'trumptweets.csv'){
      trumpLabels.push(point);
    }else if(filename == 'bidentweets.csv'){
      bidenLabels.push(point);
    }
  })
}

// The constructor for the point
function Point(x, y, z)
{
  this.x = x;
  this.y = y;
  this.z = z;
}


// The function for creating the chart
async function createChart()
{
  // Loading the datasets
  await getData('obamatweets.csv');
  await getData('trumptweets.csv');
  await getData('bidentweets.csv');

  // Don't draw points outside the min-max values of the chart
  // https://stackoverflow.com/questions/40355519/how-do-i-hide-line-outside-the-min-max-scale-area-in-chartjs-2-0
  Chart.plugins.register({
    beforeDatasetsDraw: function(chartInstance) {
        var ctx = chartInstance.chart.ctx;
        var chartArea = chartInstance.chartArea;
        ctx.save();
        ctx.beginPath();

        ctx.rect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
        ctx.clip();
    },
    afterDatasetsDraw: function(chartInstance) {
        chartInstance.chart.ctx.restore();
    },
  });

// Creating the chart with three datasets one for each president
// The colors are then applied along with label
  var chart = document.getElementById('chart').getContext('2d');
  myChart = new Chart(chart, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Obama',
        data: obamaLabels,
        backgroundColor: '#d5ffba',
        borderColor: '#89d15c',
        pointRadius: 2,
        pointHoverBackgroundColor: '#89d15c',
        pointHoverBorderColor: '#89d15c',
        pointHoverRadius: 5,
        showLine: false
      },{
        label: 'Trump',
        data: trumpLabels,
        backgroundColor: '#ffabab',
        borderColor: '#d44e4e',
        pointHoverBackgroundColor: '#d44e4e',
        pointHoverBorderColor: '#d44e4e',
        pointRadius: 2,
        pointHoverRadius: 5,
        showLine: false
      },{
        label: 'Biden',
        data: bidenLabels,
        backgroundColor: '#abb7ff',
        borderColor: '#4a5fd4',
        pointHoverBackgroundColor: '#4a5fd4',
        pointHoverBorderColor: '#4a5fd4',
        pointRadius: 2,
        pointHoverRadius: 5,
        showLine: false
      }],

    },
    // Here we have the options for the graph
    options: {
      showLine: false, // Turn off line between data points
      responsive: true,
      legend: {       // Show the legend and display it in white
        display: true,
        labels:{
          fontColor: 'white'
        }
      },
      title: { // Display the title and make it white with font size 32
            display: true,
            text: 'Presidential Twitter Visualizer',
            fontColor: 'white',
            fontSize: 32,
        },
      tooltips: {
        callbacks: { // Since chart.js scatter plots can't handle dates we had to use moment.js to assist it.
                     // We get the data for the point we are hovering over and changing it's format to fit the wanted tooltip
          title: function(tooltipItem, data) { // Tooltip labeling of the president + date of the tweet
            var tooltipDate = moment.unix(data.datasets[tooltipItem[0].datasetIndex].data[tooltipItem[0].index].x).format("YYYY-MM-DD, HH:mm"); // get tweet date
            var tooltipPresident = data.datasets[tooltipItem[0].datasetIndex].label; // get president
            return tooltipPresident + " on " + tooltipDate;
          },
          label: function(tooltipItem, data) { // Tooltip labeling for the text of the tweet
            var tooltipTweet = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].z;

            // To avoid the tooltip from being to long, we split the text string at a choosen length (half of a full tweet)
            if (tooltipTweet.length > 140 && tooltipTweet.length < 187)
            {
              var tweet1 = tooltipTweet.slice(0, 140);
              var tweet2 = tooltipTweet.slice(140);

              return [tweet1, tweet2];
            }
            else if (tooltipTweet.length >= 187)
            {
              var tweet1 = tooltipTweet.slice(0, 94);
              var tweet2 = tooltipTweet.slice(94, 187);
              var tweet3 = tooltipTweet.slice(187);

              return [tweet1, tweet2, tweet3];
            }
            else
            {
              return tooltipTweet;
            }
          },
          footer: function(tooltipItem, data) { // Tooltip labeling of the likes
            var tooltipLikes = data.datasets[tooltipItem[0].datasetIndex].data[tooltipItem[0].index].y; // get tweet likes
            return "Likes: " + tooltipLikes;
          }
        },
        displayColors: false,
        bodyFontColor: '#8fccf2' //change the color of the text to fit the twitter theme
      },
      animation: {
        duration: 0 // Turn off the animations to improve performance with large datasets
      },
      hover: {
        animationDuration: 0
      },
      responsiveAnimationDuration: 0,
      scales: { // The options of the scales in y and x direction

        xAxes: [{
          ticks: { // We set a min and max value for the x axis which is right before the first tweet in the dataset
                  // and right after the last tweet
            fontColor: 'white',
            min: xMin,
            max: xMax,
            userCallback: function(label, index, labels) { // Here moment.js is turning date value back into an actual date
              return moment.unix(label).format("YYYY-MM-DD");
            }
          },
          gridLines: {
            color: '#525354' // The color of the grid on the x axis is changed
          }
        }],
        yAxes:[{
          type: 'logarithmic', // Because of the vast difference in likes between tweets the y axis of logarithmic type
          ticks: {
            fontColor: 'white',
            callback: function (value, index, values) {
              return Number(value.toString()); // Pass tick values as a string into Number function
            }
          },
          gridLines: {
            color: '#525354'
          },
          afterBuildTicks: function (chartObj) { // Build ticks labelling i.e we fit the axis with labels ourselfs
            chartObj.ticks = [];
            chartObj.ticks.push(1);
            chartObj.ticks.push(10);
            chartObj.ticks.push(100);
            chartObj.ticks.push(1000);
            chartObj.ticks.push(10000);
            chartObj.ticks.push(100000);
            chartObj.ticks.push(1000000);
            chartObj.ticks.push(5000000);
          },
          scaleLabel:{
            display: true,
            labelString: 'Number of likes' // giving the y axis a description
          }
        }]
      }
    }
  });
}

// RANGE SLIDERS

// set min, max and default values
document.getElementById("startDate").min = moment("2007-10-01", "YYYY-MM-DD").unix();
document.getElementById("startDate").max = moment("2021-02-01", "YYYY-MM-DD").unix();
document.getElementById("startDate").value = document.getElementById("startDate").min
document.getElementById("endDate").min = moment("2007-10-01", "YYYY-MM-DD").unix();
document.getElementById("endDate").max = moment("2021-02-01", "YYYY-MM-DD").unix();
document.getElementById("endDate").value = document.getElementById("endDate").max

var startDateSlider = document.getElementById("startDate");
var endDateSlider = document.getElementById("endDate");
var output = document.getElementById("dateText");

output.innerHTML = moment.unix(startDateSlider.value).format("YYYY-MM-DD") + " to " + moment.unix(endDateSlider.value).format("YYYY-MM-DD");

// Update values when sliders are interacted with
startDateSlider.oninput = function()
{
  output.innerHTML = moment.unix(this.value).format("YYYY-MM-DD") + " to " + moment.unix(endDateSlider.value).format("YYYY-MM-DD");
  xMin = document.getElementById("startDate").value;
  document.getElementById("endDate").min = xMin;
  myChart.options.scales.xAxes[0].ticks.min = xMin;
  myChart.options.scales.xAxes[0].ticks.max = xMax;
}

endDateSlider.oninput = function()
{
  output.innerHTML = moment.unix(startDateSlider.value).format("YYYY-MM-DD") + " to " + moment.unix(this.value).format("YYYY-MM-DD");
  xMax = document.getElementById("endDate").value;
  document.getElementById("startDate").max = xMax;
  myChart.options.scales.xAxes[0].ticks.min = xMin;
  myChart.options.scales.xAxes[0].ticks.max = xMax;
}

// Update chart once slider stops being interacted with
startDateSlider.onchange = function()
{
  myChart.update();
}

endDateSlider.onchange = function()
{
  myChart.update();
}
