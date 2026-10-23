import { useCallback, useEffect, useState } from 'react';

/**
 * Track browser permission for 'camera', 'microphone', 'geolocation', 'notifications'.
 * Gracefully degrades when Permissions API unavailable.
 */
export function usePermission(name) {
  const [state, setState] = useState(() => initial(name));

  useEffect(() => {
    let alive = true;
    const supported =
      typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query;

    if (!supported) {
      setState({ status: 'unsupported' });
      return undefined;
    }
    let permStatus = null;
    navigator.permissions
      .query({ name })
      .then((st) => {
        if (!alive) return;
        permStatus = st;
        setState({ status: st.state });
        st.onchange = () => {
          if (alive) setState({ status: st.state });
        };
      })
      .catch(() => {
        if (alive) setState({ status: 'unsupported' });
      });

    return () => {
      alive = false;
      if (permStatus) permStatus.onchange = null;
    };
  }, [name]);

  const refresh = useCallback(async () => {
    if (
      typeof navigator === 'undefined' ||
      !navigator.permissions ||
      !navigator.permissions.query
    ) {
      setState({ status: 'unsupported' });
      return;
    }
    try {
      const st = await navigator.permissions.query({ name });
      setState({ status: st.state });
    } catch {
      setState({ status: 'unsupported' });
    }
  }, [name]);

  return { ...state, refresh };
}

function initial(name) {
  if (typeof window === 'undefined' || !('permissions' in navigator)) {
    return { status: 'unsupported' };
  }
  // 'notifications' permission name supported in some browsers.
  if (name === 'notifications' && typeof Notification !== 'undefined') {
    if (Notification.permission === 'granted') return { status: 'granted' };
    if (Notification.permission === 'denied') return { status: 'denied' };
    return { status: 'prompt' };
  }
  return { status: 'prompt' };
}
