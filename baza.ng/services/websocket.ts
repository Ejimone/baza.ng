import { AppState, type AppStateStatus } from "react-native";
import { API_BASE_URL } from "../utils/constants";
import type { AppNotification, WebSocketMessage } from "../types";

function buildWsUrl(token: string): string {
  const base = API_BASE_URL.replace(/\/v1$/, "");
  const protocol = base.startsWith("https") ? "wss" : "ws";
  const host = base.replace(/^https?:\/\//, "");
  return `${protocol}://${host}/ws/notifications/?token=${token}`;
}

type NotificationCallback = (notification: AppNotification) => void;

class NotificationWebSocket {
  private ws: WebSocket | null = null;
  private token: string | null = null;
  private onNotificationCb: NotificationCallback | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private backoff = 1000;
  private maxBackoff = 30000;
  private intentionalClose = false;
  private appStateSubscription: ReturnType<
    typeof AppState.addEventListener
  > | null = null;

  connect(token: string, onNotification: NotificationCallback) {
    this.token = token;
    this.onNotificationCb = onNotification;
    this.intentionalClose = false;
    this.backoff = 1000;
    this.openConnection();
    this.listenToAppState();
  }

  disconnect() {
    this.intentionalClose = true;
    this.clearReconnectTimer();
    this.appStateSubscription?.remove();
    this.appStateSubscription = null;
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    this.token = null;
    this.onNotificationCb = null;
  }

  private openConnection() {
    if (!this.token) return;
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws?.close();

    const url = buildWsUrl(this.token);
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.backoff = 1000;
    };

    this.ws.onmessage = (event) => {
      try {
        const msg: WebSocketMessage = JSON.parse(event.data as string);
        if (msg.type === "notification" && this.onNotificationCb) {
          this.onNotificationCb(msg.notification);
        }
      } catch {
        // Ignore malformed messages
      }
    };

    this.ws.onerror = () => {
      // onclose fires after onerror, reconnect handled there
    };

    this.ws.onclose = () => {
      if (!this.intentionalClose) {
        this.scheduleReconnect();
      }
    };
  }

  private scheduleReconnect() {
    this.clearReconnectTimer();
    this.reconnectTimer = setTimeout(() => {
      this.openConnection();
      this.backoff = Math.min(this.backoff * 2, this.maxBackoff);
    }, this.backoff);
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private listenToAppState() {
    this.appStateSubscription?.remove();
    this.appStateSubscription = AppState.addEventListener(
      "change",
      (state: AppStateStatus) => {
        if (this.intentionalClose) return;
        if (state === "active") {
          this.openConnection();
        }
      },
    );
  }
}

export const notificationWs = new NotificationWebSocket();
