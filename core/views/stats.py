from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from core.models import (
    User, Group,Project, Role, AcademicAffiliation,
)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dean_stats(request):
    """
    Get statistics for dean dashboard - direct row counts from database
    """
    try:
        user = request.user
        print(f"Dean Stats - User: {user.id}, {user.username}")

        # Get dean's college ID - try multiple ways
        dean_college_id = None

        # First try direct affiliation
        try:
            dean_affiliation = AcademicAffiliation.objects.get(user=user)
            dean_college_id = dean_affiliation.college_id
            print(f"Dean Stats - College ID from affiliation: {dean_college_id}")
        except AcademicAffiliation.DoesNotExist:
            print(f"Dean Stats - No direct affiliation found for user {user.id}")

        # If no direct college, try to get it from department affiliation
        if not dean_college_id:
            try:
                dept_affiliation = AcademicAffiliation.objects.filter(user=user, department__isnull=False).first()
                if dept_affiliation and dept_affiliation.department:
                    dean_college_id = dept_affiliation.department.college_id
                    print(f"Dean Stats - College ID from department: {dean_college_id}")
            except Exception as e:
                print(f"Dean Stats - Error getting college from department: {e}")

        if not dean_college_id:
            print(f"Dean Stats - No college ID found for dean user {user.id}")
            return Response({"error": "Dean has no college affiliation"}, status=400)

        # Get counts directly from database with proper filtering
        # First, let's check what roles exist
        all_roles = Role.objects.all().values('type', 'role_type')
        print(f"Dean Stats - All roles in DB: {list(all_roles)}")

        students_count = User.objects.filter(
            academicaffiliation__college_id=dean_college_id,
            userroles__role__type__iexact='student'
        ).distinct().count()

        # Try alternative role field if needed
        if students_count == 0:
            students_count = User.objects.filter(
                academicaffiliation__college_id=dean_college_id,
                userroles__role__role_type__iexact='student'
            ).distinct().count()
            if students_count > 0:
                print("Dean Stats - Used role_type field for students")

        projects_count = Project.objects.filter(
            college_id=dean_college_id
        ).count()

        supervisors_count = User.objects.filter(
            academicaffiliation__college_id=dean_college_id,
            userroles__role__type__iexact='supervisor'
        ).distinct().count()

        if supervisors_count == 0:
            supervisors_count = User.objects.filter(
                academicaffiliation__college_id=dean_college_id,
                userroles__role__role_type__iexact='supervisor'
            ).distinct().count()
            if supervisors_count > 0:
                print("Dean Stats - Used role_type field for supervisors")

        co_supervisors_count = User.objects.filter(
            academicaffiliation__college_id=dean_college_id,
            userroles__role__type__iexact='co_supervisor'
        ).distinct().count()

        if co_supervisors_count == 0:
            co_supervisors_count = User.objects.filter(
                academicaffiliation__college_id=dean_college_id,
                userroles__role__role_type__iexact='co_supervisor'
            ).distinct().count()
            if co_supervisors_count > 0:
                print("Dean Stats - Used role_type field for co_supervisors")

        groups_count = Group.objects.filter(
            department__college_id=dean_college_id
        ).distinct().count()

        print(f"Dean Stats - Counts: students={students_count}, projects={projects_count}, supervisors={supervisors_count}, co_supervisors={co_supervisors_count}, groups={groups_count}")

        # For now, pending approvals is 0 until approval system is implemented
        pending_approvals_count = 0

        return Response({
            "projects": projects_count,
            "supervisors": supervisors_count,
            "coSupervisors": co_supervisors_count,
            "groups": groups_count,
            "pendingApprovals": pending_approvals_count,
            "users": students_count
        })

    except Exception as e:
        print(f"Dean Stats - Error: {str(e)}")
        return Response({"error": str(e)}, status=500)

