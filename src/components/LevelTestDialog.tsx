import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, CheckCircle2, XCircle, Loader2, ArrowRight, RotateCcw, Trophy, Target, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Question {
  id: number;
  type: string;
  question: string;
  questionFr: string;
  options: string[];
  correctAnswer: number;
}

interface Evaluation {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  estimatedLevel: string;
  message: string;
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
}

interface LevelTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LevelTestDialog({ open, onOpenChange }: LevelTestDialogProps) {
  const [step, setStep] = useState<'intro' | 'test' | 'results'>('intro');
  const [selectedLevel, setSelectedLevel] = useState<string>('A1');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingEval, setLoadingEval] = useState(false);

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  const startTest = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('german-level-test', {
        body: { action: 'generate_questions', currentLevel: selectedLevel }
      });

      if (error) throw error;

      if (data.questions) {
        setQuestions(data.questions);
        setStep('test');
        setCurrentQuestionIndex(0);
        setAnswers({});
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error('Erreur lors de la génération des questions. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = (answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestionIndex].id]: answerIndex
    }));
  };

  const nextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      await evaluateTest();
    }
  };

  const evaluateTest = async () => {
    setLoadingEval(true);
    try {
      const answersWithCorrect = questions.map(q => ({
        questionId: q.id,
        question: q.question,
        userAnswer: answers[q.id],
        correctAnswer: q.correctAnswer,
        isCorrect: answers[q.id] === q.correctAnswer
      }));

      const { data, error } = await supabase.functions.invoke('german-level-test', {
        body: { 
          action: 'evaluate', 
          answers: answersWithCorrect,
          currentLevel: selectedLevel
        }
      });

      if (error) throw error;

      setEvaluation(data);
      setStep('results');
    } catch (error) {
      console.error('Error evaluating test:', error);
      toast.error('Erreur lors de l\'évaluation. Veuillez réessayer.');
    } finally {
      setLoadingEval(false);
    }
  };

  const resetTest = () => {
    setStep('intro');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setEvaluation(null);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Test de Niveau d'Allemand
          </DialogTitle>
          <DialogDescription>
            Évaluez votre niveau avec notre test intelligent propulsé par l'IA
          </DialogDescription>
        </DialogHeader>

        {step === 'intro' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold">Comment ça fonctionne ?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span>5 questions adaptées à votre niveau estimé</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span>Questions de grammaire, vocabulaire et compréhension</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span>Évaluation personnalisée par IA</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span>Recommandations pour progresser</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Quel est votre niveau estimé ?</Label>
              <div className="grid grid-cols-3 gap-3">
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
              onClick={startTest} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Génération des questions...
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

        {step === 'test' && currentQuestion && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Question {currentQuestionIndex + 1} sur {questions.length}</span>
                <Badge variant="outline">{currentQuestion.type}</Badge>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{currentQuestion.question}</h3>
                  <p className="text-sm text-muted-foreground italic">{currentQuestion.questionFr}</p>
                </div>

                <RadioGroup
                  value={answers[currentQuestion.id]?.toString()}
                  onValueChange={(value) => submitAnswer(parseInt(value))}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        answers[currentQuestion.id] === index
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
              disabled={answers[currentQuestion.id] === undefined || loadingEval}
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
                  Terminer et voir les résultats
                  <Trophy className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        )}

        {step === 'results' && evaluation && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto">
                <Trophy className="h-12 w-12 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-3xl font-bold">{evaluation.score}%</h3>
                <p className="text-muted-foreground">
                  {evaluation.correctAnswers} / {evaluation.totalQuestions} bonnes réponses
                </p>
              </div>
              <Badge className="text-lg px-4 py-2" variant="default">
                Niveau estimé: {evaluation.estimatedLevel}
              </Badge>
            </div>

            <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardContent className="p-6">
                <p className="text-center text-lg">{evaluation.message}</p>
              </CardContent>
            </Card>

            {evaluation.strengths?.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Points forts
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {evaluation.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {evaluation.weaknesses?.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Target className="h-5 w-5 text-warning" />
                  Points à améliorer
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {evaluation.weaknesses.map((weakness, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-warning">→</span>
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {evaluation.recommendations?.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Recommandations
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {evaluation.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary">💡</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
