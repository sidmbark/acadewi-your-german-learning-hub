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
    const { action, answers, currentLevel } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (action === "generate_questions") {
      const level = currentLevel || "A1";
      
      const systemPrompt = `Tu es un expert en allemand et en évaluation linguistique selon le CECR (Cadre Européen Commun de Référence).
Tu dois générer des questions de test de niveau pour évaluer le niveau d'allemand d'un étudiant.

Génère exactement 5 questions adaptées au niveau ${level} avec les règles suivantes:
- 2 questions de grammaire (choix multiples)
- 2 questions de vocabulaire (choix multiples)  
- 1 question de compréhension (choix multiples)

Chaque question doit avoir:
- Un énoncé clair en allemand avec traduction française
- 4 options de réponse
- Une seule bonne réponse

Réponds UNIQUEMENT avec un JSON valide dans ce format exact:
{
  "questions": [
    {
      "id": 1,
      "type": "grammar",
      "question": "Question en allemand",
      "questionFr": "Traduction française",
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
            { role: "user", content: `Génère 5 questions de test de niveau ${level} pour évaluer un étudiant en allemand.` }
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
      
      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse AI response");
      }
      
      const questions = JSON.parse(jsonMatch[0]);
      
      return new Response(JSON.stringify(questions), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "evaluate") {
      const systemPrompt = `Tu es un expert en évaluation du niveau d'allemand selon le CECR.
Analyse les réponses d'un étudiant et détermine son niveau (A1, A2, B1, B2, C1, C2).

L'étudiant a répondu à des questions de niveau ${currentLevel}.
Voici ses réponses et les bonnes réponses:
${JSON.stringify(answers, null, 2)}

Calcule le score et détermine:
1. Le pourcentage de bonnes réponses
2. Le niveau estimé de l'étudiant
3. Des recommandations personnalisées

Réponds UNIQUEMENT avec un JSON valide:
{
  "score": 80,
  "correctAnswers": 4,
  "totalQuestions": 5,
  "estimatedLevel": "A2",
  "message": "Message d'encouragement personnalisé",
  "recommendations": ["Conseil 1", "Conseil 2"],
  "strengths": ["Point fort 1"],
  "weaknesses": ["Point à améliorer 1"]
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
            { role: "user", content: "Évalue les réponses de l'étudiant et détermine son niveau." }
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

    throw new Error("Invalid action");
  } catch (error) {
    console.error("german-level-test error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
