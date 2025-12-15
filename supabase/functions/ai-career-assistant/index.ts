import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt = "";
    let userPrompt = "";
    let parseAsJson = false;

    if (action === "chat") {
      const { messages } = body;
      
      systemPrompt = `You are an expert AI Career Assistant for CodeBit360, an EdTech platform for tech students and professionals.

Your expertise includes:
- Career guidance for CS/IT students and professionals
- Tech career paths (DevOps, Data Science, AI/ML, Full Stack, Cloud, etc.)
- Resume optimization and ATS best practices
- Interview preparation strategies
- Skill development roadmaps
- Career transitions (e.g., support to developer)

Guidelines:
1. Be encouraging and supportive
2. Give specific, actionable advice
3. Reference current industry trends
4. Suggest relevant CodeBit360 resources (courses, roadmaps, internships) when appropriate
5. Keep responses concise but helpful
6. Use markdown formatting for clarity (bold, bullet points)
7. For resume advice, focus on ATS optimization
8. For interview prep, give specific question examples`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages
          ],
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI Gateway error:", response.status, errorText);
        throw new Error(`AI Gateway error: ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.choices?.[0]?.message?.content?.trim() || "I apologize, I couldn't generate a response. Please try again.";

      return new Response(JSON.stringify({ response: responseText }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === "skill-gap") {
      const { currentSkills, targetRole } = body;
      parseAsJson = true;
      
      systemPrompt = `You are an expert career advisor analyzing skill gaps for tech roles.`;
      
      userPrompt = `Analyze the skill gap for someone with these skills wanting to become a ${targetRole}.

Current skills: ${currentSkills}

Return a JSON object with this exact structure:
{
  "readinessScore": <number 0-100>,
  "existingSkills": ["skill1", "skill2"],
  "missingSkills": [
    {"name": "skill name", "priority": "high|medium|low"},
    ...
  ],
  "timeEstimate": "X-Y months of dedicated learning",
  "recommendations": ["recommendation1", "recommendation2"]
}

Be realistic about the readiness score. Only return the JSON, nothing else.`;
    }

    if (action === "resume-match") {
      const { resumeText, jobDescription } = body;
      parseAsJson = true;
      
      systemPrompt = `You are an ATS expert analyzing resume-job matches.`;
      
      userPrompt = `Analyze how well this resume matches the job description.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return a JSON object with this exact structure:
{
  "matchScore": <number 0-100>,
  "matchingKeywords": ["keyword1", "keyword2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}

Focus on:
1. ATS keyword matching
2. Skills alignment
3. Experience relevance
4. Actionable improvements

Only return the JSON, nothing else.`;
    }

    if (action === "interview-prep") {
      const { role } = body;
      parseAsJson = true;
      
      systemPrompt = `You are an expert technical interviewer preparing candidates for ${role} interviews.`;
      
      userPrompt = `Generate 5 interview questions for a ${role} position covering different aspects.

Return a JSON array with this exact structure:
[
  {
    "question": "The interview question",
    "type": "Technical|Behavioral|System Design|Problem Solving",
    "difficulty": "easy|medium|hard",
    "suggestedAnswer": "A comprehensive answer guide"
  }
]

Include a mix of:
- 2 Technical questions
- 1 Behavioral question  
- 1 Problem-solving question
- 1 Role-specific question

Only return the JSON array, nothing else.`;
    }

    if (action === "mock-interview-questions") {
      const { role, count = 5 } = body;
      parseAsJson = true;
      
      systemPrompt = `You are an expert interviewer for ${role} positions.`;
      
      userPrompt = `Generate ${count} interview questions for a ${role} mock interview.

Return a JSON array:
[{"id":1,"question":"...","type":"Technical|Behavioral|Problem Solving","difficulty":"easy|medium|hard","suggestedAnswer":"...","keyPoints":["point1","point2"]}]

Mix question types. Only return JSON.`;
    }

    if (action === "evaluate-answer") {
      const { question, answer, role, questionType } = body;
      parseAsJson = true;
      
      systemPrompt = `You are an expert interview coach evaluating answers for ${role} positions.`;
      
      userPrompt = `Evaluate this interview answer:

Question: ${question}
Answer: ${answer}

Return JSON:
{"score":<0-100>,"strengths":["..."],"improvements":["..."],"sampleAnswer":"...","tips":["..."]}

Be constructive. Only return JSON.`;
    }

    if (parseAsJson) {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI Gateway error:", response.status, errorText);
        
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        throw new Error(`AI Gateway error: ${response.status}`);
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content?.trim() || "";
      
      // Clean up potential markdown code blocks
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      try {
        const result = JSON.parse(content);
        
        if (action === "interview-prep") {
          return new Response(JSON.stringify({ questions: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        return new Response(JSON.stringify({ result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (parseError) {
        console.error("JSON parse error:", parseError, "Content:", content);
        throw new Error("Failed to parse AI response");
      }
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in ai-career-assistant:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
