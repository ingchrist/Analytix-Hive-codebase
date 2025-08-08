from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdvancedSearchView, PopularSearchesView, SearchHistoryViewSet,
    SavedSearchViewSet, AutocompleteView
)

router = DefaultRouter()
router.register(r'history', SearchHistoryViewSet, basename='search-history')
router.register(r'saved', SavedSearchViewSet, basename='saved-search')

urlpatterns = [
    # Main search endpoint
    path('', AdvancedSearchView.as_view(), name='advanced-search'),
    
    # Popular searches
    path('popular/', PopularSearchesView.as_view(), name='popular-searches'),
    
    # Autocomplete
    path('autocomplete/', AutocompleteView.as_view(), name='search-autocomplete'),
    
    # Include router URLs
    path('', include(router.urls)),
]
