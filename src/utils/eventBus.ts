type Handler = (payload?: any) => void;

class EventBus {
  private handlers: { [event: string]: Handler[] } = {};

  on(event: string, fn: Handler) {
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event].push(fn);
    return () => this.off(event, fn);
  }

  off(event: string, fn?: Handler) {
    if (!this.handlers[event]) return;
    if (!fn) {
      delete this.handlers[event];
      return;
    }
    this.handlers[event] = this.handlers[event].filter((h) => h !== fn);
  }

  emit(event: string, payload?: any) {
    (this.handlers[event] || []).slice().forEach((h) => h(payload));
  }
}

export default new EventBus();
