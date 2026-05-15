'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../../store/useStore';
import { CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

const ICONS: any = { success: CheckCircle, info: Info, warning: AlertTriangle, error: X };

function NotificationItem({ n, onRemove }: { n: any, onRemove: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(n.id);
    }, 2000);
    return () => clearTimeout(timer);
  }, [n.id, onRemove]);

  const Icon = ICONS[n.type] || Info;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
      className={`notification-item ${n.type || 'info'}`}
    >
      <div className="notification-content">
        <Icon size={18} className="notification-icon" />
        <p className="notification-msg">{n.msg}</p>
      </div>
    </motion.div>
  );
}

export default function NotificationBar() {
  const notifications = useStore((state: any) => state.notifications);
  const removeNotification = useStore((state: any) => state.removeNotification);
  const isSplashFinished = useStore((state: any) => state.isSplashFinished);

  // Mos shfaq asgjë nëse Splash Screen është akoma aktiv
  if (!isSplashFinished) return null;

  return (
    <div className="notification-container">
      <AnimatePresence>
        {notifications && notifications.map((n: any) => (
          <NotificationItem key={n.id} n={n} onRemove={removeNotification} />
        ))}
      </AnimatePresence>
    </div>
  );
}
