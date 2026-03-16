import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from '../decorators/roles.decorator'; 

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // If no roles are required for this route, allow access
    if (!requiredRoles) {
      return true;
    }

    // Extract the GraphQL context
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    const user = req.user; // Your GqlAuthGuard should be populating this

    // Check if the user exists and has the required role
    // (Adjust 'user.role' or 'user.roles' based on your actual user entity/JWT payload)
    return requiredRoles.some((role) => user?.role?.includes(role));
  }
}