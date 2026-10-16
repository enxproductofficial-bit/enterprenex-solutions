// Native Browser Push Notification Manager for Enterprenex EWMS

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      return reg;
    } catch (err) {
      console.warn('[PWA] Service worker registration error:', err);
      return null;
    }
  }
  return null;
};

export const isPushSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getPushPermissionState = (): NotificationPermission => {
  if (!isPushSupported()) return 'denied';
  return Notification.permission;
};

export const requestPushPermission = async (): Promise<NotificationPermission> => {
  if (!isPushSupported()) return 'denied';
  try {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      localStorage.setItem('ewms_push_enabled', 'true');
      sendNativePushNotification('Enterprenex EWMS Notifications Active', {
        body: 'You will receive real-time updates for shift tracking, leave approvals, and tasks.',
        icon: '/images/logo.svg'
      });
    }
    return perm;
  } catch (err) {
    console.error('Failed to request notification permission:', err);
    return 'denied';
  }
};

export const sendNativePushNotification = async (title: string, options?: NotificationOptions) => {
  if (!isPushSupported() || Notification.permission !== 'granted') return;

  const defaultOptions: NotificationOptions = {
    icon: '/images/logo.svg',
    badge: '/favicon.svg',
    ...options
  };

  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.ready.catch(() => null);
    if (reg && reg.showNotification) {
      reg.showNotification(title, defaultOptions);
      return;
    }
  }

  // Fallback to standard window Notification
  try {
    new Notification(title, defaultOptions);
  } catch {
    // Ignore if not supported in foreground
  }
};
