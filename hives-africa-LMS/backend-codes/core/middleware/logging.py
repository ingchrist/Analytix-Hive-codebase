import logging
import time
import uuid
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger('apps')

class RequestLoggingMiddleware(MiddlewareMixin):
    """Log all requests with unique request ID"""
    
    def process_request(self, request):
        request.request_id = str(uuid.uuid4())[:8]
        request.start_time = time.time()
        
        logger.info(f"[{request.request_id}] {request.method} {request.path} - Started")
        return None
    
    def process_response(self, request, response):
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            logger.info(
                f"[{getattr(request, 'request_id', 'unknown')}] "
                f"{request.method} {request.path} - "
                f"Completed {response.status_code} in {duration:.3f}s"
            )
        return response
    
    def process_exception(self, request, exception):
        logger.error(
            f"[{getattr(request, 'request_id', 'unknown')}] "
            f"{request.method} {request.path} - "
            f"Exception: {str(exception)}"
        )
        return None
