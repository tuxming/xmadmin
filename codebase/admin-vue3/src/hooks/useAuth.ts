import { useUserStore } from '@/store';

export const hasPermission = (requiredPermission: string, permissions: string[]) => {
    if (!permissions || permissions.length === 0) return false;
    if (permissions.includes('*') || permissions.includes('*:*:*')) return true;
    return permissions.includes(requiredPermission);
};

export const useAuth = () => {
    const userStore = useUserStore();

    const has = (requiredPermissions: string | string[]) => {
        const permissions = userStore.permissions || [];
        let isPermitted = false;
        if (typeof requiredPermissions === 'string') {
            isPermitted = hasPermission(requiredPermissions, permissions);
        } else if (Array.isArray(requiredPermissions)) {
            for (let rp of requiredPermissions) {
                isPermitted = hasPermission(rp, permissions);
                if (isPermitted) break;
            }
        }
        return isPermitted;
    }

    const and = (requiredPermissions: string | string[]) => {
        const permissions = userStore.permissions || [];
        let isPermitted = true;
        if (typeof requiredPermissions === 'string') {
            isPermitted = hasPermission(requiredPermissions, permissions);
        } else if (Array.isArray(requiredPermissions)) {
            for (let rp of requiredPermissions) {
                isPermitted = hasPermission(rp, permissions);
                if (!isPermitted) return false;
            }
        }
        return isPermitted;
    }

    return {
        has,
        and,
    }
}