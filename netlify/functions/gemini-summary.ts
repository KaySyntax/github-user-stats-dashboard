import type { Handler } from '@netlify/functions'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { DashboardStats } from '../../src/types/github'
import { determinePersona } from '../../src/utils/persona'

const apiKey = process.env.GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(apiKey)

// Helper for exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000
): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;
      const is503 = error?.status === 503 || error?.message?.includes('503') || error?.message?.includes('Service Unavailable');
      
      if (!is503 || attempt >= maxRetries) {
        throw error;
      }
      
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(`[Gemini API] 503 Error. Retrying in ${delay}ms... (Attempt ${attempt} of ${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Max retries exceeded");
}

/**
 * Parse JSON from the model response, handling markdown fences.
 */
function parseJsonResponse(text: string): { title: string; summary: string } {
  // Strip markdown code fences if present
  let cleaned = text.trim()
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
  
  try {
    const parsed = JSON.parse(cleaned)
    if (parsed.title && parsed.summary) {
      return { title: parsed.title, summary: parsed.summary }
    }
  } catch {
    // If JSON parsing fails, use the raw text as summary
  }
  
  return { title: 'The Developer', summary: cleaned }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) }
  }

  try {
    const stats = JSON.parse(event.body || '{}') as DashboardStats

    if (!stats?.user?.login) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid stats payload' }) }
    }

    // Safety net: truncate repos server-side to prevent token limits
    const truncatedRepos = [...(stats.repos || [])]
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 15)

    const topLangs = stats.languages.slice(0, 5).map((l: any) => l.name).join(', ')
    const topRepos = truncatedRepos.slice(0, 5).map((r: any) => `${r.name} (${r.stargazers_count}★)`).join(', ')

    // Fallback if no API key is provided
    if (!apiKey) {
      const persona = determinePersona(stats)
      const topLang = stats.languages[0]?.name || 'Code'
      const fallbackTitle = `The ${topLang} ${persona.title}`
      const fallbackText = `Looking at these stats, @${stats.user.login} is definitely a ${persona.title}. They show a strong preference for ${topLang}, managing ${stats.user.public_repos} public repositories. With ${stats.totalStars} stars across their projects, they are clearly making their mark on the open-source community!`
      
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: fallbackTitle, summary: fallbackText }),
      }
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })
    
    const prompt = `You are a developer profiling AI. Perform a deep scan of the following GitHub stats for @${stats.user.login} based on their top 15 repositories:

- Bio: ${stats.user.bio || 'None'}
- Repos: ${stats.user.public_repos}
- Followers: ${stats.user.followers}
- Total Stars: ${stats.totalStars}
- Total Commits (recent): ${stats.totalCommits}
- Top Languages: ${topLangs || 'None'}
- Top Repositories: ${topRepos || 'None'}

Respond with ONLY a JSON object (no markdown, no code fences) in this exact format:
{"title": "...", "summary": "..."}

Rules for "title": 
- Perform a deep scan of their top repositories and languages to generate a highly diverse, hyper-specific, and factual identity title based on their actual tech stack.
- It MUST be short (2-4 words).
- Examples: "The Next.js Architect", "The PyTorch Data Wizard", "The Rust Systems Engineer", "The Go Microservices Pro".
- ABSOLUTELY DO NOT use generic titles like "Open Source Warrior", "Code Enthusiast", or "The Developer". It must be factual.

Rules for "summary":
- Write a fun, punchy, 3-sentence developer persona analysis.
- Highlight their strengths, coding style, and impact.
- Use a slightly playful, admiring tone.
- Plain text only, no markdown formatting.`

    const result = await withRetry(() => model.generateContent(prompt));
    const response = await result.response
    const parsed = parseJsonResponse(response.text())

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed),
    }
  } catch (error) {
    console.error('Gemini Function Error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        title: 'The Developer',
        summary: 'Wow, these stats are off the charts! Our AI tried to analyze them, but got a bit overwhelmed. Keep up the amazing coding!' 
      }),
    }
  }
}

