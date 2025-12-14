import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function scrapeInternshipPage(url: string, apiKey: string): Promise<string> {
  console.log('Scraping URL:', url);
  
  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      formats: ['markdown'],
      onlyMainContent: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Firecrawl error:', response.status, errorText);
    throw new Error(`Failed to scrape URL: ${response.status}`);
  }

  const data = await response.json();
  const content = data.data?.markdown || data.markdown || '';
  
  if (!content) {
    throw new Error('No content found at the provided URL');
  }

  console.log('Scraped content length:', content.length);
  return content;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { internshipText, internshipUrl } = await req.json();

    let content = internshipText;

    // If URL provided, scrape it first
    if (internshipUrl && !internshipText) {
      const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
      if (!FIRECRAWL_API_KEY) {
        return new Response(
          JSON.stringify({ error: 'URL scraping is not configured. Please use text input instead.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      try {
        content = await scrapeInternshipPage(internshipUrl, FIRECRAWL_API_KEY);
      } catch (scrapeError) {
        console.error('Scraping failed:', scrapeError);
        return new Response(
          JSON.stringify({ error: `Failed to scrape URL. Try copying and pasting the text instead.` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Please provide internship text or URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a helpful assistant that converts internship descriptions into structured data for a student-focused EdTech platform.

Your task is to extract and format internship information into a JSON structure. Be concise and student-friendly.

Return ONLY valid JSON with this exact structure:
{
  "title": "Internship title (clear, concise)",
  "description": "2-3 sentence description highlighting what students will learn",
  "duration": "Duration (e.g., '4 weeks', '2 months')",
  "skills": ["skill1", "skill2", "skill3"] (3-6 relevant skills),
  "has_certificate": true/false (default true if mentioned or typical),
  "is_paid": true/false (default false unless clearly stated as paid),
  "price": 0 (only set if it's a paid internship for students)
}`;

    const userPrompt = `Convert this internship description into structured data:

${content}

Return ONLY the JSON object, no markdown formatting.`;

    console.log('Calling AI to generate internship...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    let generatedText = data.choices[0]?.message?.content || '';
    
    console.log('AI response received:', generatedText.substring(0, 200));

    // Clean up potential markdown formatting
    generatedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let internship;
    try {
      internship = JSON.parse(generatedText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Add original text for reference
    internship.original_text = content;

    return new Response(
      JSON.stringify({ internship }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-internship:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
