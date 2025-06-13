
import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, CameraOff } from 'lucide-react';
import * as faceapi from 'face-api.js';

interface CameraControlsProps {
  isModelLoaded: boolean;
  cameraActive: boolean;
  onEmotionChange: (emotion: string) => void;
  onCameraToggle: (active: boolean) => void;
  hasAccess: boolean;
  speakText: (text: string) => void;
  isListening: boolean;
}

const CameraControls: React.FC<CameraControlsProps> = ({
  isModelLoaded,
  cameraActive,
  onEmotionChange,
  onCameraToggle,
  hasAccess,
  speakText,
  isListening
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    if (!isModelLoaded) {
      speakText("Hey, I'm still loading my face detection models. Give me a moment!");
      return;
    }
    
    if (!hasAccess) {
      speakText("You'll need a premium subscription to use my camera features!");
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 },
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        onCameraToggle(true);
        speakText("Camera activated! I can now see your expressions!");
        
        videoRef.current.addEventListener('play', () => {
          const canvas = canvasRef.current;
          const displaySize = { 
            width: videoRef.current?.videoWidth || 640, 
            height: videoRef.current?.videoHeight || 480 
          };

          if (canvas) {
            faceapi.matchDimensions(canvas, displaySize);
          }
          
          setInterval(async () => {
            if (videoRef.current && cameraActive) {
              const detections = await faceapi.detectAllFaces(
                videoRef.current, 
                new faceapi.TinyFaceDetectorOptions()
              ).withFaceLandmarks().withFaceExpressions();
              
              if (detections && detections[0]?.expressions) {
                const expressions = detections[0].expressions;
                const maxExpression = Object.entries(expressions)
                  .reduce((prev, current) => {
                    return (prev[1] > current[1]) ? prev : current;
                  });
                
                if (maxExpression[1] > 0.6) {
                  onEmotionChange(maxExpression[0]);
                }
              }
              
              if (canvas && detections.length > 0) {
                const resizedDetections = faceapi.resizeResults(detections, displaySize);
                canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
                faceapi.draw.drawDetections(canvas, resizedDetections);
                faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
                faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
              }
            }
          }, 500);
        });
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      speakText("Oops! I couldn't access your camera. Make sure you've given permission!");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      
      if (canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        if (context) context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      
      onCameraToggle(false);
      speakText("Camera turned off. I'm still here if you need me!");
    }
  };

  return (
    <>
      <Button
        onClick={cameraActive ? stopCamera : startCamera}
        disabled={!isModelLoaded || !hasAccess}
        variant="outline"
        size="sm"
        className={`border-gray-600 ${cameraActive ? 'bg-red-600 border-red-500 hover:bg-red-700' : 'bg-gray-800 hover:bg-gray-700'} text-white`}
      >
        {cameraActive ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
      </Button>

      {cameraActive && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <Card className="overflow-hidden bg-gray-900 border-gray-700 shadow-xl max-w-md w-full">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto rounded-lg"
                style={{ maxHeight: '300px', objectFit: 'cover' }}
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
              />
              {isListening && (
                <motion.div 
                  className="absolute bottom-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  🎤 Listening...
                </motion.div>
              )}
              <Button
                onClick={stopCamera}
                className="absolute top-4 right-4 bg-red-600 hover:bg-red-700"
                size="sm"
              >
                <CameraOff className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </>
  );
};

export default CameraControls;
