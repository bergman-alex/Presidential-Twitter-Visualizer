createChart();

const labels = [];

async function getData()
{
  const response = await fetch('testtweets.csv');
  const data = await response.text();
  const rows = data.split('\n').slice(1);

  rows.forEach(element =>
  {
    const row = element.split(',');
    const date = row[0];
    const likes = row[3];

    const point = new Point(row[0], row[3]);

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
        pointHoverRadius: 10
      }]
    },
    options: {
      responsive: true,
      scales: {
        xAxes: [{
          type: 'linear'
        }]
      }
    }
  });
}
