import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const WorkspaceId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string | undefined => {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    return (
      req.workspaceId ||
      req.headers?.['x-workspace-id'] ||
      req.body?.variables?.workspaceId
    );
  },
);
