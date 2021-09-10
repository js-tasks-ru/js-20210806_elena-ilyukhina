export default class SortableList {
  element;

  constructor({items = []}) {
    this.items = items;
    this.render();
    this.initEventListeners();
  }

  render() {
    this.element = document.createElement('ul');
    this.element.classList.add('sortable-list');

    this.items.forEach(item => {
      item.classList.add('sortable-list__item');
    });

    this.element.append(...this.items);
  }

  initEventListeners() {
    this.element.addEventListener('pointerdown', this.onPointerDown);
    this.element.addEventListener('pointerup', this.onPointerUp);
    this.element.addEventListener('dragstart', () => false);
  }

  onPointerDown = (event) => {
    event.preventDefault();

    const grabHandle = event.target.closest('.sortable-list__item [data-grab-handle]');
    if (grabHandle) {
      this.grab(event, grabHandle);
      return;
    }

    const deleteHandle = event.target.closest('.sortable-list__item [data-delete-handle]');
    if (deleteHandle) {
      this.delete(event, deleteHandle);
    }
  }

  grab(event, handle) {
    this.shiftX = event.clientX - handle.getBoundingClientRect().left;
    this.shiftY = event.clientY - handle.getBoundingClientRect().top;

    const item = handle.closest('.sortable-list__item');
    this.addPlaceholder(item);
    this.startDragging(item);
  }

  delete(event, handle) {
    const item = handle.closest('.sortable-list__item');
    item.remove();
  }

  startDragging(element) {
    const rect = element.getBoundingClientRect();

    element.classList.add('sortable-list__item_dragging');
    element.style.width = `${rect.width}px`;
    element.style.height = `${rect.height}px`;
    element.style.left = `${rect.left}px`;
    element.style.top = `${rect.top}px`;

    // move to the bottom of the list
    element.parentElement.append(element);

    document.addEventListener('pointermove', this.onPointerMove);
  }

  stopDragging(element) {
    element.classList.remove('sortable-list__item_dragging');
    element.style.width = '';
    element.style.height = '';
    element.style.left = '';
    element.style.top = '';

    document.removeEventListener('pointermove', this.onPointerMove);
  }

  addPlaceholder(element) {
    const placeholder = document.createElement('div');
    const rect = element.getBoundingClientRect();

    placeholder.classList.add('sortable-list__placeholder');
    placeholder.style.width = `${rect.width}px`;
    placeholder.style.height = `${rect.height}px`;

    element.before(placeholder);
  }

  removePlaceholder(element) {
    const placeholder = this.element.querySelector('.sortable-list__placeholder');

    if (placeholder) {
      placeholder.before(element);
      placeholder.remove();
    }
  }

  moveAt(element, x, y) {
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  }

  onPointerMove = (event) => {
    const item = this.element.querySelector('.sortable-list__item.sortable-list__item_dragging');
    if (!item) {
      return;
    }

    event.preventDefault();

    const x = event.clientX - this.shiftX;
    const y = event.clientY - this.shiftY;
    this.moveAt(item, x, y);

    const placeholder = this.element.querySelector('.sortable-list__placeholder');
    const previous = placeholder.previousElementSibling;
    const next = placeholder.nextElementSibling;

    if (previous && previous.getBoundingClientRect().top > y) {
      previous.before(placeholder);
      return;
    }

    if (next && next.getBoundingClientRect().top < y) {
      next.after(placeholder);
    }
  }

  onPointerUp = (event) => {
    const item = event.target.closest('.sortable-list__item.sortable-list__item_dragging');
    if (!item) {
      return;
    }

    this.stopDragging(item);
    this.removePlaceholder(item);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
