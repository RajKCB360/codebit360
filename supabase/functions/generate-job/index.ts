import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function scrapeJobPage(url: string, apiKey: string): Promise<string> {
  console.log('Scraping URL:', url);
  
  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: url,
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
  const markdown = data.data?.markdown || data.markdown;
  
  if (!markdown) {
    throw new Error('No content found on the page');
  }
  
  console.log('Scraped content length:', markdown.length);
  return markdown;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobUrl, jobText, rewriteStyle } = await req.json();
    
    let contentToProcess = jobText;
    let sourceUrl = jobUrl;

    // If URL is provided, scrape it
    if (jobUrl && !jobText) {
      const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
      if (!FIRECRAWL_API_KEY) {
        console.error('FIRECRAWL_API_KEY is not configured');
        return new Response(JSON.stringify({ error: 'Scraping service not configured. Please add FIRECRAWL_API_KEY.' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      try {
        contentToProcess = await scrapeJobPage(jobUrl, FIRECRAWL_API_KEY);
      } catch (scrapeError) {
        console.error('Scrape error:', scrapeError);
        return new Response(JSON.stringify({ error: `Failed to scrape job page: ${scrapeError instanceof Error ? scrapeError.message : 'Unknown error'}` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    if (!contentToProcess) {
      return new Response(JSON.stringify({ error: 'Please provide a job URL or job text' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return new Response(JSON.stringify({ error: 'AI service not configured. Please add GEMINI_API_KEY.' }), {
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
- Output VALID JSON ONLY - no markdown, no code blocks, just pure JSON
- Extract the apply URL from the content if available`;

    const userPrompt = `Job Content:
${contentToProcess}

${sourceUrl ? `Source URL: ${sourceUrl}` : ''}

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
  "seo_description": "string - SEO meta description under 160 chars",
  "apply_url": "string - the apply/career URL if found in content, or empty string"
}`;

    console.log('Calling Gemini API...');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${systemPrompt}\n\n${userPrompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: 'AI generation failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      console.error('No content in Gemini response:', JSON.stringify(data));
      return new Response(JSON.stringify({ error: 'AI returned empty response' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Gemini response received:', generatedText.substring(0, 200));

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
      console.error('Failed to parse Gemini response as JSON:', parseError, cleanedText);
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
        original_text: contentToProcess,
        source_url: sourceUrl || null,
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
