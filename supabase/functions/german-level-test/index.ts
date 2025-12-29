import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, answers, currentLevel, questionTypes, difficulty, voiceText, expectedText, previousAnswers, writtenResults, oralResults } = body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Action: Generate adaptive written test questions
    if (action === "generate_questions") {
      const level = currentLevel || "A1";
      const types = questionTypes || ["qcm", "fill_blank", "comprehension", "grammar", "vocabulary"];
      const adjustedDifficulty = difficulty || level;
      
      const systemPrompt = `Tu es un expert en allemand et en évaluation linguistique selon le CECR (Cadre Européen Commun de Référence).
Tu dois générer des questions de test de niveau adaptatives pour évaluer le niveau d'allemand d'un étudiant.

Niveau cible: ${adjustedDifficulty}
Types de questions demandés: ${types.join(", ")}

Génère exactement 10 questions variées avec les règles suivantes:
- 2 questions QCM de grammaire
- 2 questions QCM de vocabulaire
- 2 questions de phrases à compléter (fill_blank) - avec un mot manquant représenté par "___"
- 2 questions de compréhension de texte court
- 2 questions de grammaire avancée (conjugaison, déclinaisons)

Chaque question doit avoir:
- Un type spécifique (qcm, fill_blank, comprehension, grammar, vocabulary)
- Un énoncé clair en allemand avec traduction française
- 4 options de réponse
- Une seule bonne réponse
- Un niveau de difficulté (easy, medium, hard)
- Des points (1-3 selon difficulté)

Pour les questions fill_blank, utilise "___" pour marquer l'endroit où l'étudiant doit compléter.

Réponds UNIQUEMENT avec un JSON valide dans ce format exact:
{
  "questions": [
    {
      "id": 1,
      "type": "qcm",
      "category": "grammar",
      "difficulty": "medium",
      "points": 2,
      "question": "Question en allemand",
      "questionFr": "Traduction française",
      "context": "Contexte optionnel pour la question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Génère 10 questions de test de niveau ${adjustedDifficulty} pour évaluer un étudiant en allemand. Assure-toi de varier les types de questions.` }
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const t = await response.text();
        console.error("AI gateway error:", response.status, t);
        throw new Error("AI gateway error");
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse AI response");
      }
      
      const questions = JSON.parse(jsonMatch[0]);
      
      return new Response(JSON.stringify(questions), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: Adapt difficulty based on previous answers
    if (action === "adapt_difficulty") {
      const prevAnswers = previousAnswers || [];
      const currentLvl = currentLevel || "A1";
      
      // Calculate success rate
      const correctCount = prevAnswers.filter((a: any) => a.isCorrect).length;
      const totalCount = prevAnswers.length;
      const successRate = totalCount > 0 ? correctCount / totalCount : 0.5;
      
      // Determine new difficulty
      const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
      const currentIndex = levels.indexOf(currentLvl);
      
      let newLevel = currentLvl;
      if (successRate >= 0.8 && currentIndex < levels.length - 1) {
        newLevel = levels[currentIndex + 1];
      } else if (successRate <= 0.4 && currentIndex > 0) {
        newLevel = levels[currentIndex - 1];
      }
      
      return new Response(JSON.stringify({ 
        newDifficulty: newLevel,
        successRate,
        recommendation: successRate >= 0.7 ? "increase" : successRate <= 0.3 ? "decrease" : "maintain"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: Evaluate written test with detailed analysis
    if (action === "evaluate") {
      const systemPrompt = `Tu es un expert en évaluation du niveau d'allemand selon le CECR.
Analyse les réponses d'un étudiant de manière détaillée et détermine son niveau (A1, A2, B1, B2, C1, C2).

L'étudiant a répondu à des questions de niveau ${currentLevel}.
Voici ses réponses avec les temps de réponse:
${JSON.stringify(answers, null, 2)}

Analyse en profondeur:
1. Le pourcentage de bonnes réponses par catégorie (grammaire, vocabulaire, compréhension)
2. La cohérence des réponses
3. Les temps de réponse (rapide = confiance, lent = hésitation)
4. Les patterns d'erreurs

Détermine:
1. Le score global en pourcentage
2. Le niveau CECRL estimé
3. Des forces spécifiques avec exemples
4. Des faiblesses spécifiques avec exemples
5. Un plan d'apprentissage détaillé
6. Des recommandations personnalisées

Réponds UNIQUEMENT avec un JSON valide:
{
  "score": 75,
  "correctAnswers": 8,
  "totalQuestions": 10,
  "totalPoints": 18,
  "maxPoints": 24,
  "estimatedLevel": "B1",
  "confidence": "high",
  "message": "Message d'encouragement personnalisé détaillé",
  "categoryScores": {
    "grammar": 80,
    "vocabulary": 70,
    "comprehension": 75,
    "fill_blank": 65
  },
  "strengths": [
    {
      "area": "Vocabulaire de base",
      "description": "Excellente maîtrise du vocabulaire quotidien",
      "examples": ["Utilisation correcte de 'Guten Tag', 'Danke'"]
    }
  ],
  "weaknesses": [
    {
      "area": "Déclinaisons",
      "description": "Difficulté avec les articles définis",
      "examples": ["Confusion entre 'der', 'die', 'das'"]
    }
  ],
  "recommendations": [
    "Pratiquer les déclinaisons des articles avec des exercices quotidiens",
    "Écouter des podcasts en allemand niveau B1"
  ],
  "learningPlan": {
    "shortTerm": ["Réviser les articles définis", "Pratiquer 15 min/jour"],
    "mediumTerm": ["Commencer les textes niveau B1", "Enrichir le vocabulaire thématique"],
    "longTerm": ["Viser le niveau B2 en 6 mois", "Préparer un examen officiel"]
  },
  "timeAnalysis": {
    "averageResponseTime": 15,
    "fastAnswers": 5,
    "slowAnswers": 3,
    "interpretation": "Bonne réactivité sur les questions de vocabulaire, hésitation sur la grammaire"
  }
}`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "Évalue les réponses de l'étudiant avec une analyse détaillée et génère un rapport complet." }
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("AI gateway error");
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse AI response");
      }
      
      const evaluation = JSON.parse(jsonMatch[0]);
      
      return new Response(JSON.stringify(evaluation), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: Evaluate voice/pronunciation
    if (action === "evaluate_voice") {
      const systemPrompt = `Tu es un expert en phonétique allemande et en évaluation de la prononciation.

Texte attendu: "${expectedText}"
Texte prononcé par l'étudiant (transcription): "${voiceText}"

Analyse la prononciation de l'étudiant en comparant ce qu'il a dit avec le texte attendu.
Évalue:
1. La précision de la prononciation (mots corrects vs incorrects)
2. La fluidité (cohérence du discours)
3. L'accent (approximation d'un accent natif)
4. L'intonation (naturelle ou mécanique)
5. Le vocabulaire utilisé

Compare avec des modèles de prononciation native allemande.

Réponds UNIQUEMENT avec un JSON valide:
{
  "score": 75,
  "accuracy": 80,
  "fluency": 70,
  "accent": 65,
  "intonation": 75,
  "vocabularyRichness": 70,
  "estimatedOralLevel": "B1",
  "transcribedText": "Ce que l'étudiant a dit",
  "expectedText": "Ce qui était attendu",
  "feedback": {
    "overall": "Commentaire général sur la performance",
    "pronunciation": "Détails sur la prononciation",
    "suggestions": ["Suggestion 1", "Suggestion 2"]
  },
  "wordAnalysis": [
    {
      "word": "Guten",
      "expected": "Guten",
      "spoken": "Guten",
      "correct": true,
      "phonemeIssues": []
    }
  ],
  "strengths": ["Force 1", "Force 2"],
  "areasToImprove": ["Amélioration 1", "Amélioration 2"]
}`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "Évalue la prononciation de l'étudiant et génère un rapport détaillé." }
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("AI gateway error");
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse AI response");
      }
      
      const voiceEvaluation = JSON.parse(jsonMatch[0]);
      
      return new Response(JSON.stringify(voiceEvaluation), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: Generate voice test content
    if (action === "generate_voice_test") {
      const level = currentLevel || "A1";
      
      const systemPrompt = `Tu es un expert en allemand. Génère du contenu pour un test oral de niveau ${level}.

Crée 3 exercices vocaux:
1. Lecture d'un texte court (3-5 phrases adaptées au niveau)
2. Répétition de 5 phrases courtes
3. Une question ouverte simple pour une réponse libre

Le contenu doit être adapté au niveau ${level} du CECR.

Réponds UNIQUEMENT avec un JSON valide:
{
  "exercises": [
    {
      "id": 1,
      "type": "reading",
      "title": "Lecture de texte",
      "titleFr": "Lecture de texte",
      "instruction": "Lisez le texte suivant à voix haute",
      "instructionFr": "Lisez le texte suivant à voix haute",
      "content": "Texte en allemand à lire...",
      "contentFr": "Traduction française"
    },
    {
      "id": 2,
      "type": "repetition",
      "title": "Répétition de phrases",
      "titleFr": "Répétition de phrases",
      "instruction": "Répétez chaque phrase après l'avoir lue",
      "instructionFr": "Répétez chaque phrase après l'avoir lue",
      "sentences": [
        {"german": "Phrase 1", "french": "Traduction 1"},
        {"german": "Phrase 2", "french": "Traduction 2"}
      ]
    },
    {
      "id": 3,
      "type": "free_response",
      "title": "Réponse libre",
      "titleFr": "Réponse libre",
      "instruction": "Répondez à la question en allemand",
      "instructionFr": "Répondez à la question en allemand",
      "question": "Question en allemand?",
      "questionFr": "Traduction de la question",
      "expectedTopics": ["Thème attendu 1", "Thème attendu 2"]
    }
  ]
}`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Génère un test oral complet pour le niveau ${level}.` }
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("AI gateway error");
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse AI response");
      }
      
      const voiceTest = JSON.parse(jsonMatch[0]);
      
      return new Response(JSON.stringify(voiceTest), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: Generate global report combining written and oral
    if (action === "generate_global_report") {
      // writtenResults and oralResults are already extracted from the body at the top
      
      const systemPrompt = `Tu es un expert en évaluation linguistique selon le CECR.

Combine les résultats du test écrit et du test oral pour générer un rapport global complet.

Résultats du test écrit:
${JSON.stringify(writtenResults, null, 2)}

Résultats du test oral:
${JSON.stringify(oralResults, null, 2)}

Génère un rapport global qui:
1. Calcule un niveau CECRL global (moyenne pondérée: 60% écrit, 40% oral)
2. Identifie les forces et faiblesses combinées
3. Crée un plan d'apprentissage personnalisé et détaillé
4. Propose des ressources adaptées

Réponds UNIQUEMENT avec un JSON valide:
{
  "globalScore": 75,
  "writtenScore": 80,
  "oralScore": 68,
  "globalLevel": "B1",
  "writtenLevel": "B1",
  "oralLevel": "A2",
  "levelExplanation": "Explication du niveau global",
  "summary": "Résumé complet des performances",
  "combinedStrengths": [
    {
      "area": "Domaine",
      "writtenPerformance": "Performance à l'écrit",
      "oralPerformance": "Performance à l'oral"
    }
  ],
  "combinedWeaknesses": [
    {
      "area": "Domaine",
      "writtenPerformance": "Performance à l'écrit",
      "oralPerformance": "Performance à l'oral",
      "priority": "high"
    }
  ],
  "personalizedPlan": {
    "immediate": ["Action immédiate 1", "Action immédiate 2"],
    "weekly": ["Objectif hebdomadaire 1"],
    "monthly": ["Objectif mensuel 1"],
    "targetLevel": "B2",
    "estimatedTimeToTarget": "6 mois"
  },
  "recommendedResources": [
    {
      "type": "app",
      "name": "Nom de l'application",
      "reason": "Pourquoi c'est recommandé"
    }
  ],
  "nextSteps": ["Prochaine étape 1", "Prochaine étape 2"]
}`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "Génère un rapport global combinant les résultats écrits et oraux." }
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("AI gateway error");
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse AI response");
      }
      
      const globalReport = JSON.parse(jsonMatch[0]);
      
      return new Response(JSON.stringify(globalReport), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid action");
  } catch (error) {
    console.error("german-level-test error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
