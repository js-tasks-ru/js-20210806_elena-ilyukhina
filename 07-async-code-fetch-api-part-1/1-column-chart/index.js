import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  element;
  subElements = {};

  constructor({
    url = '',
    range = {
      from: new Date(),
      to: new Date(),
    },
    label = '',
    link = '#',
    formatHeading = data => data
  } = {}) {
    this.url = url;
    this.range = range;
    this.label = label;
    this.link = link;
    this.data = {};
    this.value = 0;
    this.chartHeight = 50;
    this.formatHeading = formatHeading;
    this.render();
  }

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
        <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
            <div class="column-chart__title">
                ${this.label}
                <a href="${this.link}" class="column-chart__link">View all</a>
            </div>
            <div class="column-chart__container">
                <div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>
                <div data-element="body" class="column-chart__chart"></div>
            </div>
        </div>
    `;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  getChartColumns() {
    const values = Object.values(this.data);

    return this.getColumnProps(values).map(columnProp =>
      `<div style="--value: ${columnProp.value}" data-tooltip="${columnProp.percent}"></div>`
    ).join('');
  }

  getSubElements(element) {
    const result = {};

    for (const subElement of element.querySelectorAll('[data-element]')) {
      result[subElement.dataset.element] = subElement;
    }
    return result;
  }

  getUrl(from, to) {
    const url = new URL(this.url, BACKEND_URL);
    url.searchParams.set('from', from.toISOString());
    url.searchParams.set('to', to.toISOString());
    return url;
  }

  async update(from, to) {
    this.setLoading(true);

    this.data = await fetchJson(this.getUrl(from, to));

    this.setLoading(false);
    this.updateChart();

    return this.data;
  }

  updateChart() {
    this.value = this.calculateValue();
    this.subElements.header.textContent = this.formatHeading(this.value);
    this.subElements.body.innerHTML = this.getChartColumns();
  }

  calculateValue() {
    return Object.values(this.data).reduce((previous, current) => previous + current, 0);
  }

  setLoading(isLoading) {
    if (isLoading) {
      this.element.classList.add('column-chart_loading');
    } else {
      this.element.classList.remove('column-chart_loading');
    }
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }

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
