/**
 * Formats backend errors into user-friendly English messages.
 * Handles common error patterns from IC agent and backend traps.
 */
export function formatBackendError(error: unknown): string {
  if (!error) {
    return 'An unknown error occurred';
  }

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message;

    // Handle IC agent errors
    if (message.includes('Unauthorized')) {
      return 'You do not have permission to perform this action';
    }

    if (message.includes('Actor not available')) {
      return 'Connection to the backend is not available. Please try again.';
    }

    if (message.includes('User is blocked')) {
      return 'Your account has been blocked and cannot perform this action';
    }

    if (message.includes('Username already taken')) {
      return 'This username is already taken. Please choose another.';
    }

    if (message.includes('Profile already exists')) {
      return 'A profile already exists for this account';
    }

    if (message.includes('Profile does not exist')) {
      return 'Profile not found. Please create a profile first.';
    }

    if (message.includes('User not found')) {
      return 'User not found';
    }

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

    if (message.includes('have not liked')) {
      return 'You have not liked this yet';
    }

    if (message.includes('network')) {
      return 'Network error. Please check your connection and try again.';
    }

    if (message.includes('timeout')) {
      return 'Request timed out. Please try again.';
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
