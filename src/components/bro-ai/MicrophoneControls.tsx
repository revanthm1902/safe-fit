
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';

interface MicrophoneControlsProps {
  micActive: boolean;
  onMicToggle: (active: boolean, transcript?: string) => void;
  hasAccess: boolean;
  speakText: (text: string) => void;
  onListeningChange: (listening: boolean) => void;
}

const MicrophoneControls: React.FC<MicrophoneControlsProps> = ({
  micActive,
  onMicToggle,
  hasAccess,
  speakText,
  onListeningChange
}) => {
  const recognitionRef = useRef<any>(null);

  const startMicrophone = async () => {
    if (!hasAccess) {
      speakText("You'll need a premium subscription to use voice features!");
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onstart = () => {
          onMicToggle(true);
          onListeningChange(true);
          speakText("I'm listening! Go ahead and speak.");
        };
        
        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          
          if (finalTranscript) {
            onMicToggle(false, finalTranscript);
            onListeningChange(false);
          }
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          onMicToggle(false);
          onListeningChange(false);
        };
        
        recognitionRef.current.onend = () => {
          onMicToggle(false);
          onListeningChange(false);
        };
        
        recognitionRef.current.start();
      } else {
        speakText("Sorry, your browser doesn't support speech recognition!");
      }
    } catch (err) {
      console.error("Error accessing microphone:", err);
      speakText("I couldn't access your microphone. Please check your permissions!");
    }
  };

  const stopMicrophone = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      onMicToggle(false);
      onListeningChange(false);
      speakText("Stopped listening.");
    }
  };

  return (
    <Button
      onClick={micActive ? stopMicrophone : startMicrophone}
      disabled={!hasAccess}
      variant="outline"
      size="sm"
      className={`${micActive ? 'bg-red-100 border-red-300' : 'bg-blue-100 border-blue-300'} hover:scale-105 transition-transform`}
    >
      {micActive ? <MicOff className="h-4 w-4 text-red-600" /> : <Mic className="h-4 w-4 text-blue-600" />}
    </Button>
  );
};

export default MicrophoneControls;
