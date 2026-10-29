import {RequestForm} from '@/components/consulting/request-form';
export default async function NewRequestPage({searchParams}:{searchParams:Promise<{package?:string;error?:string}>}) {
 const p=await searchParams;
 return <RequestForm defaultPackage={p.package??''} error={p.error}/>;
}
