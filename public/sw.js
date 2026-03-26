self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'vipro store', body: 'لديك إشعار جديد' };
  const options = {
    body: data.body,
    icon: 'https://i.ibb.co/5WZRchqw/1764620392904-removebg-preview-1.png',
    badge: 'https://i.ibb.co/5WZRchqw/1764620392904-removebg-preview-1.png',
    data: data.url || '/'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});
