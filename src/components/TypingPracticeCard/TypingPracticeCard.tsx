import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Paper,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PlayArrow,
  VolumeUp,
  CheckCircle,
  Cancel,
  Lightbulb,
  Psychology
} from '@mui/icons-material';

interface TypingPracticeCardProps {
  front: string;
  back: string;
  onComplete: (userAnswer: string, accuracy: number) => void;
  onSkip?: () => void;
}

interface TypingAnalysis {
  accuracy: number;
  keyPoints: string[];
  suggestions: string[];
  correctAnswer: string;
  alternatives: string[];
}

export const TypingPracticeCard: React.FC<TypingPracticeCardProps> = ({
  front,
  back,
  onComplete,
  onSkip
}) => {
  const [userInput, setUserInput] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [analysis, setAnalysis] = useState<TypingAnalysis | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>(0);

  // Extract front card content
  const extractFrontContent = (htmlContent: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    const listeningElement = tempDiv.querySelector('.listening-prompt');
    const hintElement = tempDiv.querySelector('.hint-vietnamese');

    return {
      listening: listeningElement?.textContent?.replace('🎧 Bạn nghe:', '').trim() || '',
      hint: hintElement?.textContent?.replace('💭 Gợi ý tiếng Việt:', '').trim() || ''
    };
  };

  // Extract back card content for analysis
  const extractBackContent = (htmlContent: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    const correctElement = tempDiv.querySelector('.correct-answer');
    const alternativesElements = tempDiv.querySelectorAll('.typing-alternatives li');
    const analysisElement = tempDiv.querySelector('.analysis-content');
    const tipElement = tempDiv.querySelector('.typing-tip');

    return {
      correct: correctElement?.textContent?.replace('✅ Câu đúng nhất:', '').trim() || '',
      alternatives: Array.from(alternativesElements).map(el => el.textContent?.trim() || ''),
      analysis: analysisElement?.textContent || '',
      tip: tipElement?.textContent?.replace('🎯 Mẹo typing:', '').trim() || ''
    };
  };

  const frontContent = extractFrontContent(front);
  const backContent = extractBackContent(back);

  // Start timer when user starts typing
  useEffect(() => {
    if (isTyping && !timerRef.current) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setTimeElapsed(Date.now() - startTimeRef.current);
      }, 100);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTyping]);

  // Calculate typing accuracy
  const calculateAccuracy = (userText: string, correctText: string): number => {
    if (!userText.trim()) return 0;

    const userWords = userText.toLowerCase().trim().split(/\s+/);
    const correctWords = correctText.toLowerCase().trim().split(/\s+/);

    let matches = 0;
    const maxLength = Math.max(userWords.length, correctWords.length);

    for (let i = 0; i < Math.min(userWords.length, correctWords.length); i++) {
      if (userWords[i] === correctWords[i]) {
        matches++;
      }
    }

    // Penalty for length difference
    const lengthPenalty = Math.abs(userWords.length - correctWords.length) / maxLength;
    const wordAccuracy = matches / maxLength;

    return Math.max(0, Math.round((wordAccuracy - lengthPenalty * 0.2) * 100));
  };

  // Check if answer matches alternatives
  const checkAlternatives = (userText: string): boolean => {
    const normalizedUser = userText.toLowerCase().trim();
    const normalizedCorrect = backContent.correct.toLowerCase().trim();
    const normalizedAlternatives = backContent.alternatives.map(alt =>
      alt.toLowerCase().trim()
    );

    return normalizedUser === normalizedCorrect ||
      normalizedAlternatives.some(alt => normalizedUser === alt);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setUserInput(value);

    if (!isTyping && value.length > 0) {
      setIsTyping(true);
    }
  };

  const handleSubmit = () => {
    if (!userInput.trim()) return;

    const accuracy = calculateAccuracy(userInput, backContent.correct);
    const isExactMatch = checkAlternatives(userInput);

    const analysisData: TypingAnalysis = {
      accuracy: isExactMatch ? 100 : accuracy,
      keyPoints: extractKeyPoints(userInput, backContent.correct),
      suggestions: generateSuggestions(userInput, backContent.correct),
      correctAnswer: backContent.correct,
      alternatives: backContent.alternatives
    };

    setAnalysis(analysisData);
    setIsRevealed(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    onComplete(userInput, analysisData.accuracy);
  };

  const extractKeyPoints = (userText: string, correctText: string): string[] => {
    const points: string[] = [];

    // Check grammar structure
    if (userText.includes('have been') && correctText.includes('have been')) {
      points.push('✅ Đúng thì Present Perfect Continuous');
    }

    // Check key vocabulary
    const correctWords = correctText.toLowerCase().split(/\s+/);
    const userWords = userText.toLowerCase().split(/\s+/);

    correctWords.forEach(word => {
      if (userWords.includes(word) && word.length > 3) {
        points.push(`✅ Từ khóa: "${word}"`);
      }
    });

    return points;
  };

  const generateSuggestions = (userText: string, correctText: string): string[] => {
    const suggestions: string[] = [];

    if (userText.length === 0) {
      suggestions.push('💡 Hãy bắt đầu gõ từ từ, tập trung vào từ khóa chính');
    }

    if (calculateAccuracy(userText, correctText) < 50) {
      suggestions.push('💡 Đọc lại gợi ý tiếng Việt và tập trung vào cấu trúc câu');
    }

    if (!userText.toLowerCase().includes('how')) {
      suggestions.push('💡 Nhớ hỏi ngược lại bằng "How about..." để duy trì cuộc trò chuyện');
    }

    return suggestions;
  };

  const playAudio = () => {
    // Text-to-speech for listening practice
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(frontContent.listening);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'success';
    if (accuracy >= 70) return 'warning';
    return 'error';
  };

  return (
    <Card sx={{ maxWidth: 800, margin: '0 auto', boxShadow: 3 }}>
      <CardContent>
        {/* Listening Section */}
        <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: '#f3e5f5' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" color="primary">
              🎧 Listening Challenge
            </Typography>
            <Box display="flex" gap={1}>
              <Tooltip title="Play audio">
                <IconButton onClick={playAudio} color="primary">
                  <VolumeUp />
                </IconButton>
              </Tooltip>
              <Tooltip title="Show hint">
                <IconButton onClick={() => setShowHint(!showHint)} color="secondary">
                  <Lightbulb />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Typography variant="body1" sx={{
            fontSize: '1.1em',
            fontStyle: 'italic',
            mb: 2,
            p: 2,
            bgcolor: 'white',
            borderRadius: 1,
            border: '2px dashed #9c27b0'
          }}>
            "{frontContent.listening}"
          </Typography>

          {showHint && (
            <Alert severity="info" sx={{ mb: 2 }}>
              💭 <strong>Gợi ý:</strong> {frontContent.hint}
            </Alert>
          )}
        </Paper>

        {/* Typing Section */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            ⌨️ Your Response
          </Typography>

          {isTyping && (
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Typography variant="body2" color="text.secondary">
                Time: {Math.floor(timeElapsed / 1000)}s
              </Typography>
              <LinearProgress
                variant="indeterminate"
                sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
              />
            </Box>
          )}

          <TextField
            ref={inputRef}
            fullWidth
            multiline
            rows={3}
            value={userInput}
            onChange={handleInputChange}
            placeholder="Type your English response here..."
            disabled={isRevealed}
            variant="outlined"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                fontSize: '1.1em',
                '&:hover': {
                  borderColor: 'primary.main'
                }
              }
            }}
            autoFocus
          />

          <Box display="flex" gap={2} justifyContent="center">
            {!isRevealed ? (
              <>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!userInput.trim()}
                  startIcon={<CheckCircle />}
                  size="large"
                >
                  Check Answer
                </Button>
                {onSkip && (
                  <Button
                    variant="outlined"
                    onClick={onSkip}
                    startIcon={<Cancel />}
                  >
                    Skip
                  </Button>
                )}
              </>
            ) : (
              <Button
                variant="contained"
                color="success"
                startIcon={<PlayArrow />}
                onClick={() => window.location.reload()}
              >
                Next Card
              </Button>
            )}
          </Box>
        </Box>

        {/* Analysis Section */}
        {isRevealed && analysis && (
          <Paper elevation={2} sx={{ p: 3, bgcolor: '#f8f9fa' }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Psychology color="primary" />
              <Typography variant="h6">
                Analysis Results
              </Typography>
              <Chip
                label={`${analysis.accuracy}%`}
                color={getAccuracyColor(analysis.accuracy)}
                sx={{ fontWeight: 'bold' }}
              />
            </Box>

            {/* User's Answer */}
            <Box mb={3}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Your Answer:
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  p: 2,
                  bgcolor: 'white',
                  borderRadius: 1,
                  border: '1px solid #ddd',
                  fontFamily: 'monospace'
                }}
              >
                {userInput}
              </Typography>
            </Box>

            {/* Correct Answer */}
            <Box mb={3}>
              <Typography variant="subtitle2" color="success.main" gutterBottom>
                ✅ Best Answer:
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  p: 2,
                  bgcolor: '#e8f5e8',
                  borderRadius: 1,
                  border: '1px solid #4caf50'
                }}
              >
                {analysis.correctAnswer}
              </Typography>
            </Box>

            {/* Alternatives */}
            {analysis.alternatives.length > 0 && (
              <Box mb={3}>
                <Typography variant="subtitle2" color="info.main" gutterBottom>
                  🔄 Other Good Answers:
                </Typography>
                {analysis.alternatives.map((alt, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    sx={{
                      p: 1,
                      mb: 1,
                      bgcolor: '#e3f2fd',
                      borderRadius: 1,
                      borderLeft: '4px solid #2196f3'
                    }}
                  >
                    • {alt}
                  </Typography>
                ))}
              </Box>
            )}

            {/* Key Points */}
            {analysis.keyPoints.length > 0 && (
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  🎯 Key Points:
                </Typography>
                {analysis.keyPoints.map((point, index) => (
                  <Chip
                    key={index}
                    label={point}
                    variant="outlined"
                    color="success"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}

            {/* Suggestions */}
            {analysis.suggestions.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  💡 Tips for Next Time:
                </Typography>
                {analysis.suggestions.map((suggestion, index) => (
                  <Alert key={index} severity="info" sx={{ mb: 1 }}>
                    {suggestion}
                  </Alert>
                ))}
              </Box>
            )}
          </Paper>
        )}
      </CardContent>
    </Card>
  );
};

export default TypingPracticeCard;