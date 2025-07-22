import uuid
from django.http import HttpResponse
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
import time

class SecurityHeadersMiddleware(MiddlewareMixin):
    """Add security headers to all responses"""
    
    def process_response(self, request, response):
        # Add security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
        
        # Add CSP header
        if not settings.DEBUG:
            csp_policy = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:; "
                "font-src 'self'; "
                "connect-src 'self'; "
                "frame-ancestors 'none';"
            )
            response['Content-Security-Policy'] = csp_policy
        
        return response

class RateLimitingMiddleware(MiddlewareMixin):
    """Basic rate limiting middleware"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.request_counts = {}
        self.window_size = 60  # 1 minute
        self.max_requests = 100  # per minute
        
    def process_request(self, request):
        client_ip = self.get_client_ip(request)
        current_time = time.time()
        
        # Clean old entries
        self.clean_old_entries(current_time)
        
        # Check rate limit
        if client_ip in self.request_counts:
            if len(self.request_counts[client_ip]) >= self.max_requests:
                return HttpResponse(
                    'Rate limit exceeded', 
                    status=429,
                    content_type='text/plain'
                )
        else:
            self.request_counts[client_ip] = []
        
        # Add current request
        self.request_counts[client_ip].append(current_time)
        
        return None
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def clean_old_entries(self, current_time):
        cutoff_time = current_time - self.window_size
        for ip in list(self.request_counts.keys()):
            self.request_counts[ip] = [
                timestamp for timestamp in self.request_counts[ip]
                if timestamp > cutoff_time
            ]
            if not self.request_counts[ip]:
                del self.request_counts[ip]
