from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django.db.models import Q, Count
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
from django.core.paginator import Paginator
from apps.courses.models import Course, Lesson
from django.contrib.auth import get_user_model
from .models import SearchHistory, PopularSearch, SearchIndex, SavedSearch
from .serializers import (
    SearchHistorySerializer, PopularSearchSerializer, SavedSearchSerializer,
    CourseSearchResultSerializer, LessonSearchResultSerializer, 
    UserSearchResultSerializer, SearchRequestSerializer, SearchResponseSerializer,
    AutocompleteSerializer, AutocompleteResponseSerializer
)

User = get_user_model()


class AdvancedSearchView(APIView):
    """Advanced search with filtering and full-text search"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = SearchRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        query = data['query']
        search_type = data['search_type']
        
        # Track search history
        if request.user.is_authenticated:
            SearchHistory.objects.create(
                user=request.user,
                query=query,
                search_type=search_type,
                ip_address=self.get_client_ip(request)
            )
        
        # Increment popular search counter
        PopularSearch.increment_or_create(query)
        
        # Initialize results
        courses = []
        lessons = []
        users = []
        
        # Perform searches based on type
        if search_type in ['all', 'courses']:
            courses = self.search_courses(query, data)
        
        if search_type in ['all', 'lessons']:
            lessons = self.search_lessons(query, data)
        
        if search_type in ['all', 'users']:
            users = self.search_users(query, data)
        
        # Calculate total results
        total_results = len(courses) + len(lessons) + len(users)
        
        # Update search history with results count
        if request.user.is_authenticated:
            SearchHistory.objects.filter(
                user=request.user,
                query=query
            ).update(results_count=total_results)
        
        # Prepare response
        response_data = {
            'courses': CourseSearchResultSerializer(courses, many=True).data,
            'lessons': LessonSearchResultSerializer(lessons, many=True).data,
            'users': UserSearchResultSerializer(users, many=True).data,
            'total_results': total_results,
            'query': query,
            'search_type': search_type,
            'filters_applied': self.get_applied_filters(data)
        }
        
        return Response(SearchResponseSerializer(response_data).data)
    
    def search_courses(self, query, filters):
        """Search courses with filters"""
        queryset = Course.objects.filter(status='published')
        
        # Apply text search
        queryset = queryset.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query) |
            Q(short_description__icontains=query) |
            Q(category__name__icontains=query) |
            Q(instructor__first_name__icontains=query) |
            Q(instructor__last_name__icontains=query)
        )
        
        # Apply filters
        if 'category' in filters:
            queryset = queryset.filter(category_id=filters['category'])
        
        if 'difficulty' in filters:
            queryset = queryset.filter(difficulty=filters['difficulty'])
        
        if 'is_free' in filters:
            queryset = queryset.filter(is_free=filters['is_free'])
        
        if 'min_price' in filters:
            queryset = queryset.filter(price__gte=filters['min_price'])
        
        if 'max_price' in filters:
            queryset = queryset.filter(price__lte=filters['max_price'])
        
        if 'min_rating' in filters:
            queryset = queryset.filter(average_rating__gte=filters['min_rating'])
        
        # Order by relevance and popularity
        queryset = queryset.order_by('-average_rating', '-total_enrollments')
        
        # Pagination
        page = filters.get('page', 1)
        page_size = filters.get('page_size', 20)
        paginator = Paginator(queryset, page_size)
        
        return paginator.page(page).object_list
    
    def search_lessons(self, query, filters):
        """Search lessons"""
        queryset = Lesson.objects.filter(
            is_published=True,
            section__course__status='published'
        )
        
        # Apply text search
        queryset = queryset.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query) |
            Q(section__title__icontains=query) |
            Q(section__course__title__icontains=query)
        )
        
        # Apply course difficulty filter if provided
        if 'difficulty' in filters:
            queryset = queryset.filter(section__course__difficulty=filters['difficulty'])
        
        # Order by course popularity
        queryset = queryset.order_by('-section__course__total_enrollments')
        
        # Pagination
        page = filters.get('page', 1)
        page_size = filters.get('page_size', 20)
        paginator = Paginator(queryset, page_size)
        
        return paginator.page(page).object_list
    
    def search_users(self, query, filters):
        """Search users"""
        queryset = User.objects.filter(is_active=True)
        
        # Apply text search
        queryset = queryset.filter(
            Q(email__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(bio__icontains=query)
        )
        
        # Apply user type filter
        if 'user_type' in filters:
            queryset = queryset.filter(user_type=filters['user_type'])
        
        # Order by join date
        queryset = queryset.order_by('-date_joined')
        
        # Pagination
        page = filters.get('page', 1)
        page_size = filters.get('page_size', 20)
        paginator = Paginator(queryset, page_size)
        
        return paginator.page(page).object_list
    
    def get_applied_filters(self, data):
        """Get list of applied filters"""
        filters = {}
        filter_fields = [
            'category', 'difficulty', 'is_free', 'min_price', 
            'max_price', 'min_rating', 'user_type'
        ]
        
        for field in filter_fields:
            if field in data and data[field] is not None:
                filters[field] = data[field]
        
        return filters
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class PopularSearchesView(generics.ListAPIView):
    """List popular search terms"""
    queryset = PopularSearch.objects.all()[:20]
    serializer_class = PopularSearchSerializer
    permission_classes = [AllowAny]


class SearchHistoryViewSet(viewsets.ModelViewSet):
    """User search history management"""
    serializer_class = SearchHistorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return SearchHistory.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['delete'])
    def clear_history(self, request):
        """Clear user's search history"""
        self.get_queryset().delete()
        return Response({'message': 'Search history cleared'}, status=status.HTTP_204_NO_CONTENT)


class SavedSearchViewSet(viewsets.ModelViewSet):
    """Saved searches management"""
    serializer_class = SavedSearchSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return SavedSearch.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def run_search(self, request, pk=None):
        """Run a saved search"""
        saved_search = self.get_object()
        
        # Prepare search data
        search_data = {
            'query': saved_search.query,
            **saved_search.filters
        }
        
        # Use the main search view
        search_view = AdvancedSearchView()
        search_view.request = request
        return search_view.post(request)


class AutocompleteView(APIView):
    """Search autocomplete suggestions"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = AutocompleteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        query = serializer.validated_data['query']
        limit = serializer.validated_data['limit']
        
        # Get suggestions from various sources
        suggestions = set()
        
        # From course titles
        course_titles = Course.objects.filter(
            status='published',
            title__icontains=query
        ).values_list('title', flat=True)[:limit]
        suggestions.update(course_titles)
        
        # From popular searches
        popular_queries = PopularSearch.objects.filter(
            query__icontains=query
        ).values_list('query', flat=True)[:limit]
        suggestions.update(popular_queries)
        
        # From categories
        from apps.courses.models import Category
        categories = Category.objects.filter(
            name__icontains=query,
            is_active=True
        ).values_list('name', flat=True)[:limit]
        suggestions.update(categories)
        
        # Get top popular searches
        popular_searches = PopularSearch.objects.all()[:5]
        
        response_data = {
            'suggestions': list(suggestions)[:limit],
            'popular_searches': PopularSearchSerializer(popular_searches, many=True).data
        }
        
        return Response(response_data)

