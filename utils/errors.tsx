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