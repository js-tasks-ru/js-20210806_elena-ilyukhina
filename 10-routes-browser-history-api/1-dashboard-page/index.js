import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {

  element;
  subElements = {};
  subscribers = new Map();

  onDateSelect = event => {
    this.from = event.detail.from;
    this.to = event.detail.to;

    const callbacks = this.subscribers.get(event.type);
    if (callbacks.length) {
      // show progress bar
      document.querySelector('.main').classList.add('is-loading');

      Promise.all(callbacks.map(callback => callback(this.from, this.to)))
        .catch((error) => console.error(error.message))
        .finally(() => document.querySelector('.main').classList.remove('is-loading'));
    }
  }

  constructor() {
    const today = new Date();
    this.to = new Date(today);
    this.from = new Date(today.setMonth(today.getMonth() - 1));
  }

  async render() {
    this.element = document.createElement('div');
    this.element.innerHTML = this.template;
    this.element = this.element.firstElementChild;

    const rangePicker = new RangePicker({
      from: this.from,
      to: this.to
    });

    const ordersChart = this.createOrdersChart();
    const salesChart = this.createSalesChart();
    const customersChart = this.createCustomersChart();
    const sortableTable = this.createSortableTable();

    this.subElements = {
      rangePicker,
      ordersChart,
      salesChart,
      customersChart,
      sortableTable
    };

    for (const subElement of this.element.querySelectorAll('[data-element]').values()) {
      subElement.replaceWith(this.subElements[subElement.dataset.element].element);
      this.subElements[subElement.dataset.element] = this.subElements[subElement.dataset.element].element;
    }

    this.initEventListeners();

    return this.element;
  }

  subscribe(eventType, callback) {
    const callbacks = this.subscribers.has(eventType) ? this.subscribers.get(eventType) : [];
    callbacks.push(callback);
    this.subscribers.set(eventType, callbacks);
  }

  initEventListeners() {
    this.element.addEventListener('date-select', this.onDateSelect);
  }

  get template() {
    return `
        <div class="dashboard">
            <div class="content__top-panel">
                <h2 class="page-title">Dashboard</h2>
                <div data-element="rangePicker"></div>
            </div>
            <div class="dashboard__charts">
                <div data-element="ordersChart"></div>
                <div data-element="salesChart"></div>
                <div data-element="customersChart"></div>
            </div>
            <h3 class="block-title">Bestsellers</h3>
            <div data-element="sortableTable"></div>
        </div>
    `;
  }

  createOrdersChart() {
    const ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      label: 'Orders',
      range: {
        from: this.from,
        to: this.to
      }
    });
    ordersChart.element.classList.add('dashboard__chart_orders');
    this.subscribe('date-select', async (from, to) => ordersChart.loadData(from, to));

    return ordersChart;
  }

  createSalesChart() {
    const salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      label: 'Sales',
      range: {
        from: this.from,
        to: this.to
      }
    });
    salesChart.element.classList.add('dashboard__chart_sales');
    this.subscribe('date-select', async (from, to) => salesChart.loadData(from, to));

    return salesChart;
  }

  createCustomersChart() {
    const customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      label: 'Customers',
      range: {
        from: this.from,
        to: this.to
      }
    });
    customersChart.element.classList.add('dashboard__chart_customers');
    this.subscribe('date-select', async (from, to) => customersChart.loadData(from, to));

    return customersChart;
  }

  createSortableTable() {
    const sortableTable = new SortableTable(header, {
      url: 'api/dashboard/bestsellers',
      range: {
        from: this.from,
        to: this.to
      },
      isSortLocally: true // server sort does not work
    });
    sortableTable.onWindowScroll = null; // infinite scroll does not work without server sort

    this.subscribe('date-select', async (from, to) => {
      const data = await sortableTable.loadData({from, to});
      sortableTable.renderRows(data);
    });

    return sortableTable;
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
    this.subscribers = null;
  }
}
