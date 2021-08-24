export default class SortableTable {

  element = document.createElement('div');
  subElements = {
    header: document.createElement('div'),
    body: document.createElement('div')
  };

  constructor(headerConfig = [], {data = []}) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.sort();
  }

  renderHeader(header) {
    const sortArrow = `
        <span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
        </span>
    `;

    return `
        <div class="sortable-table__cell" data-id="${header.id}" data-sortable="${header.sortable}">
            <span>${header.title}</span>
            ${header.sortType === 'string' ? sortArrow : ``}
        </div>
    `;
  }

  defaultTemplate(data) {
    return `<div class="sortable-table__cell">${data}</div>`;
  }

  renderDataRow(dataRow, index) {
    return `
        <a href="/products/${dataRow.id}" class="sortable-table__row">
            ${this.headerConfig.map(header => (header.template ?? this.defaultTemplate)(dataRow[header.id])).join('')}
        </a>
    `;
  }

  render() {
    // Header
    this.subElements.header.innerHTML = `
        <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.headerConfig.map(header => this.renderHeader(header)).join('')}
        </div>
    `;

    // Body
    this.subElements.body.innerHTML = `
        <div data-element="body" class="sortable-table__body">
            ${this.data.map((dataRow, index) => this.renderDataRow(dataRow, index)).join('')}
        </div>
    `;

    // Table
    this.element.innerHTML = `
        <div data-element="productsContainer" class="products-list__container">
            <div class="sortable-table">
                ${this.subElements.header.innerHTML}
                ${this.subElements.body.innerHTML}
            </div>
        </div>
    `;

    this.subElements.header = this.subElements.header.firstElementChild;
    this.subElements.body = this.subElements.body.firstElementChild;
    this.element = this.element.firstElementChild;
  }

  destroy() {
    this.element.innerHTML = '';
    this.element.remove();
  }

  sort(fieldValue = 'title', orderValue) {
    const sortFunction = {
      string: (value1, value2) => value1.localeCompare(value2, ['ru', 'en'], {caseFirst: 'upper'}),
      number: (value1, value2) => value1 - value2
    };

    const sortOrder = {
      asc: 1,
      desc: -1
    };

    const sortType = this.headerConfig.find(header => header.id === fieldValue).sortType;

    this.data.sort((value1, value2) => sortOrder[orderValue] * sortFunction[sortType](value1[fieldValue], value2[fieldValue]));
    this.render();
  }
}

