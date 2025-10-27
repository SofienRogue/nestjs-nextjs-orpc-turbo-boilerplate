# @workspace/orpc

Shared oRPC contracts for type-safe API communication between the NestJS backend and Next.js frontend.

## Overview

This package provides:
- **Zod schemas** for runtime validation
- **oRPC contracts** defining HTTP routes and types
- **Automatic type inference** for frontend clients
- **Contract-first development** ensuring backend/frontend alignment

## File Upload Pattern

### Multipart/Form-Data Support

oRPC handles file uploads through NestJS interceptors while maintaining type safety:

**Backend Implementation:**
```typescript
@Implement(contract.file.upload)
@UseInterceptors(FileInterceptor('file'))
uploadFile() {
  return implement(contract.file.upload).handler(async ({ context }) => {
    const file = (context as any).request.file;
    return this.filesService.uploadFile(file);
  });
}
```

**Frontend Usage:**
```typescript
// Single file upload
const formData = new FormData();
formData.append('file', fileBlob);
const result = await orpc.file.upload({ file: formData });

// Multiple files
const formData = new FormData();
files.forEach(f => formData.append('files', f));
const results = await orpc.file.uploadMultiple({ files: formData });
```

## Examples

See implementations in:
- `src/contracts/file.contract.ts` - File API contracts
- `apps/backend/src/files/files.controller.ts` - Backend controller
- `apps/web/lib/orpc-client.ts` - Frontend client
