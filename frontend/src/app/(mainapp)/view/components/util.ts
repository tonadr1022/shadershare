import { EmptyResult, Result } from "@/types/shader";

function createErrorResult<T>(message?: string, data?: T): Result<T> {
  return { error: true, message, data };
}
function createEmptyResult(message?: string): EmptyResult {
  return { error: message !== undefined, message };
}
function createSuccessResult<T>(data: T): Result<T> {
  return { error: false, data };
}

export { createEmptyResult, createErrorResult, createSuccessResult };
