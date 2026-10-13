import 'server-only';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { classifyDeadline, todayDateOnly } from '@/lib/dates/deadlines';
import type { TaskListItem } from '@/lib/types/workbench';
export async function getTasks():Promise<TaskListItem[]>{const supabase=await createServerSupabaseClient();const {data,error}=await supabase.from('tasks').select('id,provider_id,payer_application_id,description,due_date,is_completed,providers(first_name,last_name),payer_applications(payers(name))').order('due_date');if(error)throw error;const today=todayDateOnly();return(data??[]).map((t:any)=>({id:t.id,providerId:t.provider_id,providerName:`${t.providers?.first_name??''} ${t.providers?.last_name??''}`.trim(),payerApplicationId:t.payer_application_id,payerName:t.payer_applications?.payers?.name??null,description:t.description,dueDate:t.due_date,deadline:classifyDeadline(t.due_date,today),completed:Boolean(t.is_completed)}));}
