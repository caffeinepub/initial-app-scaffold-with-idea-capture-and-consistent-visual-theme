/**
 * Formats backend errors into user-friendly English messages.
 * Handles common error patterns from IC agent, backend traps, network failures, and initialization errors.
 */
export function formatBackendError(error: unknown): string {
  if (!error) {
    return 'An unknown error occurred';
  }

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message;

    // IC Agent and replica errors
    if (message.includes('Call was rejected') || message.includes('reject code')) {
      return 'The request was rejected by the network. Please try again.';
    }

    if (message.includes('Could not reach the Internet Computer')) {
      return 'Unable to connect to the Internet Computer. Please check your network connection.';
    }

    if (message.includes('Canister not found') || message.includes('canister does not exist')) {
      return 'Backend service not found. The application may be temporarily unavailable.';
    }

    if (message.includes('Canister is stopped') || message.includes('canister is not running')) {
      return 'Backend service is currently stopped. Please try again later.';
    }

    // Authorization and authentication errors
    if (message.includes('Unauthorized') || message.includes('unauthorized')) {
      return 'You do not have permission to perform this action';
    }

    if (message.includes('Actor not available') || message.includes('actor not available')) {
      return 'Connection to the backend is not available. Please try again.';
    }

    if (message.includes('User is blocked')) {
      return 'Your account has been blocked and cannot perform this action';
    }

    // Profile and user errors
    if (message.includes('Username already taken')) {
      return 'This username is already taken. Please choose another.';
    }

    if (message.includes('Profile already exists')) {
      return 'A profile already exists for this account';
    }

    if (message.includes('Profile does not exist') || message.includes('User not found')) {
      return 'Profile not found. Please create a profile first.';
    }

    // Content errors
    if (message.includes('Conversation not found')) {
      return 'Conversation not found';
    }

    if (message.includes('Story not found')) {
      return 'Story not found or no longer available';
    }

    if (message.includes('Story is no longer active')) {
      return 'This story has expired';
    }

    if (message.includes('Post not found')) {
      return 'Post not found or has been removed';
    }

    if (message.includes('already liked')) {
      return 'You have already liked this';
    }

    if (message.includes('have not liked') || message.includes('not liked')) {
      return 'You have not liked this yet';
    }

    // Network and timeout errors
    if (message.includes('network') || message.includes('Network')) {
      return 'Network error. Please check your connection and try again.';
    }

    if (message.includes('timeout') || message.includes('timed out')) {
      return 'Request timed out. Please try again.';
    }

    if (message.includes('fetch failed') || message.includes('Failed to fetch')) {
      return 'Failed to connect to the server. Please check your internet connection.';
    }

    // Initialization errors
    if (message.includes('initialization') || message.includes('initialize')) {
      return 'Failed to initialize the application. Please refresh the page.';
    }

    // Return the original message if no pattern matches
    return message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle objects with message property
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return formatBackendError((error as any).message);
  }

  return 'An unexpected error occurred';
}
