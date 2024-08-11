import logging
import time

logger = logging.getLogger('gateway')

class LoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log the request
        # logger.info(f"Request: {request.method} {request.get_full_path()} BODY: {request.body}")
        logger.info(f"Request: {request.method} {request.get_full_path()}")
        start_time = time.time()
        response = self.get_response(request)
        duration = time.time() - start_time

        # Log the response
        # logger.info(f"Response: {response.status_code} {response.reason_phrase} ({duration:.2f}s) BODY: {response.content}")
        logger.info(f"Response: {response.status_code} {response.reason_phrase} ({duration:.2f}s)")

        return response
