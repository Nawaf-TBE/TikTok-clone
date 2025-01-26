import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { videoId, title, description } = await req.json()

    if (!videoId || !title) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Call the content moderation function for title and description
    const moderateContentResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/moderate-content`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `${title} ${description || ''}`,
        }),
      }
    )

    const moderationResult = await moderateContentResponse.json()

    if (!moderationResult.isAccepted) {
      // Delete the video if content is flagged
      const { error: deleteError } = await supabaseClient
        .from('videos')
        .delete()
        .eq('id', videoId)

      if (deleteError) {
        throw new Error('Failed to delete flagged video')
      }

      return new Response(
        JSON.stringify({
          error: 'Content flagged as inappropriate',
          details: moderationResult.categories,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Content approved' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in video moderation:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to moderate video' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})