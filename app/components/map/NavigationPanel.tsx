'use client';

import { useCallback } from 'react';
import {
  Navigation, MapPin, X, Volume2, VolumeX, CornerUpLeft,
  CornerUpRight, ArrowUp, RotateCcw, Flag, MoveRight, Locate
} from 'lucide-react';
import { RouteStep, formatDistance, formatETA, getManeuverIcon } from '../../services/routeService';

// ─── Types ───────────────────────────────────────────────────────────────────
interface NavigationPanelProps {
  currentStep: RouteStep | null;
  currentStepIndex: number;
  totalSteps: number;
  distanceToNextTurn: number;
  distanceToNextTurnFormatted: string;
  eta: string;
  remainingDuration: number;
  remainingDistance: number;
  destinationName: string;
  isRerouting: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onStopNavigation: () => void;
  language: string;
}

// ─── Maneuver Icon Component ─────────────────────────────────────────────────
function ManeuverIconComponent({ type, modifier }: { type: string; modifier?: string }) {
  const size = 28;
  const color = '#fff';

  if (type === 'arrive') return <Flag size={size} color="#10b981" fill="#10b981" />;
  if (type === 'depart') return <Navigation size={size} color={color} />;

  switch (modifier) {
    case 'left':
    case 'sharp left':
      return <CornerUpLeft size={size} color={color} />;
    case 'slight left':
      return <CornerUpLeft size={size} color={color} style={{ transform: 'rotate(20deg)' }} />;
    case 'right':
    case 'sharp right':
      return <CornerUpRight size={size} color={color} />;
    case 'slight right':
      return <CornerUpRight size={size} color={color} style={{ transform: 'rotate(-20deg)' }} />;
    case 'uturn':
      return <RotateCcw size={size} color="#f59e0b" />;
    case 'straight':
    default:
      return <ArrowUp size={size} color={color} />;
  }
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function NavigationPanel({
  currentStep,
  currentStepIndex,
  totalSteps,
  distanceToNextTurn,
  distanceToNextTurnFormatted,
  eta,
  remainingDuration,
  remainingDistance,
  destinationName,
  isRerouting,
  isMuted,
  onToggleMute,
  onStopNavigation,
  language,
}: NavigationPanelProps) {

  const t = useCallback((al: string, en: string) => language === 'al' ? al : en, [language]);

  const remainingMins = Math.max(1, Math.round(remainingDuration / 60));

  return (
    <>
      {/* ── TOP INSTRUCTION CARD ── */}
      <div
        id="nav-instruction-panel"
        style={{
          position: 'absolute',
          top: 'calc(16px + env(safe-area-inset-top, 0px))',
          left: '16px',
          right: '16px',
          zIndex: 2500,
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(20px) saturate(160%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '16px 20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          animation: 'slideDown 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        {/* Rerouting overlay */}
        {isRerouting && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '8px 0',
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'spin 1s linear infinite',
            }}>
              <RotateCcw size={20} style={{ color: '#f59e0b' }} />
            </div>
            <span style={{ color: '#f59e0b', fontWeight: '700', fontSize: '14px' }}>
              {t('Duke rillogaritur rrugën...', 'Rerouting...')}
            </span>
          </div>
        )}

        {/* Current instruction */}
        {!isRerouting && currentStep && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Maneuver icon */}
            <div style={{
              width: '56px', height: '56px', borderRadius: '18px',
              background: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <ManeuverIconComponent
                type={currentStep.maneuver.type}
                modifier={currentStep.maneuver.modifier}
              />
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Distance to turn */}
              <div style={{
                fontSize: '22px', fontWeight: '900', color: '#fff',
                letterSpacing: '-0.02em', lineHeight: '1.1',
              }}>
                {distanceToNextTurnFormatted}
              </div>
              {/* Instruction */}
              <p style={{
                margin: '4px 0 0', fontSize: '13px', fontWeight: '600',
                color: 'rgba(255,255,255,0.65)', lineHeight: '1.4',
                overflow: 'hidden', textOverflow: 'ellipsis',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>
                {currentStep.instruction}
              </p>
            </div>
          </div>
        )}

        {/* Step progress dots */}
        {totalSteps > 1 && (
          <div style={{
            display: 'flex', gap: '4px', marginTop: '12px', width: '100%',
          }}>
            {Array.from({ length: Math.min(totalSteps, 20) }).map((_, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1, height: '3px', borderRadius: '2px',
                  background: idx < currentStepIndex
                    ? '#10b981'
                    : idx === currentStepIndex
                      ? '#3b82f6'
                      : 'rgba(255,255,255,0.1)',
                  transition: 'background 0.3s',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── BOTTOM NAVIGATION DASHBOARD ── */}
      <div
        id="nav-bottom-panel"
        style={{
          position: 'absolute',
          bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
          left: '16px',
          right: '16px',
          zIndex: 2500,
          background: 'rgba(15, 20, 30, 0.94)',
          backdropFilter: 'blur(20px) saturate(160%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '16px 20px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          animation: 'slideUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        {/* ETA + remaining */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{
              fontSize: '26px', fontWeight: '900', color: '#10b981',
              letterSpacing: '-0.02em',
            }}>
              {remainingMins}
            </span>
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#10b981' }}>
              min
            </span>
          </div>
          <span style={{
            fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '600',
            marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {formatDistance(remainingDistance)} • {t('Mbërritja', 'ETA')}: {eta}
          </span>
        </div>

        {/* Destination tag */}
        <div style={{
          textAlign: 'center', background: 'rgba(255,255,255,0.03)',
          border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: '14px',
          padding: '6px 10px', flexShrink: 0, maxWidth: '110px',
        }}>
          <span style={{
            fontSize: '8px', color: 'rgba(255,255,255,0.3)', fontWeight: '800',
            textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block',
          }}>
            {t('Destinacioni', 'Destination')}
          </span>
          <span style={{
            fontSize: '11px', fontWeight: '700', color: '#fff', display: 'block',
            marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {destinationName || '—'}
          </span>
        </div>

        {/* Control buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {/* Mute toggle */}
          <button
            onClick={onToggleMute}
            style={{
              background: isMuted ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              border: isMuted ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '14px', width: '40px', height: '40px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isMuted ? '#ef4444' : '#10b981', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Stop navigation */}
          <button
            onClick={onStopNavigation}
            style={{
              background: 'rgba(239, 68, 68, 0.95)', border: 'none',
              borderRadius: '14px', height: '40px', width: '40px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
            }}
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Arrival Overlay ─────────────────────────────────────────────────────────
export function ArrivalOverlay({
  destinationName,
  onDismiss,
  language,
}: {
  destinationName: string;
  onDismiss: () => void;
  language: string;
}) {
  return (
    <div
      id="arrival-overlay"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(12px)',
        animation: 'fadeIn 0.4s ease',
      }}
    >
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '28px',
        padding: '32px 28px',
        maxWidth: '340px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
        animation: 'slideUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}>
        {/* Success icon */}
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '2px solid rgba(16, 185, 129, 0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <Flag size={32} color="#10b981" fill="#10b981" />
        </div>

        <h2 style={{
          color: '#fff', fontSize: '20px', fontWeight: '900',
          margin: '0 0 8px', letterSpacing: '-0.02em',
        }}>
          {language === 'al' ? 'Keni mbërritur!' : 'You have arrived!'}
        </h2>

        <p style={{
          color: 'rgba(255,255,255,0.5)', fontSize: '14px',
          margin: '0 0 24px', lineHeight: '1.5',
        }}>
          {destinationName}
        </p>

        <button
          onClick={onDismiss}
          style={{
            width: '100%', padding: '14px', borderRadius: '16px',
            background: '#10b981', border: 'none', color: '#fff',
            fontSize: '15px', fontWeight: '800', cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)',
            transition: 'all 0.2s',
          }}
        >
          {language === 'al' ? 'Mbyll' : 'Done'}
        </button>
      </div>
    </div>
  );
}
