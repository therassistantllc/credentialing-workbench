import { APP_ROLES } from '@/lib/auth/roles';
import { requireRole } from '@/lib/auth/require-role';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { PermissionDenied } from '@/components/shared/permission-denied';
export default async function WorkspaceLayout({children}:{children:React.ReactNode}){const guard=await requireRole(APP_ROLES);if(!guard.allowed)return <PermissionDenied/>;return <div className="flex min-h-screen"><Sidebar/><div className="min-w-0 flex-1"><Topbar email={guard.email} role={guard.role}/><div className="p-4 md:p-5">{children}</div></div></div>}
