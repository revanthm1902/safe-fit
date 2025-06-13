
export const getEmotionAwareResponse = (input: string, currentEmotion: string) => {
  const baseResponse = getResponseForInput(input);
  
  switch(currentEmotion) {
    case 'happy':
      return `Your positive energy is contagious! 😄 ${baseResponse} Keep that smile going!`;
    case 'sad':
      return `I can see you're feeling down, but I'm here for you. ${baseResponse} Remember, every small step counts! 🌈`;
    case 'angry':
      return `I sense some frustration. Let's channel that energy positively! ${baseResponse} Take a deep breath with me! 🧘‍♂️`;
    case 'surprised':
      return `You look amazed! ${baseResponse} I love seeing that curiosity! ✨`;
    default:
      return baseResponse;
  }
};

export const getResponseForInput = (input: string) => {
  const lowercaseInput = input.toLowerCase();
  
  if (lowercaseInput.includes('workout') || lowercaseInput.includes('exercise')) {
    return "Let's get you moving, champ! 💪 I recommend starting with a balanced routine: 30 minutes of cardio 3x weekly plus 2 strength training sessions. Want me to create a personalized plan for you?";
  }
  
  if (lowercaseInput.includes('diet') || lowercaseInput.includes('nutrition') || lowercaseInput.includes('food')) {
    return "Nutrition is your superpower! 🥗 Focus on colorful whole foods, lean proteins, and plenty of water. Think of it as fueling your awesome body! Need some tasty meal ideas?";
  }
  
  if (lowercaseInput.includes('sleep') || lowercaseInput.includes('tired')) {
    return "Sleep is when the magic happens! 😴 Aim for 7-9 hours in a cool, dark room. Your body repairs and grows stronger while you dream. Want some bedtime routine tips?";
  }
  
  if (lowercaseInput.includes('stress') || lowercaseInput.includes('anxious')) {
    return "Stress happens to the best of us! 🌱 Try the 4-7-8 breathing technique: inhale for 4, hold for 7, exhale for 8. You've got this, and I believe in you!";
  }
  
  if (lowercaseInput.includes('motivation') || lowercaseInput.includes('lazy')) {
    return "Everyone has those days! 🚀 Remember why you started this journey. Start small - even 5 minutes counts! Progress, not perfection, is the goal!";
  }
  
  return "That's a fantastic question! 🌟 As your wellness buddy, I'm here to help you thrive! Whether it's fitness, nutrition, or mindset - we'll tackle it together! What aspect interests you most?";
};

export const handleEmotionChange = (newEmotion: string, setMessages: any, speakText: (text: string) => void) => {
  let emotionResponse = "";
  
  switch(newEmotion) {
    case 'happy':
      emotionResponse = "I love seeing that smile! You're radiating positive energy! 😊";
      break;
    case 'sad':
      emotionResponse = "Hey, I notice you seem a bit down. Remember, I'm here for you. Want to talk about it? 🤗";
      break;
    case 'angry':
      emotionResponse = "You look a bit frustrated, buddy. Let's take a deep breath together and work through this. 😌";
      break;
    case 'surprised':
      emotionResponse = "Whoa! You look surprised! Did I say something amazing? 😲";
      break;
    case 'fearful':
      emotionResponse = "You seem worried. Don't worry, I'm here to help you feel better! 💪";
      break;
    case 'disgusted':
      emotionResponse = "Not feeling great about something? Let's find a way to turn that around! 🌟";
      break;
    default:
      emotionResponse = "I can see your expression - thanks for letting me read your mood! 👁️";
  }
  
  const emotionMessage = {
    text: emotionResponse,
    isUser: false,
    timestamp: new Date(),
    emotion: newEmotion
  };
  
  setMessages((prev: any) => [...prev, emotionMessage]);
  speakText(emotionResponse);
};
