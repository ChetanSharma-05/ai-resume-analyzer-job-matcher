from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    """Allows access only to users whose role is 'admin'."""

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            getattr(request.user, 'role', None) == 'admin'
        )


class IsOwnerOrAdmin(BasePermission):
    """Object-level permission: only the owner of a record or an admin can access it."""

    def has_object_permission(self, request, view, obj):
        if getattr(request.user, 'role', None) == 'admin':
            return True
        owner = getattr(obj, 'user', None)
        return owner == request.user
