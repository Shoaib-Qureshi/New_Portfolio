type Gtag = (command: 'event', name: string, params?: Record<string, string | number>) => void;

// GA4 custom event. No-op when gtag hasn't loaded (dev, ad blockers), so call
// sites never need to guard.
export function track(name: string, params?: Record<string, string | number>) {
  (window as Window & { gtag?: Gtag }).gtag?.('event', name, params);
}
