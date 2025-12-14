import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobText, rewriteStyle } = await req.json();
    
    if (!jobText) {
      return new Response(JSON.stringify({ error: 'Job text is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are an AI job content editor for CodeBit360, an EdTech platform for tech students and freshers in India.

Your task: Convert job descriptions into a standardized, student-friendly job post.

Rules:
- Rewrite content fully, do NOT copy text verbatim
- Make it fresher-friendly and realistic
- Remove unrealistic experience requirements for freshers
- Use simple, clear language
- Follow the CodeBit360 job template strictly
- Never mention LinkedIn, Naukri, or other job portals
- Do NOT include confidential company information
- Prices should be in Indian Rupee (₹)
- Output VALID JSON ONLY - no markdown, no code blocks, just pure JSON`;

    const userPrompt = `Job Content:
${jobText}

Rewrite Style: ${rewriteStyle || 'fresher'}

Return output strictly in this JSON format (no markdown, no code blocks):
{
  "job_title": "string - clear job title",
  "company_name": "string - company name",
  "location": "string - city or Remote",
  "job_type": "string - Full-time, Part-time, Internship, or Contract",
  "experience_level": "string - Fresher, 0-1 Years, or 0-2 Years",
  "skills": ["array", "of", "required", "skills"],
  "responsibilities": "string - bullet points separated by newlines",
  "eligibility": "string - degree requirements, graduation year, streams",
  "seo_title": "string - SEO optimized title under 60 chars",
  "seo_description": "string - SEO meta description under 160 chars"
}`;

    console.log('Calling Lovable AI Gateway...');
    
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
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        console.error('Payment required');
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI generation failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content;

    if (!generatedText) {
      console.error('No content in AI response');
      return new Response(JSON.stringify({ error: 'AI returned empty response' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('AI response received:', generatedText.substring(0, 200));

    // Parse the JSON response - handle potential markdown code blocks
    let cleanedText = generatedText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.slice(7);
    }
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();

    let jobData;
    try {
      jobData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError, cleanedText);
      return new Response(JSON.stringify({ error: 'Failed to parse AI response', raw: cleanedText }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Successfully parsed job data:', jobData.job_title);

    return new Response(JSON.stringify({ 
      success: true, 
      job: {
        ...jobData,
        original_text: jobText,
        ai_generated: true,
        status: 'draft'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-job function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
