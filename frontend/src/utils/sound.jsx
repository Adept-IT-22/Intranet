
export const playNotificationSound = () => {
    const audio = new Audio("/sounds/notify.mp3");
    audio.play().catch(err => {
      console.warn("Notification sound blocked until user interacts with the page:", err);
    });
  };
  