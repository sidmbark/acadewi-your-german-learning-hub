import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple German-French dictionary with common words
const germanDictionary: Record<string, any> = {
  'haus': {
    word: 'Haus',
    phonetic: '/haʊ̯s/',
    partOfSpeech: 'Nom',
    gender: 'das',
    plural: 'Häuser',
    translation: 'Maison',
    examples: [
      { german: 'Das Haus ist groß.', french: 'La maison est grande.' },
      { german: 'Ich gehe nach Hause.', french: 'Je rentre à la maison.' }
    ]
  },
  'gehen': {
    word: 'gehen',
    phonetic: '/ˈɡeːən/',
    partOfSpeech: 'Verbe',
    translation: 'Aller, marcher',
    examples: [
      { german: 'Ich gehe zur Schule.', french: 'Je vais à l\'école.' },
      { german: 'Wie geht es dir?', french: 'Comment vas-tu?' }
    ],
    conjugation: ['ich gehe', 'du gehst', 'er/sie/es geht', 'wir gehen', 'ihr geht', 'sie gehen']
  },
  'schön': {
    word: 'schön',
    phonetic: '/ʃøːn/',
    partOfSpeech: 'Adjectif',
    translation: 'Beau, belle, joli(e)',
    examples: [
      { german: 'Das Wetter ist schön.', french: 'Le temps est beau.' },
      { german: 'Eine schöne Frau.', french: 'Une belle femme.' }
    ]
  },
  'danke': {
    word: 'Danke',
    phonetic: '/ˈdaŋkə/',
    partOfSpeech: 'Interjection',
    translation: 'Merci',
    examples: [
      { german: 'Danke schön!', french: 'Merci beaucoup!' },
      { german: 'Danke für alles.', french: 'Merci pour tout.' }
    ]
  },
  'hallo': {
    word: 'Hallo',
    phonetic: '/haˈloː/',
    partOfSpeech: 'Interjection',
    translation: 'Bonjour, Salut',
    examples: [
      { german: 'Hallo! Wie geht es dir?', french: 'Salut! Comment vas-tu?' }
    ]
  },
  'gut': {
    word: 'gut',
    phonetic: '/ɡuːt/',
    partOfSpeech: 'Adjectif/Adverbe',
    translation: 'Bon, bien',
    examples: [
      { german: 'Das ist gut!', french: 'C\'est bien!' },
      { german: 'Mir geht es gut.', french: 'Je vais bien.' }
    ]
  },
  'buch': {
    word: 'Buch',
    phonetic: '/buːx/',
    partOfSpeech: 'Nom',
    gender: 'das',
    plural: 'Bücher',
    translation: 'Livre',
    examples: [
      { german: 'Ich lese ein Buch.', french: 'Je lis un livre.' },
      { german: 'Das Buch ist interessant.', french: 'Le livre est intéressant.' }
    ]
  },
  'lernen': {
    word: 'lernen',
    phonetic: '/ˈlɛʁnən/',
    partOfSpeech: 'Verbe',
    translation: 'Apprendre',
    examples: [
      { german: 'Ich lerne Deutsch.', french: 'J\'apprends l\'allemand.' },
      { german: 'Wir lernen zusammen.', french: 'Nous apprenons ensemble.' }
    ],
    conjugation: ['ich lerne', 'du lernst', 'er/sie/es lernt', 'wir lernen', 'ihr lernt', 'sie lernen']
  },
  'sprechen': {
    word: 'sprechen',
    phonetic: '/ˈʃpʁɛçn̩/',
    partOfSpeech: 'Verbe',
    translation: 'Parler',
    examples: [
      { german: 'Sprechen Sie Deutsch?', french: 'Parlez-vous allemand?' },
      { german: 'Er spricht sehr schnell.', french: 'Il parle très vite.' }
    ],
    conjugation: ['ich spreche', 'du sprichst', 'er/sie/es spricht', 'wir sprechen', 'ihr sprecht', 'sie sprechen']
  },
  'verstehen': {
    word: 'verstehen',
    phonetic: '/fɛɐ̯ˈʃteːən/',
    partOfSpeech: 'Verbe',
    translation: 'Comprendre',
    examples: [
      { german: 'Ich verstehe nicht.', french: 'Je ne comprends pas.' },
      { german: 'Verstehst du mich?', french: 'Tu me comprends?' }
    ],
    conjugation: ['ich verstehe', 'du verstehst', 'er/sie/es versteht', 'wir verstehen', 'ihr versteht', 'sie verstehen']
  },
  'schule': {
    word: 'Schule',
    phonetic: '/ˈʃuːlə/',
    partOfSpeech: 'Nom',
    gender: 'die',
    plural: 'Schulen',
    translation: 'École',
    examples: [
      { german: 'Ich gehe zur Schule.', french: 'Je vais à l\'école.' },
      { german: 'Die Schule beginnt um 8 Uhr.', french: 'L\'école commence à 8 heures.' }
    ]
  },
  'freund': {
    word: 'Freund',
    phonetic: '/fʁɔɪ̯nt/',
    partOfSpeech: 'Nom',
    gender: 'der',
    plural: 'Freunde',
    translation: 'Ami',
    examples: [
      { german: 'Er ist mein bester Freund.', french: 'Il est mon meilleur ami.' },
      { german: 'Ich treffe meine Freunde.', french: 'Je retrouve mes amis.' }
    ]
  },
  'arbeit': {
    word: 'Arbeit',
    phonetic: '/ˈaʁbaɪ̯t/',
    partOfSpeech: 'Nom',
    gender: 'die',
    plural: 'Arbeiten',
    translation: 'Travail',
    examples: [
      { german: 'Ich gehe zur Arbeit.', french: 'Je vais au travail.' },
      { german: 'Die Arbeit ist schwer.', french: 'Le travail est difficile.' }
    ]
  },
  'essen': {
    word: 'essen',
    phonetic: '/ˈɛsn̩/',
    partOfSpeech: 'Verbe',
    translation: 'Manger',
    examples: [
      { german: 'Was möchtest du essen?', french: 'Que veux-tu manger?' },
      { german: 'Wir essen zusammen.', french: 'Nous mangeons ensemble.' }
    ],
    conjugation: ['ich esse', 'du isst', 'er/sie/es isst', 'wir essen', 'ihr esst', 'sie essen']
  },
  'trinken': {
    word: 'trinken',
    phonetic: '/ˈtʁɪŋkn̩/',
    partOfSpeech: 'Verbe',
    translation: 'Boire',
    examples: [
      { german: 'Ich trinke Wasser.', french: 'Je bois de l\'eau.' },
      { german: 'Was trinkst du?', french: 'Que bois-tu?' }
    ],
    conjugation: ['ich trinke', 'du trinkst', 'er/sie/es trinkt', 'wir trinken', 'ihr trinkt', 'sie trinken']
  },
  'wasser': {
    word: 'Wasser',
    phonetic: '/ˈvasɐ/',
    partOfSpeech: 'Nom',
    gender: 'das',
    plural: '-',
    translation: 'Eau',
    examples: [
      { german: 'Ich möchte Wasser trinken.', french: 'Je voudrais boire de l\'eau.' },
      { german: 'Das Wasser ist kalt.', french: 'L\'eau est froide.' }
    ]
  },
  'zeit': {
    word: 'Zeit',
    phonetic: '/t͡saɪ̯t/',
    partOfSpeech: 'Nom',
    gender: 'die',
    plural: 'Zeiten',
    translation: 'Temps',
    examples: [
      { german: 'Ich habe keine Zeit.', french: 'Je n\'ai pas le temps.' },
      { german: 'Die Zeit vergeht schnell.', french: 'Le temps passe vite.' }
    ]
  },
  'heute': {
    word: 'heute',
    phonetic: '/ˈhɔɪ̯tə/',
    partOfSpeech: 'Adverbe',
    translation: 'Aujourd\'hui',
    examples: [
      { german: 'Was machst du heute?', french: 'Que fais-tu aujourd\'hui?' },
      { german: 'Heute ist Montag.', french: 'Aujourd\'hui c\'est lundi.' }
    ]
  },
  'morgen': {
    word: 'morgen',
    phonetic: '/ˈmɔʁɡn̩/',
    partOfSpeech: 'Adverbe',
    translation: 'Demain',
    examples: [
      { german: 'Bis morgen!', french: 'À demain!' },
      { german: 'Morgen regnet es.', french: 'Demain il pleut.' }
    ]
  },
  'gestern': {
    word: 'gestern',
    phonetic: '/ˈɡɛstɐn/',
    partOfSpeech: 'Adverbe',
    translation: 'Hier',
    examples: [
      { german: 'Gestern war ich müde.', french: 'Hier j\'étais fatigué.' },
      { german: 'Was hast du gestern gemacht?', french: 'Qu\'as-tu fait hier?' }
    ]
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { word } = await req.json();

    if (!word) {
      return new Response(
        JSON.stringify({ error: 'Word is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const searchTerm = word.toLowerCase().trim();
    const entry = germanDictionary[searchTerm];

    if (entry) {
      return new Response(
        JSON.stringify({ entries: [entry] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If not found in local dictionary, use AI to generate definition
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (LOVABLE_API_KEY) {
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
              content: `Tu es un dictionnaire allemand-français. Réponds uniquement avec un JSON valide contenant les informations du mot demandé.
Format de réponse:
{
  "word": "mot en allemand avec majuscule si nom",
  "phonetic": "transcription phonétique",
  "partOfSpeech": "Nom/Verbe/Adjectif/Adverbe/etc",
  "gender": "der/die/das (uniquement pour les noms)",
  "plural": "forme plurielle (uniquement pour les noms)",
  "translation": "traduction en français",
  "examples": [
    { "german": "phrase en allemand", "french": "traduction en français" }
  ],
  "conjugation": ["conjugaison présent si verbe"]
}`
            },
            {
              role: 'user',
              content: `Donne-moi la définition du mot allemand: ${word}`
            }
          ],
          tools: [
            {
              type: 'function',
              function: {
                name: 'provide_definition',
                description: 'Provide the dictionary definition of a German word',
                parameters: {
                  type: 'object',
                  properties: {
                    word: { type: 'string' },
                    phonetic: { type: 'string' },
                    partOfSpeech: { type: 'string' },
                    gender: { type: 'string' },
                    plural: { type: 'string' },
                    translation: { type: 'string' },
                    examples: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          german: { type: 'string' },
                          french: { type: 'string' }
                        }
                      }
                    },
                    conjugation: {
                      type: 'array',
                      items: { type: 'string' }
                    }
                  },
                  required: ['word', 'phonetic', 'partOfSpeech', 'translation', 'examples']
                }
              }
            }
          ],
          tool_choice: { type: 'function', function: { name: 'provide_definition' } }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
        
        if (toolCall?.function?.arguments) {
          const definition = JSON.parse(toolCall.function.arguments);
          return new Response(
            JSON.stringify({ entries: [definition] }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    return new Response(
      JSON.stringify({ entries: [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Dictionary error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
