import { type backendInterface } from '../backend';

/**
 * Type augmentation for backend actor to include access control initialization method.
 * This method is used by the authorization component during actor setup.
 */
declare module '../backend' {
  interface backendInterface {
    /**
     * Initializes the access control system with the admin secret token.
     * Called automatically during actor initialization in useActor hook.
     * @param secret - The admin secret token from URL parameters
     */
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
  }
}
