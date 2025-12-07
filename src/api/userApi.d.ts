declare module '@/api/userApi' {
  export function fetchUsers(): Promise<any[]>
  export function fetchUserById(id: string | number): Promise<any>
  export function createUser(payload: Record<string, any>): Promise<any>
  export function updateUser(id: string | number, payload: Record<string, any>): Promise<any>
  export function deleteUser(id: string | number): Promise<any>
  export function removeUserRole(id: string | number, roleName: string): Promise<any>
}
