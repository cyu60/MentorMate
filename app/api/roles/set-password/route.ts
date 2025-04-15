import { createSupabaseClient } from '@/app/utils/supabase/server';
import { NextResponse } from 'next/server';
import * as bcrypt from 'bcrypt';
import { EventRole } from '@/lib/types';

export async function POST(request: Request) {

  // requires ssr supabase client
  const supabase = await createSupabaseClient();

  // Verify user has permission to set password (must be admin or organizer)
  const { data: user } = await supabase.auth.getUser();
  try {
    const { eventId, role, password } = await request.json();
    
    // Input validation
    if (!eventId || !role || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate role is protected
    if (role !== EventRole.Judge && role !== EventRole.Organizer) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    if (!user?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: userRole } = await supabase
      .from('user_event_roles')
      .select('role')
      .eq('user_id', user.user.id)
      .eq('event_id', eventId)
      .single();

    if (!userRole || (userRole.role !== EventRole.Admin && userRole.role !== EventRole.Organizer)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Update or insert password
    const { error } = await supabase
      .from('role_passwords')
      .upsert({
        event_id: eventId,
        role,
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'event_id,role'
      });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to set password' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password set successfully'
    });
  } catch (error) {
    console.error('Error setting role password:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 