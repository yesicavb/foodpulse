// FoodPulse service worker: only used to show system notifications (Android needs one) and to open the app when tapped.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      const open = list.find((c) => c.url.includes("/foodpulse/"));
      return open ? open.focus() : self.clients.openWindow("./");
    })
  );
});
