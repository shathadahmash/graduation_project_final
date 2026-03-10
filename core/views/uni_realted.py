from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from core.models import Branch, University
from core.serializers.location import BranchSerializer, UniversitySerializer


