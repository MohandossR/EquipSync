self.addEventListener("push", event => {
    const data = event.data
        ? event.data.json()
        : {
            title: "EquipSync",
            message: "New notification"
        };

    event.waitUntil(
        self.registration.showNotification(
            data.title || "EquipSync",
            {
                body: data.message || "",
                icon: "/favicon.ico",
                badge: "/favicon.ico",
                actions: data.actions || []
            }
        )
    );
});

self.addEventListener("notificationclick", event => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow("/technician")
    );
});