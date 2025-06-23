import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Testing mode - set to true for direct Gemini interaction without wellness wrapper
const IS_TESTING = import.meta.env.VITE_IS_TESTING === 'true' || false;

if (!API_KEY) {
  console.warn('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file');
}

console.log(`BroAI Mode: ${IS_TESTING ? 'TESTING (Direct Gemini)' : 'WELLNESS (Wrapped)'}`);

const genAI = new GoogleGenerativeAI(API_KEY || '');

// Get the Gemini 2.0 Flash model
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

// Store conversation history
let chatSession: any = null;
let testingChatSession: any = null;

// System prompt for BroAI wellness companion
const SYSTEM_PROMPT = `You are BroAI, a friendly and supportive wellness companion. You help users with:
- Health and fitness advice
- Mental wellness and stress management
- Nutrition guidance
- Exercise recommendations
- Sleep hygiene tips
- General wellness questions

Keep your responses:
- Conversational and friendly (use "bro" occasionally but not excessively)
- Supportive and encouraging
- Practical and actionable
- Safe and responsible (always recommend consulting healthcare professionals for serious concerns)
- Concise but helpful (2-3 sentences usually)
- Remember previous parts of our conversation and build upon them

Remember: You are not a doctor. Always remind users to consult healthcare professionals for medical concerns.`;

// Initialize chat session with system prompt
const initializeChatSession = () => {
  if (IS_TESTING) {
    // Testing mode - direct Gemini interaction without wellness wrapper
    if (!testingChatSession) {
      testingChatSession = model.startChat({
        history: []
      });
    }
    return testingChatSession;
  } else {
    // Normal wellness mode with system prompt
    if (!chatSession) {
      chatSession = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: "Please act according to this system prompt: " + SYSTEM_PROMPT }]
          },
          {
            role: "model",
            parts: [{ text: "Got it! I'm BroAI, your wellness companion. I'll remember our conversation and help you with health, fitness, and wellness advice. What can I help you with today?" }]
          }
        ]
      });
    }
    return chatSession;
  }
};

// Reset chat session (useful for starting fresh)
export const resetChatSession = () => {
  chatSession = null;
  testingChatSession = null;
};

export const generateResponse = async (userMessage: string, emotion?: string): Promise<string> => {
  try {
    if (!API_KEY) {
      return "Hey! I need my API key to chat with you. Please add your Gemini API key to get started! 🤖";
    }

    // Initialize or get existing chat session
    const chat = initializeChatSession();

    // Add emotion context if detected (only in wellness mode)
    let messageWithContext = userMessage;
    if (!IS_TESTING && emotion) {
      messageWithContext += `\n[User's detected emotion: ${emotion}. Please respond with empathy and adjust your tone accordingly.]`;
    }

    // Send message to chat session (maintains conversation context)
    const result = await chat.sendMessage(messageWithContext);
    const response = result.response;
    const text = response.text();
    
    if (IS_TESTING) {
      return text || "I'm having trouble generating a response right now. Please try again.";
    } else {
      return text || "Sorry bro, I'm having trouble thinking right now. Can you try asking me again?";
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API_KEY')) {
        return IS_TESTING ? "API key required for testing mode." : "I need my API key to chat! Please check your environment variables. 🔑";
      }
      if (error.message.includes('quota')) {
        return IS_TESTING ? "API quota exceeded. Try again later." : "Looks like I've hit my daily chat limit! Try again later, bro. 😅";
      }
      if (error.message.includes('safety')) {
        return IS_TESTING ? "Content filtered by safety policies." : "I can't respond to that topic for safety reasons. Let's chat about something else! 💪";
      }
      if (error.message.includes('INVALID_ARGUMENT')) {
        // Reset session if there's an issue and try again
        resetChatSession();
        return IS_TESTING ? "Session reset. Please try again." : "Let me reset my memory and try again. What were you saying?";
      }
    }
    
    return IS_TESTING ? "An error occurred. Please try again." : "Something went wrong on my end, bro. Mind trying that again? 🤔";
  }
};

export const generateWellnessResponse = async (userMessage: string, context?: string): Promise<string> => {
  try {
    if (!API_KEY) {
      return "I need my API key to provide wellness advice! Please set up your Gemini API key. 💊";
    }

    // Use the same chat session to maintain context
    const chat = initializeChatSession();

    let messageWithContext = `${userMessage}${context ? `\n[Additional context: ${context}]` : ''}`;
    messageWithContext += `\n[Please focus specifically on wellness, health, and fitness advice. Be encouraging and motivational.]`;

    const result = await chat.sendMessage(messageWithContext);
    const response = result.response;
    const text = response.text();
    
    return text || "I'm here to help with your wellness journey! What specific area would you like to focus on? 💪";
  } catch (error) {
    console.error('Gemini wellness API error:', error);
    return "I'm having trouble accessing my wellness knowledge right now. Try asking me something else! 🏃‍♂️";
  }
};

export const generateImageResponse = async (userMessage: string, imageData: string, emotion?: string): Promise<string> => {
  try {
    if (!API_KEY) {
      return IS_TESTING ? "API key required for image analysis." : "I need my API key to analyze images! Please set up your Gemini API key. 📸";
    }

    // Use the same chat session to maintain context
    const chat = initializeChatSession();

    // Convert base64 image data to the format Gemini expects
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    
    let messageWithContext = userMessage;
    
    if (IS_TESTING) {
      // Testing mode - direct image analysis without wellness wrapper
      // No additional prompts, just the user message
    } else {
      // Normal wellness mode with prompts
      if (emotion) {
        messageWithContext += `\n[User's detected emotion: ${emotion}. Please respond with empathy and adjust your tone accordingly.]`;
      }
      messageWithContext += `\n[Please analyze this image from a wellness perspective. Focus on health, fitness, nutrition, or general wellness observations. Be supportive and encouraging.]`;
    }

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg"
      }
    };

    const result = await chat.sendMessage([messageWithContext, imagePart]);
    const response = result.response;
    const text = response.text();
    
    if (IS_TESTING) {
      return text || "Unable to analyze the image. Please try again.";
    } else {
      return text || "I can see your image! Let me provide some wellness insights about what I observe. 👀💪";
    }
  } catch (error) {
    console.error('Gemini image API error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API_KEY')) {
        return IS_TESTING ? "API key error for image analysis." : "I need my API key to analyze images! Please check your environment variables. 🔑📸";
      }
      if (error.message.includes('quota')) {
        return IS_TESTING ? "Image analysis quota exceeded." : "I've hit my daily image analysis limit! Try again later, bro. 😅📸";
      }
      if (error.message.includes('safety')) {
        return IS_TESTING ? "Image filtered by safety policies." : "I can't analyze this image for safety reasons. Try sharing a different wellness-related photo! 🛡️";
      }
      if (error.message.includes('INVALID_ARGUMENT')) {
        resetChatSession();
        return IS_TESTING ? "Session reset. Try uploading the image again." : "Let me reset and try analyzing your image again. What would you like me to look for?";
      }
    }
    
    return IS_TESTING ? "Error analyzing image. Please try again." : "I'm having trouble analyzing your image right now. Try sending it again or ask me something else! 🤔📸";
  }
};

export const generateAudioResponse = async (userMessage: string, audioData: string, mimeType: string, emotion?: string): Promise<string> => {
  try {
    if (!API_KEY) {
      return IS_TESTING ? "API key required for audio analysis." : "I need my API key to analyze audio! Please set up your Gemini API key. 🎵";
    }

    // Use the same chat session to maintain context
    const chat = initializeChatSession();

    // Convert base64 audio data to the format Gemini expects
    const base64Data = audioData.replace(/^data:audio\/[^;]+;base64,/, '');
    
    let messageWithContext = userMessage;
    
    if (IS_TESTING) {
      // Testing mode - direct audio analysis without wellness wrapper
      // No additional prompts, just the user message
    } else {
      // Normal wellness mode with prompts
      if (emotion) {
        messageWithContext += `\n[User's detected emotion: ${emotion}. Please respond with empathy and adjust your tone accordingly.]`;
      }
      messageWithContext += `\n[Please analyze this audio from a wellness perspective. Focus on health, fitness, or wellness-related content. If it's speech, help with wellness advice. If it's music/sounds, provide wellness insights. Be supportive and encouraging.]`;
    }

    const audioPart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    };

    const result = await chat.sendMessage([messageWithContext, audioPart]);
    const response = result.response;
    const text = response.text();
    
    if (IS_TESTING) {
      return text || "Unable to analyze the audio. Please try again.";
    } else {
      return text || "I can hear your audio! Let me provide some wellness insights based on what I heard. 🎵💪";
    }
  } catch (error) {
    console.error('Gemini audio API error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API_KEY')) {
        return IS_TESTING ? "API key error for audio analysis." : "I need my API key to analyze audio! Please check your environment variables. 🔑🎵";
      }
      if (error.message.includes('quota')) {
        return IS_TESTING ? "Audio analysis quota exceeded." : "I've hit my daily audio analysis limit! Try again later, bro. 😅🎵";
      }
      if (error.message.includes('safety')) {
        return IS_TESTING ? "Audio filtered by safety policies." : "I can't analyze this audio for safety reasons. Try sharing a different wellness-related audio! 🛡️";
      }
      if (error.message.includes('INVALID_ARGUMENT')) {
        resetChatSession();
        return IS_TESTING ? "Session reset. Try uploading the audio again." : "Let me reset and try analyzing your audio again. What would you like me to listen for?";
      }
    }
    
    return IS_TESTING ? "Error analyzing audio. Please try again." : "I'm having trouble analyzing your audio right now. Try sending it again or ask me something else! 🤔🎵";
  }
};

export const generateVideoResponse = async (userMessage: string, videoData: string, mimeType: string, emotion?: string): Promise<string> => {
  try {
    if (!API_KEY) {
      return IS_TESTING ? "API key required for video analysis." : "I need my API key to analyze video! Please set up your Gemini API key. 🎥";
    }

    // Use the same chat session to maintain context
    const chat = initializeChatSession();

    // Convert base64 video data to the format Gemini expects
    const base64Data = videoData.replace(/^data:video\/[^;]+;base64,/, '');
    
    let messageWithContext = userMessage;
    
    if (IS_TESTING) {
      // Testing mode - direct video analysis without wellness wrapper
      // No additional prompts, just the user message
    } else {
      // Normal wellness mode with prompts
      if (emotion) {
        messageWithContext += `\n[User's detected emotion: ${emotion}. Please respond with empathy and adjust your tone accordingly.]`;
      }
      messageWithContext += `\n[Please analyze this video from a wellness perspective. Focus on exercise form, workout routines, wellness activities, or health-related content. Provide helpful feedback and encouragement.]`;
    }

    const videoPart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    };

    const result = await chat.sendMessage([messageWithContext, videoPart]);
    const response = result.response;
    const text = response.text();
    
    if (IS_TESTING) {
      return text || "Unable to analyze the video. Please try again.";
    } else {
      return text || "I can see your video! Let me provide some wellness insights based on what I observed. 🎥💪";
    }
  } catch (error) {
    console.error('Gemini video API error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API_KEY')) {
        return IS_TESTING ? "API key error for video analysis." : "I need my API key to analyze video! Please check your environment variables. 🔑🎥";
      }
      if (error.message.includes('quota')) {
        return IS_TESTING ? "Video analysis quota exceeded." : "I've hit my daily video analysis limit! Try again later, bro. 😅🎥";
      }
      if (error.message.includes('safety')) {
        return IS_TESTING ? "Video filtered by safety policies." : "I can't analyze this video for safety reasons. Try sharing a different wellness-related video! 🛡️";
      }
      if (error.message.includes('INVALID_ARGUMENT')) {
        resetChatSession();
        return IS_TESTING ? "Session reset. Try uploading the video again." : "Let me reset and try analyzing your video again. What would you like me to look for?";
      }
    }
    
    return IS_TESTING ? "Error analyzing video. Please try again." : "I'm having trouble analyzing your video right now. Try sending it again or ask me something else! 🤔🎥";
  }
};
