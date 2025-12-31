import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Google Cloud TTS via Lovable AI for German pronunciation
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      // Fallback: Use browser's built-in speech synthesis (return instruction)
      return new Response(
        JSON.stringify({ 
          useBrowserTTS: true,
          text: text,
          lang: 'de-DE'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use AI to generate phonetic guidance for the word
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en prononciation allemande. Génère une description phonétique claire et simple pour aider un francophone à prononcer le mot allemand correctement.'
          },
          {
            role: 'user',
            content: `Comment prononcer le mot allemand "${text}"? Donne une explication simple de la prononciation.`
          }
        ]
      }),
    });

    if (!response.ok) {
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const pronunciation = data.choices?.[0]?.message?.content;

    // Return instruction to use browser TTS with pronunciation guide
    return new Response(
      JSON.stringify({ 
        useBrowserTTS: true,
        text: text,
        lang: 'de-DE',
        pronunciationGuide: pronunciation
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('TTS error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
