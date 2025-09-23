import sendResponse from "../services/response";

//page not found handler
export default function notFoundHandler(req, res) {
    return sendResponse(res, 404, 'Resource not found');
}