export default class ColumnChart {
  constructor({
    data = [],
    label = '',
    link = '',
    value = 0,
    formatHeading = (val => `${val}`)} = {}) {

    this.data = data;
    this.label = label;
    this.link = link;
    this.value = value;
    this.chartHeight = 50;
    this.formatHeading = formatHeading;

    this.render();
    this.initEventListeners();
  }

  render() {
    // chart title
    const title = document.createElement('div');
    title.classList.add('column-chart__title');

    // chart link
    const link = document.createElement('a');
    link.classList.add('column-chart__link');
    link.href = this.link;
    link.append(document.createTextNode('View all'));

    title.append(document.createTextNode(this.label), link);

    // chart container
    const container = document.createElement('div');
    container.classList.add('column-chart__container');

    // chart header
    const header = document.createElement('div');
    header.dataset.element = 'header';
    header.classList.add('column-chart__header');
    header.append(document.createTextNode(this.formatHeading(this.value)));

    // chart body
    const chart = document.createElement('div');
    chart.dataset.element = 'body';
    chart.classList.add('column-chart__chart');

    container.append(header, chart);

    // root element
    this.element = document.createElement('div');
    this.element.classList.add('column-chart');
    this.element.style.setProperty('--chart-height', this.chartHeight);
    this.element.append(title, container);

    if (this.data.length === 0) {
      this.element.classList.add('column-chart_loading');
    } else {
      // add chart columns with data
      this.addChartColumns();
    }
  }

  update(data) {
    this.data = data;
    this.removeChartColumns();

    if (this.data.length === 0) {
      this.element.classList.add('column-chart_loading');
    } else {
      this.element.classList.remove('column-chart_loading');
      this.addChartColumns();
    }
  }

  initEventListeners () {
    // NOTE: в данном методе добавляем обработчики событий, если они есть
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    // NOTE: удаляем обработчики событий, если они есть
  }

  removeChartColumns() {
    const chart = this.element.querySelector('.column-chart__chart');

    while (chart.firstChild) {
      chart.removeChild(chart.firstChild);
    }
  }

  addChartColumns() {
    const chart = this.element.querySelector('.column-chart__chart');

    for (let columnProp of this.getColumnProps(this.data)) {
      let chartValue = document.createElement('div');
      chartValue.style.setProperty('--value', columnProp.value);
      chartValue.dataset.tooltip = columnProp.percent;
      chart.appendChild(chartValue);
    }
  }

  // this method was copied from tests
  getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;

    return data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }
}
