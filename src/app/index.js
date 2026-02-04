import './style.scss';

import * as Burlak from '../package';

const data = Burlak.Date.getMonth();

document.body.append(
  Burlak.DOM.create(
    'div',
    {
      class: 'calendar',
    },
    null,
    data.map((day) =>
      Burlak.DOM.create(
        'div',
        {
          class: `day ${day.current ? 'current' : ''} ${
            day.today ? 'today' : ''
          }`,
        },
        day.day
      )
    )
  )
);

window.addEventListener('load', () => {
  let donutCharts = document.querySelectorAll('.chart-donut');
  donutCharts.forEach((item, index) => {
    let canvas = item.querySelector('canvas'),
      chart = new Burlak.Chart.Donut({
        element: canvas,
        data: new Array(Math.round(Math.random() * 10) || 1)
          .fill(null)
          .map((_, index) => ({
            value: Math.random().toFixed(2),
            label: 'Label ' + index,
          })),
        settings: {
          hover: {
            enabled: false,
          },
          texts: {
            slicePercent: {
              enabled: false,
            },
          },
        },
      });
  });

  let pieCharts = document.querySelectorAll('.chart-pie');
  pieCharts.forEach((item, index) => {
    let canvas = item.querySelector('canvas'),
      chart = new Burlak.Chart.Pie({
        element: canvas,
        data: new Array(Math.round(Math.random() * 10) || 1)
          .fill(null)
          .map((_, index) => ({
            value: Math.random().toFixed(2),
            label: 'Label ' + index,
          })),
        settings: {
          texts: {
            slicePercent: {
              enabled: true,
            },
          },
        },
      });
  });

  let radarCharts = document.querySelectorAll('.chart-radar');
  radarCharts.forEach((item, index) => {
    let canvas = item.querySelector('canvas'),
      dataCount = 6,
      data = {
        labels: new Array(dataCount).fill().map((item, index) => {
          return 'Label ' + index;
        }),
        datasets: new Array(2).fill().map((item, index) => {
          return {
            name: 'Dataset ' + index,
            values: new Array(dataCount).fill().map((item, index) => {
              return Math.ceil(Math.random() * 10);
            }),
          };
        }),
      },
      chart = new Burlak.Chart.Radar({
        element: canvas,
        data,
      });
  });

  let comboCharts = document.querySelectorAll('.chart-combo');
  comboCharts.forEach((item, index) => {
    const canvas = item.querySelector('canvas');
    const dataCount = 9;
    const generateValues = () =>
      new Array(dataCount)
        .fill(null)
        .map((_, index) => Math.random() * (Math.random() > 0.5 ? 1 : -1));
    const chart = new Burlak.Chart.Combo({
      settings: {
        data: {
          line: {
            dots: {
              enable: true,
            },
          },
        },
      },
      element: canvas,
      data: {
        labels: new Array(dataCount)
          .fill(null)
          .map((_, index) => `Label ${index}`),
        datasets: [
          {
            name: 'Bar data 1',
            type: 'bar',
            values: generateValues(),
          },
          {
            name: 'Bar data 2',
            type: 'bar',
            values: generateValues(),
          },
          {
            name: 'Line data 1',
            type: 'line',
            smooth: true,
            values: generateValues(),
          },
          {
            name: 'Line data 2',
            type: 'line',
            values: generateValues(),
          },
          {
            name: 'Dot data',
            type: 'dot',
            values: generateValues(),
          },
        ],
      },
    });
  });

  let funnelCharts = document.querySelectorAll('.chart-funnel');
  funnelCharts.forEach((item, index) => {
    let canvas = item.querySelector('canvas'),
      dataCount = 6,
      chart = new Burlak.Chart.Funnel({
        element: canvas,
        data: [
          {
            label: 'Deposit',
            value: 44,
          },
          {
            label: 'Registrations',
            value: 33,
          },
          {
            label: 'Email approvment',
            value: 22,
          },
          {
            label: 'Deposit',
            value: 3,
          },
        ],
      });
  });
});
