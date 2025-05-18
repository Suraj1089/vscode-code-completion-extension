import { useState, useEffect, useRef } from 'react';
import { 
  LightbulbIcon, 
  XIcon, 
  ThumbsUpIcon, 
  ThumbsDownIcon, 
  ArrowLeftIcon, 
  ArrowRightIcon,
  SettingsIcon,
  MoveIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Array of coding tips to display
const codingTips = [
  "Try using descriptive variable names to make your code more readable.",
  "Remember to add comments to explain complex logic in your code.",
  "Break down large functions into smaller, reusable functions.",
  "Use constants for magic numbers and strings that appear multiple times.",
  "Write unit tests to ensure your code works as expected.",
  "Regular commits with clear messages help track your progress.",
  "Use destructuring to simplify working with objects and arrays.",
  "Consider adding error handling to make your code more robust.",
  "Learning keyboard shortcuts can boost your productivity.",
  "Take regular breaks to maintain focus and prevent burnout.",
  "Consistent indentation makes your code easier to read.",
  "Use semantic HTML elements for better accessibility.",
  "Don't forget to handle edge cases in your code.",
  "The console is your friend for debugging JavaScript.",
  "Keep your functions simple and focused on a single task.",
  "Remember to use Tab key to accept code suggestions in the editor.",
  "Always check your API responses for error handling.",
  "Consider using async/await for cleaner asynchronous code.",
  "Git branches help isolate features and fixes during development.",
  "Keep your dependencies updated to avoid security vulnerabilities.",
  "Remember that Git stash can save your uncommitted changes temporarily.",
  "Use a linter to catch common programming errors.",
  "Visual Studio Code's debugger can help you step through your code.",
  "Write meaningful commit messages for better project history.",
  "Create a clear README file to explain your project to others.",
];

// Language-specific tips
const languageTips: Record<string, string[]> = {
  javascript: [
    "Use const and let instead of var in modern JavaScript.",
    "Arrow functions help maintain the 'this' context.",
    "The optional chaining operator (?.) helps prevent null reference errors.",
    "Async/await makes asynchronous code more readable than callbacks.",
    "Use template literals for string interpolation.",
  ],
  typescript: [
    "Define interfaces for better type safety.",
    "Use type assertions only when necessary.",
    "Enable strict mode in your tsconfig.json for better type checking.",
    "Utilize union types to represent multiple possible types.",
    "Generic types allow you to create reusable components.",
  ],
  python: [
    "Use list comprehensions for concise list creation.",
    "Virtual environments help manage dependencies.",
    "Type hints improve code readability and IDE support.",
    "The with statement ensures resources are properly managed.",
    "f-strings provide a clean way to format strings in Python 3.6+.",
  ],
};

// Mascot emotions
const mascotEmotions = {
  happy: "😊",
  excited: "😃",
  thinking: "🤔",
  helpful: "🤓",
  celebrating: "🎉",
};

interface MascotProps {
  language: string;
  isVisible: boolean;
  onClose: () => void;
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
}

export function Mascot({ 
  language = 'javascript', 
  isVisible = true, 
  onClose,
  position = 'bottom-right' 
}: MascotProps) {
  const [currentTip, setCurrentTip] = useState("");
  const [emotion, setEmotion] = useState<keyof typeof mascotEmotions>("helpful");
  const [isFeedbackGiven, setIsFeedbackGiven] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<MascotProps['position']>(position);
  const [minimized, setMinimized] = useState(false);
  
  // Store all available tips for the current language
  const allTips = useRef<string[]>([]);
  
  // Construct available tips when language changes
  useEffect(() => {
    const languageSpecificTips = languageTips[language] || [];
    allTips.current = [...codingTips, ...languageSpecificTips];
    // Reset to first tip when language changes
    setTipIndex(0);
    setCurrentTip(allTips.current[0]);
  }, [language]);

  // Get a random tip from the available tips
  const getRandomTip = () => {
    const languageSpecificTips = languageTips[language] || [];
    const allTips = [...codingTips, ...languageSpecificTips];
    const randomIndex = Math.floor(Math.random() * allTips.length);
    return allTips[randomIndex];
  };

  // Update the tip periodically or when language changes
  useEffect(() => {
    // Use the current tip index instead of getting a random tip
    if (allTips.current.length > 0) {
      setCurrentTip(allTips.current[tipIndex]);
    }
    
    setEmotion("helpful");
    setIsFeedbackGiven(false);
    
    // Update the tip every 2 minutes
    const interval = setInterval(() => {
      // Move to the next tip in the list
      const nextIndex = (tipIndex + 1) % allTips.current.length;
      setTipIndex(nextIndex);
      setCurrentTip(allTips.current[nextIndex]);
      
      // Also change the emotion occasionally
      const emotions = Object.keys(mascotEmotions) as Array<keyof typeof mascotEmotions>;
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      setEmotion(randomEmotion);
      setIsFeedbackGiven(false);
    }, 120000);
    
    return () => clearInterval(interval);
  }, [language, tipIndex]);
  
  // Navigate to previous tip
  const showPreviousTip = () => {
    const prevIndex = tipIndex === 0 ? allTips.current.length - 1 : tipIndex - 1;
    setTipIndex(prevIndex);
    setCurrentTip(allTips.current[prevIndex]);
    setIsFeedbackGiven(false);
  };
  
  // Navigate to next tip
  const showNextTip = () => {
    const nextIndex = (tipIndex + 1) % allTips.current.length;
    setTipIndex(nextIndex);
    setCurrentTip(allTips.current[nextIndex]);
    setIsFeedbackGiven(false);
  };
  
  // Change mascot position
  const changePosition = (newPosition: MascotProps['position']) => {
    setCurrentPosition(newPosition);
  };

  // Handle feedback
  const handlePositiveFeedback = () => {
    setEmotion("celebrating");
    setIsFeedbackGiven(true);
  };

  const handleNegativeFeedback = () => {
    setEmotion("thinking");
    setCurrentTip(getRandomTip());
    setIsFeedbackGiven(true);
  };

  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-left': 'top-4 left-4',
  };

  if (!isVisible) return null;

  // When minimized, just show the mascot avatar
  if (minimized) {
    return (
      <div className={`fixed ${positionClasses[currentPosition]} z-50 transition-all duration-300 ease-in-out`}>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-10 w-10 rounded-full bg-accent-primary border-accent-primary shadow-lg hover:bg-accent-secondary"
          onClick={() => setMinimized(false)}
        >
          <Avatar className="h-8 w-8 bg-transparent text-white flex items-center justify-center text-lg">
            {mascotEmotions[emotion]}
          </Avatar>
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed ${positionClasses[currentPosition]} z-50 transition-all duration-300 ease-in-out animate-in slide-in-from-right-10`}>
      <Card className="w-64 bg-editor-panel border border-accent-primary shadow-lg">
        <div className="p-3">
          {/* Header with mascot avatar and controls */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 bg-accent-primary text-white flex items-center justify-center text-lg">
                {mascotEmotions[emotion]}
              </Avatar>
              <span className="ml-2 text-sm font-medium">Code Buddy</span>
            </div>
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <SettingsIcon className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => changePosition('top-right')}>
                    Move to Top Right
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changePosition('top-left')}>
                    Move to Top Left
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changePosition('bottom-right')}>
                    Move to Bottom Right
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changePosition('bottom-left')}>
                    Move to Bottom Left
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setMinimized(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </Button>
              
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Tip content */}
          <div className="mb-3 text-xs">
            <div className="flex gap-1 items-start">
              <LightbulbIcon className="h-4 w-4 text-accent-primary mt-0.5 flex-shrink-0" />
              <p>{currentTip}</p>
            </div>
          </div>
          
          {/* Tip navigation */}
          <div className="flex justify-between mb-2">
            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={showPreviousTip}>
              <ArrowLeftIcon className="h-3 w-3 mr-1" />
              <span className="text-xs">Previous</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={showNextTip}>
              <span className="text-xs">Next</span>
              <ArrowRightIcon className="h-3 w-3 ml-1" />
            </Button>
          </div>
          
          {/* Feedback controls */}
          {!isFeedbackGiven && (
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="sm" className="h-7 px-2" onClick={handleNegativeFeedback}>
                <ThumbsDownIcon className="h-3 w-3 mr-1" />
                <span className="text-xs">Not helpful</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2" onClick={handlePositiveFeedback}>
                <ThumbsUpIcon className="h-3 w-3 mr-1" />
                <span className="text-xs">Thanks!</span>
              </Button>
            </div>
          )}
          
          {/* Feedback response message */}
          {isFeedbackGiven && emotion === "celebrating" && (
            <div className="text-center text-xs text-gray-400 pt-1">
              Glad to help! I'll have more tips soon.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}