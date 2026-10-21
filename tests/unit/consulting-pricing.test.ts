import {describe,it,expect} from 'vitest';
import {calculateConsultingQuote,HEALTH_CHECKS} from '../../lib/consulting/pricing';

describe('THERASSISTANT consulting pricing',()=>{
 const base={related:true,issueType:'denial' as const};
 it.each([[1,19],[2,39],[3,39],[4,59],[5,59],[6,99],[10,99]])('quotes %i related claims at $%i', (claimCount,expected)=>{
  expect(calculateConsultingQuote({...base,claimCount})?.fee).toBe(expected);
 });
 it('routes 11 or more claims to Health Check selection',()=>{
  expect(calculateConsultingQuote({...base,claimCount:11})?.tier).toBe('package_selection_required');
 });
 it('does not auto-price unrelated claims',()=>{
  expect(calculateConsultingQuote({...base,claimCount:2,related:false})?.fee).toBeNull();
 });
 it('routes credentialing and network cases for scope review',()=>{
  expect(calculateConsultingQuote({claimCount:1,related:true,issueType:'credentialing'})?.fee).toBeNull();
 });
 it('uses advertised package prices and does not claim every affected claim is reviewed',()=>{
  for(const pkg of HEALTH_CHECKS)expect(calculateConsultingQuote({...base,claimCount:25,packageKey:pkg.key})?.fee).toBe(pkg.fee);
 });
 it('rejects invalid claim counts',()=>{
  expect(calculateConsultingQuote({...base,claimCount:0})).toBeNull();
  expect(calculateConsultingQuote({...base,claimCount:1.5})).toBeNull();
 });
});
