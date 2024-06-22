
class ApiResponse {
    statusCode: any
    data: any
    success: any
    message: any

    constructor(statusCode: any, data: any, message = "success") {
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}