'use client';
import { DataError } from '@/components/shared/data-error';
export default function WorkspaceError({reset}:{error:Error&{digest?:string};reset:()=>void}){return <DataError onRetry={reset}/>}
