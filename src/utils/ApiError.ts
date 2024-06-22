class ApiError extends Error {
    statusCode: Number;
    data: any
    success: any
    error: any
    constructor(
        statusCode: number,
        message: any = "something went wrong",
        error: any = [],
        stack: any = ""
    ) {
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.error = error

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { ApiError }