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

export class OperationError extends Error {

  constructor(message: string) {
    super(message);
    this.name = "OperationError";
  }
}
