createChart();

const obamaLabels = [];
const trumpLabels = [];
const bidenLabels = [];

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
    var date = moment(date);
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
  var myChart = new Chart(chart, {
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
      responsive: true,
      tooltips: {
         enabled: false
      },
      scales: { xAxes: [{
                  ticks:{
                    userCallback: function(label, index, labels) {
                          return moment(label).format("YYYY-MM-DD HH:mm");
                          }
                  }
                }],
                yAxes:[{
                  type: 'logarithmic',
                  ticks:{
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
                  display:     true,
                  labelString: 'Number of likes'
                }
                }]
      }
    }
  });
}
/*
function restoreTrump(){
	      chart.data.datasets[1].data = trumpLabels;
        chart.update();
}

function removeTrump() {
        //chart.data.datasets[1].data = [];
        console.log(myChart.chart.data.datasets[1].data);
        chart.update();
}*/
