'use client';
import { useState, useRef, useEffect } from 'react';
import { IonIcon } from '@/app/components/common/IonIcon';
import { cameraOutline, personCircleOutline, alertCircleOutline, checkmarkCircleOutline, syncOutline } from 'ionicons/icons';
import * as faceapi from 'face-api.js';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

interface FacePhotoUploadProps {
  onPhotoDetected: (photo: string) => void;
  currentPhoto: string | null;
}

export default function FacePhotoUpload({ onPhotoDetected, currentPhoto }: FacePhotoUploadProps) {
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentPhoto);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        // Load tiny face detector model from /models directory
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        setIsModelLoading(false);
      } catch (err) {
        console.error('Failed to load face-api models:', err);
        setError('Dështoi ngarkimi i sistemit të verifikimit.');
      }
    };
    loadModels();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsDetecting(true);

    try {
      // 1. Convert file to image element for face-api
      const imageUrl = URL.createObjectURL(file);
      const img = new Image();
      img.src = imageUrl;

      await new Promise((resolve) => (img.onload = resolve));

      // 2. Perform detection
      const detections = await faceapi.detectAllFaces(
        img,
        new faceapi.TinyFaceDetectorOptions()
      );

      if (detections.length === 0) {
        setError('Nuk u detektua asnjë fytyrë. Ju lutem përdorni një foto ku fytyra duket qartë.');
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else if (detections.length > 1) {
        setError('U detektuan shumë fytyra. Ju lutem përdorni një foto vetëm me një person.');
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        // Success!
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          setPreview(base64);
          onPhotoDetected(base64);
        };
        reader.readAsDataURL(file);
      }
      
      URL.revokeObjectURL(imageUrl);
    } catch (err) {
      console.error('Detection error:', err);
      setError('Ndodhi një gabim gjatë verifikimit të fotos.');
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
      
      {/* Profile Photo Display */}
      <div 
        onClick={() => !isModelLoading && fileInputRef.current?.click()}
        style={{ 
          width: '280px', 
          height: '300px', 
          borderRadius: '18px', 
          background: 'rgba(255, 255, 255, 0.05)',
          border: `2px dashed ${error ? '#ef4444' : preview ? '#10b981' : 'rgba(255, 255, 255, 0.2)'}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: (isModelLoading || isDetecting) ? 'wait' : 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}
      >
        {(isModelLoading || isDetecting) ? (
          <div className="skeleton" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ width: '120px', height: '10px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ width: '80px', height: '10px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }} />
            <span style={{ position: 'absolute', bottom: '20px', fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {isModelLoading ? 'Duke u inicializuar...' : 'Duke verifikuar...'}
            </span>
          </div>
        ) : preview ? (
          <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile preview" />
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <IonIcon icon={cameraOutline} style={{ fontSize: 48, color: 'rgba(255,255,255,0.2)' }} />
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '12px' }}>
              Kliko për të ngarkuar foton
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={async () => {
          setError(null);
          try {
            const photo = await Camera.getPhoto({
              quality: 70,
              resultType: CameraResultType.Base64,
              source: CameraSource.Prompt,
              width: 800
            });
            if (photo && photo.base64String) {
              const base64Data = `data:${photo.format};base64,${photo.base64String}`;
              setPreview(base64Data);
              onPhotoDetected(base64Data);
              setError(null);
            }
          } catch (cameraError) {
            console.warn('Camera capture failed:', cameraError);
            setError('Ndodhi një gabim gjatë marrjes së fotos. Ju lutem provoni përsëri.');
          }
        }}
        style={{
          width: '100%', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px',
          background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '12px 16px',
          cursor: 'pointer', fontSize: '14px', fontWeight: 600
        }}
      >
        Përdor kamerën për të marrë foton
      </button>

      {/* Feedback Messages */}
      {error && (
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '8px', 
          background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
          padding: '10px 16px', borderRadius: '12px', color: '#ef4444', fontSize: '13px'
        }}>
          <IonIcon icon={alertCircleOutline} style={{ fontSize: 16, color: '#ef4444' }} />
          {error}
        </div>
      )}

      {preview && !isDetecting && !error && (
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '8px', 
          background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
          padding: '8px 14px', borderRadius: '12px', color: '#10b981', fontSize: '13px'
        }}>
          <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: 16, color: '#10b981' }} />
          Fotoja u verifikua me sukses!
        </div>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 0.8; }
          100% { opacity: 0.5; }
        }
        .skeleton {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
