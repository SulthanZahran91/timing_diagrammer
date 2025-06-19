import type { EventType, EventData } from '../types';

type EventCallback<T extends EventType> = (data: EventData[T]) => void;

interface EventListener {
  callback: EventCallback<EventType>;
  once: boolean;
}

export class EventManager {
  private listeners: Map<EventType, Set<EventListener>> = new Map();
  private destroyed = false;

  on<T extends EventType>(event: T, callback: EventCallback<T>): void {
    if (this.destroyed) return;

    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const listeners = this.listeners.get(event)!;
    listeners.add({ callback: callback as EventCallback<EventType>, once: false });
  }

  off<T extends EventType>(event: T, callback: EventCallback<T>): void {
    const listeners = this.listeners.get(event);
    if (!listeners) return;

    listeners.forEach(listener => {
      if (listener.callback === callback) {
        listeners.delete(listener);
      }
    });

    if (listeners.size === 0) {
      this.listeners.delete(event);
    }
  }

  emit<T extends EventType>(event: T, data: EventData[T]): void {
    if (this.destroyed) return;

    const listeners = this.listeners.get(event);
    if (!listeners || listeners.size === 0) return;

    const listenersCopy = Array.from(listeners);

    for (const listener of listenersCopy) {
      try {
        listener.callback(data);
        if (listener.once) {
          listeners.delete(listener);
        }
      } catch (error) {
        console.error(`Error in event listener for '${event}':`, error);
      }
    }

    if (listeners.size === 0) {
      this.listeners.delete(event);
    }
  }

  destroy(): void {
    this.listeners.clear();
    this.destroyed = true;
  }
} 