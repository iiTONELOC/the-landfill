import { UserRoles } from '../types';

export interface IJwtPayload {
    username: string;
    email: string;
    role: UserRoles;
}
