import { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, CheckCircle2, XCircle, Loader2, ArrowRight, RotateCcw, Trophy, Target, Lightbulb,
  Mic, MicOff, Volume2, Play, Pause, BookOpen, PenTool, MessageSquare, Award, TrendingUp,
  Clock, BarChart3, FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Question {
  id: number;
  type: string;
  category: string;
  difficulty: string;
  points: number;
  question: string;
  questionFr: string;
  context?: string;
  options: string[];
  correctAnswer: number;
}

interface CategoryScore {
  grammar: number;
  vocabulary: number;
  comprehension: number;
  fill_blank: number;
}

interface StrengthWeakness {
  area: string;
  description: string;
  examples?: string[];
}

interface LearningPlan {
  shortTerm: string[];
  mediumTerm: string[];
  longTerm: string[];
}

interface TimeAnalysis {
  averageResponseTime: number;
  fastAnswers: number;
  slowAnswers: number;
  interpretation: string;
}

interface WrittenEvaluation {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  totalPoints: number;
  maxPoints: number;
  estimatedLevel: string;
  confidence: string;
  message: string;
  categoryScores: CategoryScore;
  strengths: StrengthWeakness[];
  weaknesses: StrengthWeakness[];
  recommendations: string[];
  learningPlan: LearningPlan;
  timeAnalysis: TimeAnalysis;
}

interface VoiceExercise {
  id: number;
  type: 'reading' | 'repetition' | 'free_response';
  title: string;
  titleFr: string;
  instruction: string;
  instructionFr: string;
  content?: string;
  contentFr?: string;
  sentences?: { german: string; french: string }[];
  question?: string;
  questionFr?: string;
  expectedTopics?: string[];
}

interface VoiceEvaluation {
  score: number;
  accuracy: number;
  fluency: number;
  accent: number;
  intonation: number;
  vocabularyRichness: number;
  estimatedOralLevel: string;
  feedback: {
    overall: string;
    pronunciation: string;
    suggestions: string[];
  };
  strengths: string[];
  areasToImprove: string[];
}

interface GlobalReport {
  globalScore: number;
  writtenScore: number;
  oralScore: number;
  globalLevel: string;
  writtenLevel: string;
  oralLevel: string;
  levelExplanation: string;
  summary: string;
  combinedStrengths: any[];
  combinedWeaknesses: any[];
  personalizedPlan: {
    immediate: string[];
    weekly: string[];
    monthly: string[];
    targetLevel: string;
    estimatedTimeToTarget: string;
  };
  recommendedResources: any[];
  nextSteps: string[];
}

interface LevelTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LevelTestDialog({ open, onOpenChange }: LevelTestDialogProps) {
  // Main state
  const [step, setStep] = useState<'intro' | 'written_test' | 'voice_test' | 'results'>('intro');
  const [testMode, setTestMode] = useState<'full' | 'written_only' | 'voice_only'>('full');
  const [selectedLevel, setSelectedLevel] = useState<string>('A1');
  
  // Written test state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { answer: number; time: number; startTime: number }>>({});
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [writtenEvaluation, setWrittenEvaluation] = useState<WrittenEvaluation | null>(null);
  
  // Voice test state
  const [voiceExercises, setVoiceExercises] = useState<VoiceExercise[]>([]);
  const [currentVoiceExercise, setCurrentVoiceExercise] = useState(0);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceResults, setVoiceResults] = useState<VoiceEvaluation[]>([]);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const recognitionRef = useRef<any>(null);
  
  // Global results state
  const [globalReport, setGlobalReport] = useState<GlobalReport | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingEval, setLoadingEval] = useState(false);
  const [loadingVoice, setLoadingVoice] = useState(false);

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'de-DE';
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscribedText(prev => prev + ' ' + finalTranscript);
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
    }
  }, []);

  const startWrittenTest = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('german-level-test', {
        body: { 
          action: 'generate_questions', 
          currentLevel: selectedLevel,
          questionTypes: ['qcm', 'fill_blank', 'comprehension', 'grammar', 'vocabulary']
        }
      });

      if (error) throw error;

      if (data.questions) {
        setQuestions(data.questions);
        setStep('written_test');
        setCurrentQuestionIndex(0);
        setAnswers({});
        setQuestionStartTime(Date.now());
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error('Erreur lors de la génération des questions. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = (answerIndex: number) => {
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestionIndex].id]: {
        answer: answerIndex,
        time: timeSpent,
        startTime: questionStartTime
      }
    }));
  };

  const nextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
    } else {
      await evaluateWrittenTest();
    }
  };

  const evaluateWrittenTest = async () => {
    setLoadingEval(true);
    try {
      const answersWithDetails = questions.map(q => ({
        questionId: q.id,
        question: q.question,
        type: q.type,
        category: q.category,
        difficulty: q.difficulty,
        points: q.points,
        userAnswer: answers[q.id]?.answer,
        correctAnswer: q.correctAnswer,
        isCorrect: answers[q.id]?.answer === q.correctAnswer,
        responseTime: answers[q.id]?.time || 0
      }));

      const { data, error } = await supabase.functions.invoke('german-level-test', {
        body: { 
          action: 'evaluate', 
          answers: answersWithDetails,
          currentLevel: selectedLevel
        }
      });

      if (error) throw error;

      setWrittenEvaluation(data);
      
      if (testMode === 'written_only') {
        setStep('results');
      } else {
        await startVoiceTest();
      }
    } catch (error) {
      console.error('Error evaluating test:', error);
      toast.error('Erreur lors de l\'évaluation. Veuillez réessayer.');
    } finally {
      setLoadingEval(false);
    }
  };

  const startVoiceTest = async () => {
    setLoadingVoice(true);
    try {
      const { data, error } = await supabase.functions.invoke('german-level-test', {
        body: { 
          action: 'generate_voice_test', 
          currentLevel: writtenEvaluation?.estimatedLevel || selectedLevel
        }
      });

      if (error) throw error;

      if (data.exercises) {
        setVoiceExercises(data.exercises);
        setStep('voice_test');
        setCurrentVoiceExercise(0);
        setCurrentSentenceIndex(0);
        setVoiceResults([]);
      }
    } catch (error) {
      console.error('Error generating voice test:', error);
      toast.error('Erreur lors de la génération du test oral.');
      setStep('results');
    } finally {
      setLoadingVoice(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setTranscribedText('');
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const submitVoiceAnswer = async () => {
    setIsRecording(false);
    recognitionRef.current?.stop();
    setLoadingVoice(true);

    try {
      const currentExercise = voiceExercises[currentVoiceExercise];
      let expectedText = '';
      
      if (currentExercise.type === 'reading') {
        expectedText = currentExercise.content || '';
      } else if (currentExercise.type === 'repetition') {
        expectedText = currentExercise.sentences?.[currentSentenceIndex]?.german || '';
      } else {
        expectedText = currentExercise.question || '';
      }

      const { data, error } = await supabase.functions.invoke('german-level-test', {
        body: { 
          action: 'evaluate_voice',
          voiceText: transcribedText.trim(),
          expectedText,
          currentLevel: writtenEvaluation?.estimatedLevel || selectedLevel
        }
      });

      if (error) throw error;

      setVoiceResults(prev => [...prev, data]);

      // Move to next exercise or sentence
      if (currentExercise.type === 'repetition' && currentExercise.sentences) {
        if (currentSentenceIndex < currentExercise.sentences.length - 1) {
          setCurrentSentenceIndex(prev => prev + 1);
          setTranscribedText('');
        } else {
          moveToNextVoiceExercise();
        }
      } else {
        moveToNextVoiceExercise();
      }
    } catch (error) {
      console.error('Error evaluating voice:', error);
      toast.error('Erreur lors de l\'évaluation vocale.');
    } finally {
      setLoadingVoice(false);
    }
  };

  const moveToNextVoiceExercise = async () => {
    if (currentVoiceExercise < voiceExercises.length - 1) {
      setCurrentVoiceExercise(prev => prev + 1);
      setCurrentSentenceIndex(0);
      setTranscribedText('');
    } else {
      await generateGlobalReport();
    }
  };

  const generateGlobalReport = async () => {
    setLoadingEval(true);
    try {
      // Calculate average voice scores
      const avgVoiceScore = voiceResults.length > 0
        ? voiceResults.reduce((acc, r) => acc + r.score, 0) / voiceResults.length
        : 0;

      const oralResults = {
        averageScore: avgVoiceScore,
        accuracy: voiceResults.reduce((acc, r) => acc + r.accuracy, 0) / Math.max(voiceResults.length, 1),
        fluency: voiceResults.reduce((acc, r) => acc + r.fluency, 0) / Math.max(voiceResults.length, 1),
        accent: voiceResults.reduce((acc, r) => acc + r.accent, 0) / Math.max(voiceResults.length, 1),
        intonation: voiceResults.reduce((acc, r) => acc + r.intonation, 0) / Math.max(voiceResults.length, 1),
        estimatedLevel: voiceResults[voiceResults.length - 1]?.estimatedOralLevel || selectedLevel
      };

      const { data, error } = await supabase.functions.invoke('german-level-test', {
        body: { 
          action: 'generate_global_report',
          writtenResults: writtenEvaluation,
          oralResults
        }
      });

      if (error) throw error;

      setGlobalReport(data);
      setStep('results');
    } catch (error) {
      console.error('Error generating global report:', error);
      setStep('results');
    } finally {
      setLoadingEval(false);
    }
  };

  const resetTest = () => {
    setStep('intro');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setWrittenEvaluation(null);
    setVoiceExercises([]);
    setCurrentVoiceExercise(0);
    setVoiceResults([]);
    setGlobalReport(null);
    setTranscribedText('');
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const voiceProgress = voiceExercises.length > 0 ? ((currentVoiceExercise + 1) / voiceExercises.length) * 100 : 0;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'grammar': return <PenTool className="h-4 w-4" />;
      case 'vocabulary': return <BookOpen className="h-4 w-4" />;
      case 'comprehension': return <MessageSquare className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Test de Niveau d'Allemand Complet
          </DialogTitle>
          <DialogDescription>
            Évaluez votre niveau écrit et oral avec notre système intelligent propulsé par l'IA
          </DialogDescription>
        </DialogHeader>

        {/* INTRO STEP */}
        {step === 'intro' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold">Test complet en 2 parties</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-2 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <PenTool className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Test Écrit</h4>
                    </div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• QCM adaptatifs</li>
                      <li>• Phrases à compléter</li>
                      <li>• Compréhension de texte</li>
                      <li>• Grammaire & vocabulaire</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-secondary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Mic className="h-5 w-5 text-secondary" />
                      <h4 className="font-semibold">Test Oral</h4>
                    </div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Lecture de texte</li>
                      <li>• Répétition de phrases</li>
                      <li>• Réponses libres</li>
                      <li>• Analyse de prononciation</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
                <Award className="h-5 w-5 text-warning" />
                <span className="text-sm">Recevez votre niveau CECRL (A1-C2) avec un rapport personnalisé</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Type de test</Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={testMode === 'full' ? 'default' : 'outline'}
                  onClick={() => setTestMode('full')}
                  className="h-auto py-3 flex flex-col"
                >
                  <span className="font-semibold">Complet</span>
                  <span className="text-xs opacity-70">Écrit + Oral</span>
                </Button>
                <Button
                  variant={testMode === 'written_only' ? 'default' : 'outline'}
                  onClick={() => setTestMode('written_only')}
                  className="h-auto py-3 flex flex-col"
                >
                  <span className="font-semibold">Écrit seul</span>
                  <span className="text-xs opacity-70">~10 min</span>
                </Button>
                <Button
                  variant={testMode === 'voice_only' ? 'default' : 'outline'}
                  onClick={() => setTestMode('voice_only')}
                  className="h-auto py-3 flex flex-col"
                >
                  <span className="font-semibold">Oral seul</span>
                  <span className="text-xs opacity-70">~5 min</span>
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Quel est votre niveau estimé ?</Label>
              <div className="grid grid-cols-6 gap-2">
                {levels.map(level => (
                  <Button
                    key={level}
                    variant={selectedLevel === level ? 'default' : 'outline'}
                    onClick={() => setSelectedLevel(level)}
                    className="h-12"
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>

            <Button 
              onClick={testMode === 'voice_only' ? startVoiceTest : startWrittenTest} 
              disabled={loading || loadingVoice}
              className="w-full"
              size="lg"
            >
              {loading || loadingVoice ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Préparation du test...
                </>
              ) : (
                <>
                  Commencer le test
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* WRITTEN TEST STEP */}
        {step === 'written_test' && currentQuestion && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>Question {currentQuestionIndex + 1} sur {questions.length}</span>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getCategoryIcon(currentQuestion.category)}
                    {currentQuestion.category}
                  </Badge>
                  <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                    {currentQuestion.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{currentQuestion.points} pts</span>
                </div>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                {currentQuestion.context && (
                  <div className="bg-muted/50 rounded-lg p-3 text-sm italic">
                    {currentQuestion.context}
                  </div>
                )}
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{currentQuestion.question}</h3>
                  <p className="text-sm text-muted-foreground italic">{currentQuestion.questionFr}</p>
                </div>

                <RadioGroup
                  value={answers[currentQuestion.id]?.answer?.toString()}
                  onValueChange={(value) => submitAnswer(parseInt(value))}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        answers[currentQuestion.id]?.answer === index
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => submitAnswer(index)}
                    >
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            <Button
              onClick={nextQuestion}
              disabled={answers[currentQuestion.id]?.answer === undefined || loadingEval}
              className="w-full"
              size="lg"
            >
              {loadingEval ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Évaluation en cours...
                </>
              ) : currentQuestionIndex < questions.length - 1 ? (
                <>
                  Question suivante
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              ) : (
                <>
                  {testMode === 'full' ? 'Passer au test oral' : 'Voir les résultats'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* VOICE TEST STEP */}
        {step === 'voice_test' && voiceExercises.length > 0 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Exercice {currentVoiceExercise + 1} sur {voiceExercises.length}</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Mic className="h-4 w-4" />
                  {voiceExercises[currentVoiceExercise].type}
                </Badge>
              </div>
              <Progress value={voiceProgress} className="h-2" />
            </div>

            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">{voiceExercises[currentVoiceExercise].titleFr}</h3>
                  <p className="text-muted-foreground">{voiceExercises[currentVoiceExercise].instructionFr}</p>
                </div>

                {/* Reading Exercise */}
                {voiceExercises[currentVoiceExercise].type === 'reading' && (
                  <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-6">
                    <p className="text-lg leading-relaxed font-medium">
                      {voiceExercises[currentVoiceExercise].content}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      {voiceExercises[currentVoiceExercise].contentFr}
                    </p>
                  </div>
                )}

                {/* Repetition Exercise */}
                {voiceExercises[currentVoiceExercise].type === 'repetition' && voiceExercises[currentVoiceExercise].sentences && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <span>Phrase {currentSentenceIndex + 1} sur {voiceExercises[currentVoiceExercise].sentences.length}</span>
                    </div>
                    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-6 text-center">
                      <p className="text-xl font-semibold mb-2">
                        {voiceExercises[currentVoiceExercise].sentences[currentSentenceIndex].german}
                      </p>
                      <p className="text-sm text-muted-foreground italic">
                        {voiceExercises[currentVoiceExercise].sentences[currentSentenceIndex].french}
                      </p>
                    </div>
                  </div>
                )}

                {/* Free Response Exercise */}
                {voiceExercises[currentVoiceExercise].type === 'free_response' && (
                  <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-6 text-center">
                    <p className="text-xl font-semibold mb-2">
                      {voiceExercises[currentVoiceExercise].question}
                    </p>
                    <p className="text-sm text-muted-foreground italic">
                      {voiceExercises[currentVoiceExercise].questionFr}
                    </p>
                  </div>
                )}

                {/* Transcribed Text Display */}
                {transcribedText && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Votre réponse:</p>
                    <p className="font-medium">{transcribedText}</p>
                  </div>
                )}

                {/* Recording Controls */}
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={toggleRecording}
                    variant={isRecording ? 'destructive' : 'default'}
                    size="lg"
                    className="w-32"
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="mr-2 h-5 w-5" />
                        Arrêter
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-5 w-5" />
                        Parler
                      </>
                    )}
                  </Button>
                  
                  {transcribedText && !isRecording && (
                    <Button
                      onClick={submitVoiceAnswer}
                      disabled={loadingVoice}
                      size="lg"
                    >
                      {loadingVoice ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          Valider
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {isRecording && (
                  <div className="flex justify-center">
                    <div className="flex items-center gap-2 text-destructive animate-pulse">
                      <div className="w-3 h-3 rounded-full bg-destructive" />
                      <span>Enregistrement en cours...</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* RESULTS STEP */}
        {step === 'results' && (
          <div className="space-y-6">
            {/* Global Score Header */}
            <div className="text-center space-y-4">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto">
                <Trophy className="h-14 w-14 text-primary-foreground" />
              </div>
              
              {globalReport ? (
                <>
                  <h3 className="text-4xl font-bold">{globalReport.globalScore}%</h3>
                  <Badge className="text-xl px-6 py-2" variant="default">
                    Niveau Global: {globalReport.globalLevel}
                  </Badge>
                  <div className="flex justify-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <PenTool className="h-4 w-4" />
                      Écrit: {globalReport.writtenLevel}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mic className="h-4 w-4" />
                      Oral: {globalReport.oralLevel}
                    </span>
                  </div>
                </>
              ) : writtenEvaluation && (
                <>
                  <h3 className="text-4xl font-bold">{writtenEvaluation.score}%</h3>
                  <Badge className="text-xl px-6 py-2" variant="default">
                    Niveau: {writtenEvaluation.estimatedLevel}
                  </Badge>
                  <p className="text-muted-foreground">
                    {writtenEvaluation.correctAnswers} / {writtenEvaluation.totalQuestions} bonnes réponses
                  </p>
                </>
              )}
            </div>

            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Résumé</TabsTrigger>
                <TabsTrigger value="details">Détails</TabsTrigger>
                <TabsTrigger value="plan">Plan d'études</TabsTrigger>
                <TabsTrigger value="resources">Ressources</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4 mt-4">
                {/* Score Message */}
                <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
                  <CardContent className="p-6">
                    <p className="text-center text-lg">
                      {globalReport?.summary || writtenEvaluation?.message}
                    </p>
                  </CardContent>
                </Card>

                {/* Category Scores */}
                {writtenEvaluation?.categoryScores && (
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Scores par catégorie
                      </h4>
                      <div className="space-y-3">
                        {Object.entries(writtenEvaluation.categoryScores).map(([category, score]) => (
                          <div key={category} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="capitalize">{category.replace('_', ' ')}</span>
                              <span className="font-semibold">{score}%</span>
                            </div>
                            <Progress value={score} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="details" className="space-y-4 mt-4">
                {/* Strengths */}
                {(globalReport?.combinedStrengths || writtenEvaluation?.strengths)?.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold flex items-center gap-2 mb-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        Points forts
                      </h4>
                      <ul className="space-y-2">
                        {(globalReport?.combinedStrengths || writtenEvaluation?.strengths)?.map((item: any, i: number) => (
                          <li key={i} className="text-sm">
                            <span className="font-medium text-green-600">{item.area || item}</span>
                            {item.description && (
                              <p className="text-muted-foreground mt-1">{item.description}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Weaknesses */}
                {(globalReport?.combinedWeaknesses || writtenEvaluation?.weaknesses)?.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold flex items-center gap-2 mb-3">
                        <Target className="h-5 w-5 text-orange-500" />
                        Points à améliorer
                      </h4>
                      <ul className="space-y-2">
                        {(globalReport?.combinedWeaknesses || writtenEvaluation?.weaknesses)?.map((item: any, i: number) => (
                          <li key={i} className="text-sm">
                            <span className="font-medium text-orange-600">{item.area || item}</span>
                            {item.description && (
                              <p className="text-muted-foreground mt-1">{item.description}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Time Analysis */}
                {writtenEvaluation?.timeAnalysis && (
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold flex items-center gap-2 mb-3">
                        <Clock className="h-5 w-5 text-primary" />
                        Analyse du temps
                      </h4>
                      <div className="grid grid-cols-3 gap-4 text-center mb-3">
                        <div>
                          <p className="text-2xl font-bold">{writtenEvaluation.timeAnalysis.averageResponseTime}s</p>
                          <p className="text-xs text-muted-foreground">Temps moyen</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-500">{writtenEvaluation.timeAnalysis.fastAnswers}</p>
                          <p className="text-xs text-muted-foreground">Réponses rapides</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-orange-500">{writtenEvaluation.timeAnalysis.slowAnswers}</p>
                          <p className="text-xs text-muted-foreground">Réponses lentes</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{writtenEvaluation.timeAnalysis.interpretation}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="plan" className="space-y-4 mt-4">
                {(globalReport?.personalizedPlan || writtenEvaluation?.learningPlan) && (
                  <>
                    <Card>
                      <CardContent className="p-6">
                        <h4 className="font-semibold flex items-center gap-2 mb-4">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          Plan d'apprentissage personnalisé
                        </h4>
                        
                        <div className="space-y-4">
                          <div>
                            <h5 className="text-sm font-medium text-primary mb-2">Court terme (cette semaine)</h5>
                            <ul className="space-y-1">
                              {(globalReport?.personalizedPlan?.immediate || writtenEvaluation?.learningPlan?.shortTerm)?.map((item: string, i: number) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                  <span className="text-primary">•</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-medium text-secondary mb-2">Moyen terme (ce mois)</h5>
                            <ul className="space-y-1">
                              {(globalReport?.personalizedPlan?.weekly || writtenEvaluation?.learningPlan?.mediumTerm)?.map((item: string, i: number) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                  <span className="text-secondary">•</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-medium text-warning mb-2">Long terme</h5>
                            <ul className="space-y-1">
                              {(globalReport?.personalizedPlan?.monthly || writtenEvaluation?.learningPlan?.longTerm)?.map((item: string, i: number) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                  <span className="text-warning">•</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        {globalReport?.personalizedPlan && (
                          <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                            <p className="text-sm">
                              <span className="font-semibold">Objectif:</span> Niveau {globalReport.personalizedPlan.targetLevel}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Temps estimé: {globalReport.personalizedPlan.estimatedTimeToTarget}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              <TabsContent value="resources" className="space-y-4 mt-4">
                {/* Recommendations */}
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold flex items-center gap-2 mb-3">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      Recommandations
                    </h4>
                    <ul className="space-y-2">
                      {(globalReport?.nextSteps || writtenEvaluation?.recommendations)?.map((rec: string, i: number) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-primary">💡</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Recommended Resources */}
                {globalReport?.recommendedResources && globalReport.recommendedResources.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold flex items-center gap-2 mb-3">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Ressources recommandées
                      </h4>
                      <div className="space-y-3">
                        {globalReport.recommendedResources.map((resource: any, i: number) => (
                          <div key={i} className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{resource.type}</Badge>
                              <span className="font-medium">{resource.name}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{resource.reason}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex gap-3">
              <Button variant="outline" onClick={resetTest} className="flex-1">
                <RotateCcw className="mr-2 h-4 w-4" />
                Refaire le test
              </Button>
              <Button onClick={() => onOpenChange(false)} className="flex-1">
                Fermer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
