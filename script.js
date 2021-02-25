createChart();

const labels = [];

async function getData()
{
  const response = await fetch('tweets.csv');
  const data = await response.text();
  const rows = data.split('\n').slice(1);

  rows.forEach(element =>
  {
    const row = element.split(',');
    var date = row[0];
    const likes = row[3];
    var date = moment(date);
    const point = new Point(date, row[3]);

    labels.push(point);
  })
}

function Point(x, y)
{
  this.x = x;
  this.y = y;
}

async function createChart()
{
  await getData();

  var chart = document.getElementById('chart').getContext('2d');
  var myChart = new Chart(chart, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Scatter Dataset',
        data: labels,
        pointBackgroundColor: '#ffecb8',
        pointBorderColor: '#d9bc6c',
        pointRadius: 5,
        pointHoverBackgroundColor: '#b4ffb3',
        pointHoverBorderColor: '#6ed96c',
        pointHoverRadius: 10,
        showLine: false
      }]
    },
    options: {
      responsive: true,
      scales: { xAxes: [{
                  ticks:{
                  userCallback: function(label, index, labels) {
                          return moment(label).format("YYYY-MM-DD HH:mm");
                          }
                        }
          }],
          yAxes: [{
              scaleLabel: {
                  display:     true,
                  labelString: 'Number of likes'
              }
          }]
      }
    }
  });
}
