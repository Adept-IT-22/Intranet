from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            "id",
            "title",
            "category",
            "description",
            "file",
            "file_url",
            "uploaded_by_name",
            "uploaded_at",
        ]
        # ✅ uploaded_by is NOT required in request
        read_only_fields = ["uploaded_by_name", "uploaded_at", "file_url"]

    def get_file_url(self, obj):
        request = self.context.get("request")
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None
        super().perform_create(serializer)
        