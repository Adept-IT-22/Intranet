from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Innovation, InnovationVote
from .serializers import InnovationSerializer
from django.db import IntegrityError

class InnovationViewSet(viewsets.ModelViewSet):
    serializer_class = InnovationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Return all innovations, sorted by upvotes (highest first)
        return Innovation.objects.all().order_by('-upvotes_count', '-created_at')
    
    def get_serializer_context(self):
        """Add request to serializer context for has_upvoted check"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        # Anyone can create an innovation
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def upvote(self, request, pk=None):
        """Upvote an innovation (one vote per user)"""
        innovation = self.get_object()
        user = request.user
        
        # Check if user already voted
        existing_vote = InnovationVote.objects.filter(
            innovation=innovation,
            user=user
        ).first()
        
        if existing_vote:
            return Response(
                {"error": "You have already upvoted this innovation"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create vote
        try:
            InnovationVote.objects.create(
                innovation=innovation,
                user=user
            )
            # Update upvotes count
            innovation.upvotes_count += 1
            innovation.save(update_fields=['upvotes_count'])
            
            serializer = self.get_serializer(innovation)
            return Response(serializer.data)
        except IntegrityError:
            return Response(
                {"error": "You have already upvoted this innovation"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def remove_upvote(self, request, pk=None):
        """Remove upvote (if user wants to undo)"""
        innovation = self.get_object()
        user = request.user
        
        vote = InnovationVote.objects.filter(
            innovation=innovation,
            user=user
        ).first()
        
        if not vote:
            return Response(
                {"error": "You haven't upvoted this innovation"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        vote.delete()
        # Update upvotes count
        innovation.upvotes_count = max(0, innovation.upvotes_count - 1)
        innovation.save(update_fields=['upvotes_count'])
        
        serializer = self.get_serializer(innovation)
        return Response(serializer.data)
