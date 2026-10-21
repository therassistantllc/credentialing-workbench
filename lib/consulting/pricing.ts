export const CLAIM_BANDS = [
  { min: 1, max: 1, fee: 19, label: 'Single-Claim Review' },
  { min: 2, max: 3, fee: 39, label: 'Small Claim Review' },
  { min: 4, max: 5, fee: 59, label: 'Multiple-Claim Review' },
  { min: 6, max: 10, fee: 99, label: 'Extended Claim Review' },
] as const;

export const HEALTH_CHECKS = [
  { key: 'ten_denial', name: '10-Denial Health Check', fee: 395, detail: 'Detailed review of up to 10 selected denials.' },
  { key: 'recoupment', name: 'Overpayment & Recoupment Review', fee: 395, detail: 'Investigate disputed payer takebacks and repayment notices within the agreed scope.' },
  { key: 'enrollment', name: 'Credentialing & Enrollment Failure Analysis', fee: 495, detail: 'Investigate payer enrollment and effective-date problems.' },
  { key: 'roster', name: 'Payer Network & Roster Health Check', fee: 595, detail: 'Review network participation and provider roster discrepancies.' },
  { key: 'comprehensive', name: 'Comprehensive RCM Health Check', fee: 995, detail: 'Defined assessment of selected revenue cycle risks.' },
] as const;

export type IssueType = 'denial' | 'rejection' | 'network' | 'payment' | 'credentialing' | 'other';
export function calculateConsultingQuote(input: {claimCount: number; related: boolean; issueType: IssueType; packageKey?: string}) {
  const {claimCount,related,issueType,packageKey} = input;
  if (!Number.isInteger(claimCount) || claimCount < 1 || claimCount > 100000) return null;
  if (claimCount > 10 || packageKey) {
    const pkg = HEALTH_CHECKS.find(item => item.key === packageKey);
    if (!pkg) return {serviceType:'health_check' as const,tier:'package_selection_required',fee:null,packageKey:null};
    return {serviceType:'health_check' as const,tier:pkg.key,fee:pkg.fee,packageKey:pkg.key};
  }
  if (!related || ['network','credentialing'].includes(issueType)) {
    return {serviceType:'claim_review' as const,tier:'manual_scope_review',fee:null,packageKey:null};
  }
  const band=CLAIM_BANDS.find(b=>claimCount>=b.min && claimCount<=b.max);
  return band ? {serviceType:'claim_review' as const,tier:band.label,fee:band.fee,packageKey:null} : null;
}
