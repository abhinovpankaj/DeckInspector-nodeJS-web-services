// {
//     "error": {
//         "code": 500,
//         "message": "No SubProject inserted."
//     }
// }

class ErrorResponse {
    constructor(code, message,error) {
      this.code = code;
      this.message = message;
      this.error =error;
    }    
    
  }
  module.exports = ErrorResponse;
