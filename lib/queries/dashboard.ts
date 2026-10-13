import 'server-only';
import { getProviders } from './providers';
import { getApplications } from './applications';
import { getTasks } from './tasks';
import { classifyDeadline, todayDateOnly } from '@/lib/dates/deadlines';
import type { DashboardSummary, PriorityWorkItem } from '@/lib/types/workbench';

const urgent = new Set(['overdue','critical','warning']);
const rank:Record<string,number>={overdue:0,critical:1,warning:2,upcoming:3,normal:4,none:5};
export async function getDashboardSummary():Promise<DashboardSummary>{
  const [providers,applications,tasks]=await Promise.all([getProviders(),getApplications(),getTasks()]);
  const today=todayDateOnly();
  const taskItems:PriorityWorkItem[]=tasks.filter(t=>!t.completed).map(t=>({id:t.id,providerId:t.providerId,providerName:t.providerName,type:'Task',description:t.description,payerName:t.payerName,status:t.deadline==='overdue'?'Overdue':'Open',date:t.dueDate,deadline:t.deadline,href:`/tasks?provider=${t.providerId}`}));
  const credentialItems:PriorityWorkItem[]=providers.flatMap(provider=>provider.credentialDeadlines.map((item,index)=>({id:`credential-${provider.id}-${index}`,providerId:provider.id,providerName:provider.name,type:'Credential',description:item.type,payerName:null,status:item.state==='overdue'?'Expired':'Expiring',date:item.date,deadline:item.state,href:`/providers/${provider.id}?tab=credentials`})));
  const caqhItems:PriorityWorkItem[]=providers.filter(p=>p.caqhNextAttestationDate).map(p=>({id:`caqh-${p.id}`,providerId:p.id,providerName:p.name,type:'CAQH',description:'CAQH attestation due',payerName:null,status:'Due',date:p.caqhNextAttestationDate,deadline:classifyDeadline(p.caqhNextAttestationDate,today),href:`/providers/${p.id}?tab=credentials`}));
  const recredItems:PriorityWorkItem[]=applications.filter(a=>a.recredDueDate).map(a=>({id:`recred-${a.id}`,providerId:a.providerId,providerName:a.providerName,type:'Recredentialing',description:'Payer recredentialing due',payerName:a.payerName,status:a.status,date:a.recredDueDate,deadline:classifyDeadline(a.recredDueDate,today),href:`/applications/${a.id}`}));
  const recred=applications.filter(a=>urgent.has(classifyDeadline(a.recredDueDate,today)));
  const all=[...taskItems,...credentialItems,...caqhItems,...recredItems];
  const priority=all.filter(x=>urgent.has(x.deadline)).sort((a,b)=>(rank[a.deadline]-rank[b.deadline])||((a.date??'9999').localeCompare(b.date??'9999'))).slice(0,12);
  const upcoming=all.filter(x=>x.deadline==='upcoming'||x.deadline==='warning').sort((a,b)=>(a.date??'9999').localeCompare(b.date??'9999')).slice(0,8);
  return {kpis:{activeProviders:providers.filter(p=>p.status==='Active').length,applicationsInProgress:applications.filter(a=>!['Complete','Denied','Withdrawn'].includes(a.status)).length,waitingOnPayer:applications.filter(a=>['Submitted','Pending','Payer Review'].includes(a.status)).length,recredentialingDue:recred.length,credentialsExpiring:credentialItems.filter(x=>urgent.has(x.deadline)).length,caqhAttestationsDue:caqhItems.filter(x=>urgent.has(x.deadline)).length,openTasks:tasks.filter(t=>!t.completed).length},priority,upcoming};
}
