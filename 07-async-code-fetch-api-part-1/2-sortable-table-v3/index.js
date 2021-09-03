import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};
  pageSize = 30;

  constructor(headerConfig = [], {
    url = '',
    isSortLocally = false,
    sorted = {
      id: headerConfig.find(item => item.sortable).id,
      order: 'asc'
    }
  } = {}) {
    this.headerConfig = headerConfig;
    this.url = new URL(url, BACKEND_URL);
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.data = [];
    this.start = 0;
    this.end = this.pageSize;
    this.render()
      .catch(reason => console.log(reason));
  }

  sortOnClient(id, order) {
    this.updateTable(id, order, this.sortData(id, order));
  }

  sortOnServer(id, order) {
    this.start = 0;
    this.end = this.pageSize;

    this.loadData()
      .then(result => this.updateTable(id, order, result))
      .catch(reason => console.log(reason));
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('scroll', this.onScroll);
  }

  onPointerDown = (event) => {
    const column = event.target.closest('.sortable-table__cell[data-sortable="true"]');

    if (!column) {
      return;
    }

    const toggle = {
      asc: 'desc',
      desc: 'asc'
    };

    this.sort(column.dataset.id, toggle[column.dataset.order]);
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTable();

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.data = await this.loadData();

    this.updateBody();
    this.initEventListeners();
  }

  updateTable(id, order, data) {
    this.sorted = {id, order};
    this.data = data;

    this.updateHeader();
    this.updateBody();
  }

  updateHeader() {
    const sortableColumns = this.subElements.header.querySelectorAll('[data-sortable="true"]');
    const sortedColumn = this.subElements.header.querySelector(`[data-id="${this.sorted.id}"]`);

    sortableColumns.forEach(column => {
      column.dataset.order = this.sorted.order;
    });

    sortedColumn.appendChild(this.subElements.arrow);
  }

  updateBody(data = this.data, append = false) {
    if (append) {
      this.subElements.body.innerHTML = this.subElements.body.innerHTML.concat(this.getTableRows(data));
    } else {
      this.subElements.body.innerHTML = this.getTableRows(data);
    }
  }

  getTable() {
    return `
        <div class="sortable-table">
            ${this.getTableHeader()}
            ${this.getTableBody()}
            ${this.getTableLoading()}
            ${this.getTableEmpty()}
        </div>
    `;
  }

  getTableHeader() {
    return `
        <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.headerConfig.map(column => this.getHeaderCell(column)).join('')}
        </div>
    `;
  }

  getHeaderCell({id, title, sortable}) {
    const arrow =`
        <span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
        </span>
    `;

    return `
        <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${this.sorted.order}">
            <span>${title}</span>
            ${id === this.sorted.id ? arrow : ''}
        </div>
    `;
  }

  getTableBody() {
    return `
        <div data-element="body" class="sortable-table__body">
            ${this.getTableRows(this.data)}
        </div>
    `;
  }

  getTableRows(data) {
    return data.map(dataRow => `
        <a href="/products/${dataRow.id}" class="sortable-table__row">
            ${this.getTableRow(dataRow)}
        </a>
    `).join('');
  }

  getTableRow(dataRow) {
    return this.headerConfig.map(({id, template}) =>
      template ? template(dataRow[id]) : `<div class="sortable-table__cell">${dataRow[id]}</div>`).join('');
  }

  getTableLoading() {
    return `
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
    `;
  }

  getTableEmpty() {
    return `
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
            <div>
                <p>No products satisfy your filter criteria</p>
                <button type="button" class="button-primary-outline">Reset all filters</button>
            </div>
        </div>
    `;
  }

  getSubElements(parent) {
    const result = {};

    for (const subElement of parent.querySelectorAll('[data-element]')) {
      result[subElement.dataset.element] = subElement;
    }
    return result;
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
    window.removeEventListener('scroll', this.onScroll);
  }

  sort(id, order) {
    if (this.isSortLocally) {
      this.sortOnClient(id, order);
    } else {
      this.sortOnServer(id, order);
    }
  }

  buildUrl() {
    this.url.searchParams.set('_sort', this.sorted.id);
    this.url.searchParams.set('_order', this.sorted.order);
    this.url.searchParams.set('_start', String(this.start));
    this.url.searchParams.set('_end', String(this.end));
    return this.url;
  }

  onScroll = (event) => {
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight) {
      this.start = this.data.length;
      this.end = this.start + this.pageSize;

      this.loadData()
        .then(result => {
          if (result.length) {
            this.data = this.data.concat(result);
            this.updateBody(result, true);
          }
        })
        .catch(reason => console.log(reason));
    }
  }

  async loadData() {
    this.setLoading(true);

    const data = await fetchJson(this.buildUrl());

    this.setLoading(false);
    return data;
  }

  setLoading(isLoading) {
    if (isLoading) {
      this.element.classList.add('sortable-table_loading');
    } else {
      this.element.classList.remove('sortable-table_loading');
    }
  }

  sortData(id, order) {
    const sortedColumn = this.headerConfig.find(column => column.id === id);
    const sortType = sortedColumn.sortType;

    const sortFunction = {
      string: (value1, value2) => value1.localeCompare(value2, ['ru', 'en'], {caseFirst: 'upper'}),
      number: (value1, value2) => value1 - value2,
      custom: sortedColumn.sortFunction
    };

    const direction = {
      asc: 1,
      desc: -1
    };

    return [...this.data].sort((value1, value2) =>
      direction[order] * sortFunction[sortType](value1[id], value2[id])
    );
  }
}
