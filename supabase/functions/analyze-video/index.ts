import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.1.0'

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
    const { videoUrl, title, description } = await req.json()
    console.log('Received request to analyze video:', { videoUrl, title })

    if (!videoUrl) {
      return new Response(
        JSON.stringify({ error: 'Video URL is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiKey) {
      console.error('GEMINI_API_KEY not configured')
      throw new Error('GEMINI_API_KEY not configured')
    }

    const genAI = new GoogleGenerativeAI(geminiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `Analyze this video content:
    Title: ${title}
    Description: ${description || 'No description provided'}
    Video URL: ${videoUrl}
    
    Please provide:
    1. Main topics or themes
    2. Potential categories
    3. Target audience
    4. Key features or highlights
    
    Format the response as JSON with these fields.`

    console.log('Sending prompt to Gemini:', prompt)
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const analysis = response.text()
    
    console.log('Received analysis from Gemini:', analysis)

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials not configured')
      throw new Error('Supabase credentials not configured')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Update video with analysis
    const { error: updateError } = await supabase
      .from('videos')
      .update({
        ai_analysis: analysis,
        analyzed_at: new Date().toISOString()
      })
      .eq('video_url', videoUrl)

    if (updateError) {
      console.error('Error updating video analysis:', updateError)
      throw updateError
    }

    console.log('Successfully updated video with analysis')

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in video analysis:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze video', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})