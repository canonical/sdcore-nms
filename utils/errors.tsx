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

export class OperationError extends Error {

  constructor(message: string) {
    super(message);
    this.name = "OperationError";
  }
}
