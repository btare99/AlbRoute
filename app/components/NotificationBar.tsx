'use client';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

const ICONS: any = { success: CheckCircle, info: Info, warning: AlertTriangle, error: X };
const COLORS: any = { success:'var(--success)', info:'var(--primary)', warning:'var(--warning)', error:'var(--danger)' };
const BG: any = { success:'rgba(16,185,129,0.08)', info:'rgba(59,130,246,0.08)', warning:'rgba(245,158,11,0.08)', error:'rgba(239,68,68,0.08)' };

export default function NotificationBar() {
  const notifications = useStore((state: any) => state.notifications);

  return (
    <div className="notification-container">
      <AnimatePresence>
        {notifications && notifications.map((n: any) => {
          const Icon = ICONS[n.type] || Info;
          return (
            <motion.div key={n.id}
              initial={{ opacity:0, x:50, scale:0.9 }}
              animate={{ opacity:1, x:0, scale:1 }}
              exit={{ opacity:0, x:50, scale:0.9 }}
              style={{ background:BG[n.type]||BG.info, border:`1px solid ${COLORS[n.type]||COLORS.info}33`, borderRadius:'12px', padding:'14px 16px', display:'flex', gap:'12px', alignItems:'flex-start', backdropFilter:'blur(12px)', pointerEvents:'all', boxShadow:'0 8px 24px rgba(0,0,0,0.3)' }}>
              <Icon size={18} style={{ color: COLORS[n.type]||COLORS.info, flexShrink:0, marginTop:'1px' }} />
              <p style={{ fontSize:'13px', lineHeight:'1.4', color:'var(--text)' }}>{n.msg}</p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
