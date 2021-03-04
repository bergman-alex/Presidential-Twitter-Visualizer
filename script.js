createChart();

const obamaLabels = [];
const trumpLabels = [];
const bidenLabels = [];

var xMin = moment("2010-01-01").unix();
var xMax = moment("2021-03-01").unix();

console.log("xMin = " + xMin + ", xMax = " + xMax);

var myChart;

// read items from .csv and push into labels
async function getData(filename)
{
  const response = await fetch('datasets/'.concat(filename));
  const data = await response.text();
  const rows = data.split('\n').slice(1);

  rows.forEach(element =>
  {
    const row = element.split(',');
    var date = row[0];
    var text = row[1];
    const likes = row[3];
    var date = moment(date).unix();
    const point = new Point(date, likes, text);

    if(filename == 'obamatweets.csv'){
      obamaLabels.push(point);
    }else if(filename == 'trumptweets.csv'){
      trumpLabels.push(point);
    }else if(filename == 'bidentweets.csv'){
      bidenLabels.push(point);
    }
  })
}

// point constructor
function Point(x, y, z)
{
  this.x = x;
  this.y = y;
  this.z = z;
}

async function createChart()
{
  // load the datasets
  await getData('obamatweets.csv');
  await getData('trumptweets.csv');
  await getData('bidentweets.csv');

  // don't draw points outside the min-max values of the chart
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
    options: {
      showLine: false, // turn off line between data points
      responsive: true,
      tooltips: {
        callbacks: {
          title: function(tooltipItem, data) {
            var tooltipDate = moment.unix(data.datasets[tooltipItem[0].datasetIndex].data[tooltipItem[0].index].x).format("YYYY-MM-DD, HH:mm"); // get tweet date
            var tooltipPresident = data.datasets[tooltipItem[0].datasetIndex].label; // get president
            return tooltipPresident + " on " + tooltipDate;
          },
          label: function(tooltipItem, data) {
            var tooltipTweet = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].z; // get tweet text
            return tooltipTweet;
          },
          footer: function(tooltipItem, data) {
            var tooltipLikes = data.datasets[tooltipItem[0].datasetIndex].data[tooltipItem[0].index].y; // get tweet likes
            return "Likes: " + tooltipLikes;
          }
        },
        bodyFontColor: '#8fccf2'
      },
      animation: {
        duration: 0 //turn off animations to improve performance with large datasets
      },
      hover: {
        animationDuration: 0
      },
      responsiveAnimationDuration: 0,
      scales: {
        xAxes: [{
          ticks: {
            min: xMin,
            max: xMax,
            userCallback: function(label, index, labels) {
              return moment.unix(label).format("YYYY-MM-DD");
            }
          }
        }],
        yAxes:[{
          type: 'logarithmic',
          ticks: {
            callback: function (value, index, values) {
              return Number(value.toString()); // pass tick values as a string into Number function
            }
          },
          afterBuildTicks: function (chartObj) { // build ticks labelling
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
            labelString: 'Number of likes'
          }
        }]
      }
    }
  });
}

// RANGE SLIDERS

// set min, max and default values
document.getElementById("startDate").min = moment("2008-01-01", "YYYY-MM-DD").unix();
document.getElementById("startDate").max = moment("2021-03-01", "YYYY-MM-DD").unix();
document.getElementById("startDate").value = document.getElementById("startDate").min
document.getElementById("endDate").min = moment("2008-01-01", "YYYY-MM-DD").unix();
document.getElementById("endDate").max = moment("2021-03-01", "YYYY-MM-DD").unix();
document.getElementById("endDate").value = document.getElementById("endDate").max

var startDateSlider = document.getElementById("startDate");
var endDateSlider = document.getElementById("endDate");
var output = document.getElementById("dateText");

output.innerHTML = moment.unix(startDateSlider.value).format("YYYY-MM-DD") + " to " + moment.unix(endDateSlider.value).format("YYYY-MM-DD");

// update values when sliders are interacted with
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

// update chart once slider stops being interacted with
startDateSlider.onchange = function()
{
  myChart.update();
}

endDateSlider.onchange = function()
{
  myChart.update();
}
