createChart();

const obamaLabels = [];
const trumpLabels = [];
const bidenLabels = [];

var xMin = moment("2010-01-01").unix();
var xMax = moment("2021-03-01").unix();

console.log("xMin = " + xMin + ", xMax = " + xMax);

var myChart;

async function getData(filename)
{
  const response = await fetch('datasets/'.concat(filename));
  const data = await response.text();
  const rows = data.split('\n').slice(1);

  rows.forEach(element =>
  {
    const row = element.split(',');
    var date = row[0];
    const likes = row[3];
    var date = moment(date).unix();
    const point = new Point(date, row[3]);

    if(filename == 'obamatweets.csv'){
      obamaLabels.push(point);
    }else if(filename == 'trumptweets.csv'){
      trumpLabels.push(point);
    }else if(filename == 'bidentweets.csv'){
      bidenLabels.push(point);
    }
  })
}

function Point(x, y)
{
  this.x = x;
  this.y = y;
}

async function createChart()
{
  await getData('obamatweets.csv');
  await getData('trumptweets.csv');
  await getData('bidentweets.csv');

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
        pointHoverBackgroundColor: '#b4ffb3',
        pointHoverBorderColor: '#6ed96c',
        pointHoverRadius: 5,
        showLine: false
      },{
        label: 'Trump',
        data: trumpLabels,
        backgroundColor: '#ffabab',
        borderColor: '#d44e4e',
        pointRadius: 2,
        pointHoverBackgroundColor: '#b4ffb3',
        pointHoverBorderColor: '#6ed96c',
        pointHoverRadius: 5,
        showLine: false
      },{
        label: 'Biden',
        data: bidenLabels,
        backgroundColor: '#abb7ff',
        borderColor: '#4a5fd4',
        pointRadius: 2,
        pointHoverBackgroundColor: '#b4ffb3',
        pointHoverBorderColor: '#6ed96c',
        pointHoverRadius: 5,
        showLine: false
      }],

    },
    options: {
      showLine: false, // turn off line between data points
      responsive: true,
      tooltips: {
         enabled: false
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
              return Number(value.toString());//pass tick values as a string into Number function
            }
          },
          afterBuildTicks: function (chartObj) { //Build ticks labelling as per your need
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

var cleanOutPlugin = {

    // We affect the `beforeInit` event
    beforeInit: function(chart) {

        // Replace `ticks.min` by `time.min` if it is a time-type chart
        var min = chart.config.options.scales.xAxes[0].ticks.min;
        // Same here with `ticks.max`
        var max = chart.config.options.scales.xAxes[0].ticks.max;

        var ticks = chart.config.data.labels;
        var idxMin = ticks.indexOf(min);
        var idxMax = ticks.indexOf(max);

        // If one of the indexes doesn't exist, it is going to bug
        // So we better stop the program until it goes further
        if (idxMin == -1 || idxMax == -1)
            return;

        var data = chart.config.data.datasets[0].data;

        // We remove the data and the labels that shouldn't be on the graph
        data.splice(idxMax + 1, ticks.length - idxMax);
        data.splice(0, idxMin);
        ticks.splice(idxMax + 1, ticks.length - idxMax);
        ticks.splice(0, idxMin);
    }
};

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
