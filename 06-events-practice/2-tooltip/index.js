class Tooltip {
  static instance;

  element;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }
    Tooltip.instance = this;
  }

  render(tooltip = '') {
    this.element.textContent = tooltip;
    this.element.style.position = "absolute";
    this.move(0, 0);
    document.body.append(this.element);
  }

  initialize() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<div class="tooltip">This is tooltip</div>`;
    this.element = wrapper.firstElementChild;

    document.addEventListener('pointerover', this.onPointerOver);
    document.addEventListener('pointerout', this.onPointerOut);
  }

  onPointerOver = (event) => {
    if (event.target.dataset.tooltip) {
      this.render(event.target.dataset.tooltip);
      event.target.addEventListener('pointermove', this.onPointerMove);
    }
  }

  onPointerOut = (event) => {
    if (event.target.dataset.tooltip) {
      event.target.removeEventListener('pointermove', this.onPointerMove);
      this.remove();
    }
  }

  onPointerMove = (event) => {
    this.move(event.clientX, event.clientY);
  }

  move(x, y) {
    this.element.style.left = x + 'px';
    this.element.style.top = y + 'px';
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    document.removeEventListener('pointerover', this.onPointerOver);
    document.removeEventListener('pointerout', this.onPointerOut);

    this.remove();
    this.element = null;
    Tooltip.instance = null;
  }
}

export default Tooltip;
