from django.urls import path
from . import views

app_name = 'files'

urlpatterns = [
    path('', views.FileListView.as_view(), name='file-list'),
    path('upload/', views.FileUploadView.as_view(), name='file-upload'),
    path('<uuid:pk>/', views.FileDetailView.as_view(), name='file-detail'),
    path('download/<uuid:pk>/', views.download_file, name='file-download'),
]

