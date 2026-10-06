import { AUTH } from "@/config/constants";

export function publishSessionChanged(): void {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return;
  }
  try {
    const channel = new BroadcastChannel(AUTH.broadcastChannel);
    channel.postMessage({ type: AUTH.broadcastEvent });
    channel.close();
  } catch {
    // Embedded browsers may not expose BroadcastChannel.
  }
}

export function subscribeSessionChanged(onChange: () => void): () => void {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return () => {};
  }
  try {
    const channel = new BroadcastChannel(AUTH.broadcastChannel);
    channel.onmessage = () => onChange();
    return () => channel.close();
  } catch {
    return () => {};
  }
}
