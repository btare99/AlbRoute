'use client';

import React from 'react';

interface IonIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  icon: string;
}

export function IonIcon({ icon, style, className, ...props }: IonIconProps) {
  if (typeof icon === 'string' && icon.startsWith('data:image/svg+xml')) {
    let svgContent = icon.replace(/^data:image\/svg\+xml;utf8,/, '');
    
    // In case it's url encoded
    if (svgContent.includes('%')) {
      try {
        svgContent = decodeURIComponent(svgContent);
      } catch (e) {
        // Fallback
      }
    }

    return (
      <span
        className={`custom-ion-icon ${className || ''}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '1em',
          height: '1em',
          lineHeight: '1',
          ...style,
        }}
        dangerouslySetInnerHTML={{ __html: svgContent }}
        {...props}
      />
    );
  }

  return null;
}
