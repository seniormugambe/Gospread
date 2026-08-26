from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsPastorOwnerOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        # Allow safe methods for everyone; non-safe methods are allowed for any authenticated user.
        return request.method in SAFE_METHODS or request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        church = obj if obj.__class__.__name__ == "Church" else obj.church
        return church.owner_id == request.user.id


class IsOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user_id == request.user.id

