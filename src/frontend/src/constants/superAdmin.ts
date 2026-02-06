import type { Principal } from '@icp-sdk/core/principal';

/**
 * Super-admin principal - this user always has admin privileges
 */
export const SUPER_ADMIN_PRINCIPAL = 'xgwt2-7h2p4-m54fq-hruec-r4x4i-nntjq-wdi7h-e2pwa-zmwzr-zhexp-nqe';

/**
 * Check if a principal is the super-admin
 */
export function isSuperAdminPrincipal(principal: Principal | string): boolean {
  const principalString = typeof principal === 'string' ? principal : principal.toString();
  return principalString === SUPER_ADMIN_PRINCIPAL;
}
