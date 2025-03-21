import { HTTPStatus } from "@/utils/utils";

export class WebconsoleApiError extends Error {
  status: number;
  statusText: string;

  constructor(status: number, message: string) {
    super(`${status}: ${message}`);
    this.status = status;
    this.statusText = HTTPStatus(status)
    this.name = "WebconsoleApiError";
  }
}

export function is401UnauthorizedError(error: Error | unknown): boolean {
  return (error instanceof WebconsoleApiError && error.status === 401);
}

export function is403ForbiddenError(error: Error | unknown): boolean {
  return (error instanceof WebconsoleApiError && error.status === 403);
}

export function is404NotFoundError(error: Error | unknown): boolean {
  return (error instanceof WebconsoleApiError && error.status === 404);
}

export function is409ConflictError(error: Error | unknown): boolean {
  return (error instanceof WebconsoleApiError && error.status === 409);
}

export class OperationError extends Error {

  constructor(message: string) {
    super(message);
    this.name = "OperationError";
  }
}

export class InvalidDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidDataError";
  }
}
