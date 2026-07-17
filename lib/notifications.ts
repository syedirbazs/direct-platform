import { supabase } from '@/lib/supabase';

export async function pushNotification(
  userId: string,
  input: {
    type: string;
    title: string;
    body?: string;
    entityType?: string;
    entityId?: string;
  }
) {
  await supabase.from('notifications').insert({
    user_id: userId,
    type: input.type,
    title: input.title,
    body: input.body ?? null,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
  });
}
