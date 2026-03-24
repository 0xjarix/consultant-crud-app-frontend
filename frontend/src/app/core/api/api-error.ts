import { HttpErrorResponse } from '@angular/common/http';

export interface ApiError {
  status: number;
  message: string;
  fieldErrors: Record<string, string> | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getDefaultMessage(status: number): string {
  if (status === 400) {
    return 'Please review the highlighted fields and try again.';
  }

  if (status === 404) {
    return 'The requested consultant was not found.';
  }

  if (status === 409) {
    return 'A consultant with this email already exists.';
  }

  if (status >= 500) {
    return 'A server error occurred. Please try again in a moment.';
  }

  return 'Something went wrong. Please try again.';
}

function extractFieldErrors(payload: Record<string, unknown>): Record<string, string> | null {
  const fieldErrors: Record<string, string> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (key === 'error') {
      continue;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      fieldErrors[key] = value;
    }
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
}

export function normalizeApiError(error: unknown): ApiError {
  if (!(error instanceof HttpErrorResponse)) {
    return {
      status: 0,
      message: 'Unable to process the request. Please try again.',
      fieldErrors: null
    };
  }

  if (error.status === 0) {
    return {
      status: 0,
      message: 'Unable to reach the API. Make sure the backend is running on port 8080.',
      fieldErrors: null
    };
  }

  const payload = error.error;

  if (typeof payload === 'string' && payload.trim().length > 0) {
    return {
      status: error.status,
      message: payload,
      fieldErrors: null
    };
  }

  if (isRecord(payload)) {
    const fieldErrors = extractFieldErrors(payload);
    const errorMessage = payload['error'];

    return {
      status: error.status,
      message:
        typeof errorMessage === 'string' && errorMessage.trim().length > 0
          ? errorMessage
          : fieldErrors
            ? 'Please review the highlighted fields and try again.'
            : getDefaultMessage(error.status),
      fieldErrors
    };
  }

  return {
    status: error.status,
    message: getDefaultMessage(error.status),
    fieldErrors: null
  };
}
