import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);

    // Get the authorization code from the URL
    const code = requestUrl.searchParams.get('code');

    if (code) {
        const cookieStore = cookies();

        // Create Supabase client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                auth: {
                    flowType: 'pkce',
                },
            }
        );

        // Exchange code for session
        await supabase.auth.exchangeCodeForSession(code);
    }

    // Redirect to home page
    return NextResponse.redirect(new URL('/', requestUrl.origin));
}
