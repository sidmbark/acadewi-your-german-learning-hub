import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ZoomMeetingRequest {
  topic: string;
  start_time: string; // ISO 8601 format
  duration: number; // in minutes
  timezone?: string;
}

async function getZoomAccessToken(): Promise<string> {
  const accountId = Deno.env.get('ZOOM_ACCOUNT_ID');
  const clientId = Deno.env.get('ZOOM_CLIENT_ID');
  const clientSecret = Deno.env.get('ZOOM_CLIENT_SECRET');

  if (!accountId || !clientId || !clientSecret) {
    throw new Error('Missing Zoom credentials');
  }

  const credentials = btoa(`${clientId}:${clientSecret}`);
  
  const response = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Zoom token error:', error);
    throw new Error(`Failed to get Zoom access token: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function createZoomMeeting(accessToken: string, meetingData: ZoomMeetingRequest) {
  const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: meetingData.topic,
      type: 2, // Scheduled meeting
      start_time: meetingData.start_time,
      duration: meetingData.duration,
      timezone: meetingData.timezone || 'Africa/Casablanca',
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        watermark: false,
        audio: 'both',
        auto_recording: 'none',
        waiting_room: true,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Zoom meeting creation error:', error);
    throw new Error(`Failed to create Zoom meeting: ${response.status}`);
  }

  return await response.json();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, start_time, duration } = await req.json();

    if (!topic || !start_time || !duration) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: topic, start_time, duration' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Creating Zoom meeting:', { topic, start_time, duration });

    // Get Zoom access token
    const accessToken = await getZoomAccessToken();

    // Create the meeting
    const meeting = await createZoomMeeting(accessToken, {
      topic,
      start_time,
      duration,
    });

    console.log('Zoom meeting created successfully:', meeting.id);

    return new Response(
      JSON.stringify({
        success: true,
        meeting_id: meeting.id,
        join_url: meeting.join_url,
        start_url: meeting.start_url,
        password: meeting.password,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in create-zoom-meeting function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
