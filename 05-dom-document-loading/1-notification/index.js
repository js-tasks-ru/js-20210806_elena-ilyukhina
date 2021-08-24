export default class NotificationMessage {

  static isRunning = false;

  constructor(message = '', {duration = 0, type = ''} = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;
    this.render();
  }

  render() {
    this.element = document.createElement('div');
    this.element.innerHTML = `
        <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
            <div class="timer"></div>
            <div class="inner-wrapper">
                <div class="notification-header">${this.type}</div>
                <div class="notification-body">${this.message}</div>
            </div>
        </div>
    `;
    this.element = this.element.firstElementChild;
  }

  show(element = document.body) {
    if (!NotificationMessage.isRunning) {
      element.append(this.element);
      NotificationMessage.isRunning = true;
      setTimeout(() => {this.remove()}, this.duration)
    }
  }

  remove() {
    this.element.remove();
    NotificationMessage.isRunning = false;
  }

  destroy() {
    this.remove();
  }
}
