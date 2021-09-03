export default class SortableTable {
  element;
  subElements = {};

  constructor(headerConfig = [], {
    data = [],
    sorted = {}
  } = {}, sortLocally = true) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.sorted = sorted;
    this.sortLocally = sortLocally;

    this.render();
    this.initEventListeners();
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onPointerDown);
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

    this.sorted.id = column.dataset.id;
    this.sorted.order = toggle[column.dataset.order];

    this.sort();
  }

  render() {
    this.sortData();

    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTable();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.updateColumns();
  }

  updateColumns() {
    const sortableColumns = this.subElements.header.querySelectorAll('[data-sortable="true"]');
    const sortedColumn = this.subElements.header.querySelector(`[data-id="${this.sorted.id}"]`);

    sortableColumns.forEach(column => {
      column.dataset.order = this.sorted.order;
    });

    sortedColumn.appendChild(this.subElements.arrow);
  }

  getTable() {
    return `
        <div class="sortable-table">
            ${this.getTableHeader()}
            ${this.getTableBody()}
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
            ${this.getTableRows()}
        </div>
    `;
  }

  getTableRows() {
    return this.data.map(dataRow => `
        <a href="/products/${dataRow.id}" class="sortable-table__row">
            ${this.getTableRow(dataRow)}
        </a>
    `).join('');
  }

  getTableRow(dataRow) {
    return this.headerConfig.map(({id, template}) =>
      template ? template(dataRow[id]) : `<div class="sortable-table__cell">${dataRow[id]}</div>`).join('');
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
  }

  sort () {
    if (this.sortLocally) {
      this.sortOnClient();
    } else {
      this.sortOnServer();
    }
  }

  sortOnClient() {
    this.sortData();

    this.subElements.body.innerHTML = this.getTableRows();

    this.updateColumns();
  }

  sortOnServer() {
    // not implemented
  }

  sortData() {
    const sortedColumn = this.headerConfig.find(({id}) => id === this.sorted.id);
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

    this.data.sort((value1, value2) =>
      direction[this.sorted.order] * sortFunction[sortType](value1[this.sorted.id], value2[this.sorted.id])
    );
  }
}
