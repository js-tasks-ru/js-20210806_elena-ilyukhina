export default class NotificationMessage {

  static currentNotification = null;

  constructor(message = '', {duration = 0, type = ''} = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;
    this.render();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
            <div class="timer"></div>
            <div class="inner-wrapper">
                <div class="notification-header">${this.type}</div>
                <div class="notification-body">${this.message}</div>
            </div>
        </div>
    `;
    this.element = wrapper.firstElementChild;
  }

  show(element = document.body) {
    if (NotificationMessage.currentNotification) {
      NotificationMessage.currentNotification.remove();
    }

    element.append(this.element);

    this.timeoutId = setTimeout(() => {this.remove()}, this.duration)
    NotificationMessage.currentNotification = this;
  }

  remove() {
    if (this.element)
      this.element.remove();
    clearTimeout(this.timeoutId);
  }

  destroy() {
    this.remove();
    this.element = null;
    NotificationMessage.currentNotification = null;
  }
}
