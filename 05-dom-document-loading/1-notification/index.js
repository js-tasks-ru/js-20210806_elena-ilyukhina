export default class NotificationMessage {

  static element = NotificationMessage.init();
  static timeoutId = null;

  static init() {
    NotificationMessage.element = document.createElement('div');
    document.body.append(NotificationMessage.element);
    return NotificationMessage.element;
  }

  constructor(
    message = '', {
      duration = 2000,
      type = 'success'
    }) {
    this.message = message;
    this.duration = duration;
    this.type = type;
  }

  show() {
    if (NotificationMessage.timeoutId)
      clearTimeout(NotificationMessage.timeoutId);

    NotificationMessage.element.innerHTML = `
        <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
            <div class="timer"></div>
            <div class="inner-wrapper">
                <div class="notification-header">${this.type}</div>
                <div class="notification-body">
                    ${this.message}
                </div>
            </div>
        </div>
    `;
    NotificationMessage.timeoutId = setTimeout(() => NotificationMessage.element.innerHTML = ``, this.duration);
  }
}
