import { UserRole, type PublicUserProfile, VerificationState } from '../backend';
import { isSuperAdminPrincipal } from '../constants/superAdmin';

export type VerifiedBadgeVariant = 'blue' | 'orange' | 'red';

export function getVerifiedBadgeVariant(
  profile: PublicUserProfile | null | undefined
): VerifiedBadgeVariant | null {
  if (!profile) return null;

  // Super-admin always gets red badge (highest priority)
  if (isSuperAdminPrincipal(profile.id)) {
    return 'red';
  }

  // Admin role gets red badge (second priority)
  if (profile.role === UserRole.admin) {
    return 'red';
  }

  // Check verification state from backend
  if (profile.verified === VerificationState.adminOnlyRedCheck) {
    return 'red';
  }

  if (profile.verified === VerificationState.orangeTick) {
    return 'orange';
  }

  if (profile.verified === VerificationState.blueCheck) {
    return 'blue';
  }

  return null;
}
