class ErrorResponse {
    constructor(code, message,error) {
      this.code = code;
      this.success = message;
      this.reason =error;
    }
  }
  module.exports = ErrorResponse;