import React, { useRef, useState, useEffect } from 'react';
import { Camera, X } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
  existingImage?: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, existingImage }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(existingImage || null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.error);
        };
        setStream(mediaStream);
        setIsCameraActive(true);
        setHasPermission(true);
        setErrorMessage(null);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      let message = 'Camera access denied or not available. Please use file upload instead.';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          message = 'Camera permission was denied. Please allow camera access and try again.';
        } else if (error.name === 'NotFoundError') {
          message = 'No camera found on your device. Please use file upload instead.';
        } else if (error.name === 'NotReadableError') {
          message = 'Camera is in use by another application. Please close other apps using the camera.';
        }
      }
      
      setHasPermission(false);
      setErrorMessage(message);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        // Flip horizontally for selfie view
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        context.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageDataUrl);
        onCapture(imageDataUrl);
        stopCamera();
      }
    }
  };

  const clearImage = () => {
    setCapturedImage(null);
    onCapture('');
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        {!isCameraActive && !capturedImage && (
          <button
            type="button"
            onClick={startCamera}
            className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Camera className="h-5 w-5 mr-2" />
            Open Camera
          </button>
        )}

        {hasPermission === false && errorMessage && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{errorMessage}</p>
          </div>
        )}

        {isCameraActive && (
          <div className="relative w-full max-w-md rounded-lg overflow-hidden border-2 border-gray-300">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{ transform: 'scaleX(-1)' }}
              className="w-full h-auto"
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
              <button
                type="button"
                onClick={captureImage}
                className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
              >
                Capture
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {capturedImage && (
          <div className="relative w-full max-w-md">
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="w-full h-auto rounded-lg border-2 border-gray-300" 
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};