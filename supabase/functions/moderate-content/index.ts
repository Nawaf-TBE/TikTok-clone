import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENAI_API_URL = 'https://api.openai.com/v1/moderations'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { text } = await req.json()

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'No content provided for moderation' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Call OpenAI's moderation API
    const moderationResponse = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: text }),
    })

    const moderationData = await moderationResponse.json()

    // Log moderation results
    console.log('Moderation results:', moderationData)

    if (!moderationResponse.ok) {
      throw new Error('Failed to moderate content')
    }

    const isFlagged = moderationData.results[0].flagged
    const categories = moderationData.results[0].categories
    const scores = moderationData.results[0].category_scores

    return new Response(
      JSON.stringify({
        isFlagged,
        categories,
        scores,
        isAccepted: !isFlagged,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in content moderation:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to moderate content' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})