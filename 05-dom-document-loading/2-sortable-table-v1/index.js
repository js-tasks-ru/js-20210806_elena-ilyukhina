export default class SortableTable {
  element;
  subElements = {};

  constructor(headerConfig = [], {data = []}) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.render();
  }

  getHeaderCell(column) {
    return `
        <div class="sortable-table__cell" data-id="${column.id}" data-sortable="${column.sortable}">
            <span>${column.title}</span>
            <span data-element="arrow" class="sortable-table__sort-arrow">
                <span class="sort-arrow"></span>
            </span>
        </div>
    `;
  }

  getDataRow(dataRow) {
    const defaultTemplate = data => `<div class="sortable-table__cell">${data}</div>`;

    return `
        <a href="/products/${dataRow.id}" class="sortable-table__row">
            ${this.headerConfig.map(({id, template}) => (template ?? defaultTemplate)(dataRow[id])).join('')}
        </a>
    `;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTable();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
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

  getTableBody() {
    return `
        <div data-element="body" class="sortable-table__body">
            ${this.getTableRows(this.data)}
        </div>
    `;
  }

  getTableRows(data) {
    return data.map(dataRow => this.getDataRow(dataRow)).join('');
  }

  getSubElements(element) {
    const result = {};
    for (const subElement of element.querySelectorAll('[data-element]')) {
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

  sort(fieldValue, orderValue) {
    const sortFunction = {
      string: (value1, value2) => value1.localeCompare(value2, ['ru', 'en'], {caseFirst: 'upper'}),
      number: (value1, value2) => value1 - value2
    };

    const sortOrder = {
      asc: 1,
      desc: -1
    };

    const sortType = this.headerConfig.find(({id}) => (id === fieldValue)).sortType;
    const sortedData = [...this.data].sort(
      (value1, value2) =>
        sortOrder[orderValue] * sortFunction[sortType](value1[fieldValue], value2[fieldValue])
    );
    this.subElements.body.innerHTML = this.getTableRows(sortedData);
  }
}

