class UnauthorizedError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "UnauthorizedError";
  }
}

class ForbiddenError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ForbiddenError";
  }
}

export class WebconsoleApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "WebconsoleApiError";
  }
}

export class OperationError extends Error {

  constructor(message: string) {
    super(message);
    this.name = "OperationError";
  }
}