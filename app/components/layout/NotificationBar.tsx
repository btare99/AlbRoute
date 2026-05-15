'use client';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../../store/useStore';
import { CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

const ICONS: any = { success: CheckCircle, info: Info, warning: AlertTriangle, error: X };
const COLORS: any = { success:'var(--success)', info:'var(--primary)', warning:'var(--warning)', error:'var(--danger)' };
const BG: any = { success:'rgba(16,185,129,0.08)', info:'rgba(59,130,246,0.08)', warning:'rgba(245,158,11,0.08)', error:'rgba(239,68,68,0.08)' };

export default function NotificationBar() {
  const notifications = useStore((state: any) => state.notifications);
  const removeNotification = useStore((state: any) => state.removeNotification);

  return (
    <div className="notification-container">
      <AnimatePresence mode="popLayout">
        {notifications && notifications.map((n: any) => {
          const Icon = ICONS[n.type] || Info;
          return (
            <motion.div 
              key={n.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`notification-item ${n.type || 'info'}`}
            >
              <div className="notification-content">
                <Icon size={18} className="notification-icon" />
                <p className="notification-msg">{n.msg}</p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
