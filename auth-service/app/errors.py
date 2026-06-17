from flask import jsonify


class ApiError(Exception):
    def __init__(self, message: str, status: int = 400):
        super().__init__(message)
        self.message = message
        self.status = status


def register_error_handlers(app):
    @app.errorhandler(ApiError)
    def _handle_api_error(err: ApiError):
        return jsonify({"error": err.message}), err.status

    @app.errorhandler(429)
    def _rate_limited(err):
        return jsonify({"error": "too many requests"}), 429
