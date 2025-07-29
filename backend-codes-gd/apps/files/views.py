from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.http import Http404
from django.core.exceptions import PermissionDenied
from wsgiref.util import FileWrapper
from django.conf import settings
from django.http import HttpResponse
from .models import File
from .serializers import FileSerializer, FileUploadSerializer


class FileListView(generics.ListAPIView):
    """List uploaded files"""
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return File.objects.filter(
            models.Q(uploader=user) | models.Q(is_private=False) |
            models.Q(allowed_users=user)
        )


class FileUploadView(generics.CreateAPIView):
    """Upload new file"""
    serializer_class = FileUploadSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(uploader=self.request.user)


class FileDetailView(generics.RetrieveDestroyAPIView):
    """View or delete a file"""
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        file = File.objects.get(id=self.kwargs['pk'])
        if not file.uploader == self.request.user and file.is_private and not file.allowed_users.filter(id=self.request.user.id).exists():
            raise PermissionDenied("You do not have permission to access this file.")
        return file
    
    def delete(self, request, *args, **kwargs):
        file = self.get_object()
        file.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


def download_file(request, pk):
    """Download file with permission check"""
    try:
        file_obj = File.objects.get(id=pk)
    except File.DoesNotExist:
        raise Http404
    
    if not file_obj.uploader == request.user and file_obj.is_private and not file_obj.allowed_users.filter(id=request.user.id).exists():
        raise PermissionDenied("You do not have permission to access this file.")
    
    file_path = file_obj.file.path
    file_wrapper = FileWrapper(open(file_path, 'rb'))
    response = HttpResponse(file_wrapper, content_type='application/octet-stream')
    response['Content-Disposition'] = f'attachment; filename="{file_obj.name}"'
    return response

