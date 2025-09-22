export default function sendResponse(res, statusCode, message, data) {
    data = {
        status: statusCode,
        message: message || (200 <= statusCode && statusCode < 300 ? 'Success' : 'Error'),
        data: data || null,
    }
    return res.status(statusCode).json(data);
}