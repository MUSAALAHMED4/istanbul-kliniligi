import zipfile
import os
import tempfile
import uuid

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import EmergencySituation
from .serializers import EmergencySituationSerializer
from django.core.files.uploadedfile import InMemoryUploadedFile
from io import BytesIO
from rest_framework.response import Response


def create_zip(files):
    # Use BytesIO for in-memory ZIP file creation
    zip_buffer = BytesIO()

    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for file in files:
            # Read the content directly
            file_name = file.name
            file_content = file.read()
            
            # Write the content to the zip
            zipf.writestr(file_name, file_content)

    # Move to the beginning of the BytesIO buffer
    zip_buffer.seek(0)

    # Return the in-memory ZIP buffer
    return zip_buffer


class EmergencySituationView(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = EmergencySituation.objects.all()
    serializer_class = EmergencySituationSerializer
    http_method_names = ['get', 'post', 'put']

    def _zip_files_and_prepare_upload(self, files):
        zip_buffer = create_zip(files)

        # Prepare the in-memory file
        zip_name = f"{uuid.uuid4()}.zip"
        zip_file = InMemoryUploadedFile(
            file=zip_buffer,                  # The file object
            field_name='support_documents',   # Field name
            name=zip_name,                    # File name
            content_type='application/zip',   # Content type
            size=zip_buffer.getbuffer().nbytes,  # Size of the file
            charset=None                      # No charset needed
        )

        return zip_file

    def update(self, request, *args, **kwargs):
        _supported_files = request.FILES.getlist('support_documents')

        # Create a zip file if there are uploaded documents
        if _supported_files:
            zip_file = self._zip_files_and_prepare_upload(_supported_files)
        else:
            zip_file = None

        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        request_data = request.data.copy()
        if 'support_documents' in request_data:
            request_data['support_documents'] = zip_file
        serializer = self.get_serializer(instance, data=request_data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        _supported_files = request.FILES.getlist('support_documents')

        # Create a zip file if there are uploaded documents
        if _supported_files:
            zip_file = self._zip_files_and_prepare_upload(_supported_files)
            request.FILES['support_documents'] = zip_file

        return super().create(request, *args, **kwargs)
