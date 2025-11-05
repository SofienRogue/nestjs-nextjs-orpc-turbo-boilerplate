# File Upload Documentation

This guide covers the file upload functionality in the application, including API endpoints, storage configuration, and client-side implementation.

## Table of Contents

- [Overview](#overview)
- [API Endpoints](#api-endpoints)
- [Storage Configuration](#storage-configuration)
- [File Validation](#file-validation)
- [Client-Side Implementation](#client-side-implementation)
- [Error Handling](#error-handling)
- [Configuration](#configuration)

## Overview

The file upload system uses oRPC contracts for type-safe API communication and supports multiple storage backends. Currently configured to use MinIO for cloud storage with local storage as fallback.

**Key Features:**
- Single and multiple file uploads
- File type validation
- Size limits and constraints
- Presigned URL generation
- Full CRUD operations (Create, Read, Update, Delete)
- Pagination for file listings

## API Endpoints

All file operations are available through oRPC contracts. The base path is `/v1/files`.

### File Schema

```typescript
interface File {
  id: string;        // UUID
  path: string;      // File URL or path
  mimeType: string;  // MIME type (e.g., "image/jpeg")
}
```

### List Files

**Endpoint:** `GET /v1/files`

**Description:** Retrieve paginated list of uploaded files.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `sortBy` (optional): Sort fields as array
- `filter` (optional): Filter criteria as object

**Response:**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "path": "https://minio.example.com/bucket/file.jpg",
      "mimeType": "image/jpeg"
    }
  ],
  "meta": {
    "totalItems": 25,
    "itemCount": 10,
    "itemsPerPage": 10,
    "totalPages": 3,
    "currentPage": 1
  },
  "links": {
    "first": "/v1/files?page=1",
    "current": "/v1/files?page=1",
    "next": "/v1/files?page=2",
    "last": "/v1/files?page=3"
  }
}
```

### Get Single File

**Endpoint:** `GET /v1/files/{id}`

**Description:** Retrieve a specific file by its UUID.

**Path Parameters:**
- `id`: File UUID

**Response:** File object or null if not found

### Upload Single File

**Endpoint:** `POST /v1/files/upload`

**Description:** Upload a single file using multipart/form-data.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with `file` field

**Response:** Created File object

### Upload Multiple Files

**Endpoint:** `POST /v1/files/upload-multiple`

**Description:** Upload up to 10 files simultaneously.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with `files` field (array)

**Response:** Array of created File objects

### Update File

**Endpoint:** `PUT /v1/files/{id}`

**Description:** Replace an existing file with a new version.

**Path Parameters:**
- `id`: File UUID to update

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with `file` field

**Response:** Updated File object

### Delete File

**Endpoint:** `DELETE /v1/files/{id}`

**Description:** Delete a file by its UUID.

**Path Parameters:**
- `id`: File UUID to delete

**Response:**
```json
{
  "affected": 1,
  "raw": "..."
}
```

### Get Presigned URL

**Endpoint:** `GET /v1/files/presigned/{type}`

**Description:** Generate a presigned URL for direct upload to storage.

**Path Parameters:**
- `type`: File type or extension (e.g., "jpg", "pdf")

**Response:**
```json
{
  "presignedUrl": "https://minio.example.com/bucket/upload/...",
  "fileName": "generated-filename.jpg"
}
```

## Storage Configuration

The application supports multiple storage backends controlled by the `FILE_DRIVER` environment variable.

### MinIO Configuration

MinIO is the default storage backend for production use.

**Required Environment Variables:**
```bash
# MinIO Connection
FILE_MINIO_ENDPOINT=minio.example.com
FILE_MINIO_PORT=9000
FILE_MINIO_USE_SSL=true
FILE_ACCESS_KEY_ID=your-access-key
FILE_SECRET_ACCESS_KEY=your-secret-key
FILE_MINIO_DEFAULT_BUCKET=my-bucket

# Storage Driver
FILE_DRIVER=minio
```

### Local Storage Configuration

For development or when MinIO is unavailable.

**Environment Variables:**
```bash
# Local Storage
FILE_DRIVER=local
APP_BACKEND_DOMAIN=http://localhost:3001
APP_API_PREFIX=api
```

### MinIO Setup

1. **Install MinIO:**
```bash
# Using Docker
docker run -p 9000:9000 -p 9090:9090 \
  -v ~/minio/data:/data \
  -e "MINIO_ACCESS_KEY=your-access-key" \
  -e "MINIO_SECRET_KEY=your-secret-key" \
  minio/minio server /data --console-address ":9090"
```

2. **Create Bucket:**
```bash
# Using MinIO client (mc)
mc alias set local http://localhost:9000 your-access-key your-secret-key
mc mb local/my-bucket
mc policy set public local/my-bucket
```

3. **Access Console:**
   - Web UI: http://localhost:9090
   - API: http://localhost:9000

## File Validation

The system enforces several validation rules to ensure file integrity and security.

### File Type Validation

**Allowed MIME Types:**
- Images: `image/*` (jpeg, png, gif, webp)
- Documents: `application/pdf`, `text/plain`
- Archives: `application/zip`, `application/x-rar-compressed`

**Custom Validation:**
Files are validated using NestJS pipes and custom decorators. Invalid files return HTTP 400 with detailed error messages.

### Size Limits

**Single File Limits:**
- Maximum size: 10MB per file
- Multiple upload: Maximum 10 files per request

**Configuration:**
```typescript
// In multer configuration
limits: {
  fileSize: 10 * 1024 * 1024, // 10MB
  files: 10 // Max 10 files
}
```

### Security Considerations

- **File Name Sanitization:** Original filenames are processed to prevent path traversal attacks
- **Content-Type Verification:** MIME type is verified against file content
- **Virus Scanning:** Consider integrating antivirus scanning for production
- **Storage Quotas:** Implement user/file size limits for production use

## Client-Side Implementation

### Using oRPC Client

The frontend uses type-safe oRPC client for file operations.

**Setup:**
```typescript
import { orpc } from '@/lib/orpc-client';

// orpc is configured with file contracts
```

**Upload Single File:**
```typescript
const uploadFile = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const result = await orpc.file.upload(formData);
    console.log('Uploaded file:', result);

    return result;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};
```

**Upload Multiple Files:**
```typescript
const uploadMultipleFiles = async (files: FileList) => {
  try {
    const formData = new FormData();

    Array.from(files).forEach((file, index) => {
      formData.append('files', file);
    });

    const results = await orpc.file.uploadMultiple(formData);
    console.log('Uploaded files:', results);

    return results;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};
```

**List Files with Pagination:**
```typescript
const loadFiles = async (page = 1, limit = 10) => {
  try {
    const result = await orpc.file.list({
      page,
      limit
    });

    console.log('Files:', result.data);
    console.log('Pagination:', result.meta);

    return result;
  } catch (error) {
    console.error('Failed to load files:', error);
    throw error;
  }
};
```

**Delete File:**
```typescript
const deleteFile = async (fileId: string) => {
  try {
    const result = await orpc.file.delete({ id: fileId });
    console.log('Delete result:', result);
    return result;
  } catch (error) {
    console.error('Delete failed:', error);
    throw error;
  }
};
```

### React Component Example

```tsx
import React, { useState, useCallback } from 'react';
import { orpc } from '@/lib/orpc-client';

interface FileUploadProps {
  onUploadComplete?: (file: File) => void;
  accept?: string;
  maxSize?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  accept = "image/*",
  maxSize = 10 * 1024 * 1024 // 10MB
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize) {
      setError(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await orpc.file.upload(formData);
      onUploadComplete?.(result);
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  }, [maxSize, onUploadComplete]);

  return (
    <div className="file-upload">
      <input
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        disabled={uploading}
      />
      {uploading && <div>Uploading...</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
};
```

### Using Presigned URLs

For large files or direct uploads:

```typescript
const getPresignedUrl = async (fileType: string) => {
  try {
    const result = await orpc.file.getPresignedUrl({ type: fileType });
    return result;
  } catch (error) {
    console.error('Failed to get presigned URL:', error);
    throw error;
  }
};

// Then upload directly to the presigned URL
const uploadToPresignedUrl = async (presignedUrl: string, file: File) => {
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  if (!response.ok) {
    throw new Error('Upload to presigned URL failed');
  }
};
```

## Error Handling

### Common Error Scenarios

**File Too Large:**
```json
{
  "statusCode": 400,
  "message": "File too large",
  "error": "Bad Request"
}
```

**Invalid File Type:**
```json
{
  "statusCode": 400,
  "message": "Invalid file type",
  "error": "Bad Request"
}
```

**Storage Unavailable:**
```json
{
  "statusCode": 503,
  "message": "Storage service unavailable",
  "error": "Service Unavailable"
}
```

**File Not Found:**
```json
{
  "statusCode": 404,
  "message": "File not found",
  "error": "Not Found"
}
```

### Error Handling Best Practices

```typescript
const handleFileOperation = async () => {
  try {
    const result = await orpc.file.upload(formData);
    return result;
  } catch (error: any) {
    switch (error.statusCode) {
      case 400:
        // Validation error - show user-friendly message
        showToast('Invalid file. Please check size and type requirements.');
        break;
      case 413:
        // Payload too large
        showToast('File is too large. Maximum size is 10MB.');
        break;
      case 503:
        // Storage unavailable
        showToast('Upload service temporarily unavailable. Please try again later.');
        break;
      default:
        // Generic error
        showToast('Upload failed. Please try again.');
        console.error('Upload error:', error);
    }
    throw error;
  }
};
```

## Configuration

### Environment Variables

**Storage Configuration:**
```bash
# Driver selection
FILE_DRIVER=minio  # or 'local'

# MinIO settings
FILE_MINIO_ENDPOINT=minio.example.com
FILE_MINIO_PORT=9000
FILE_MINIO_USE_SSL=true
FILE_ACCESS_KEY_ID=your-access-key
FILE_SECRET_ACCESS_KEY=your-secret-key
FILE_MINIO_DEFAULT_BUCKET=my-bucket

# Local storage settings
APP_BACKEND_DOMAIN=http://localhost:3001
APP_API_PREFIX=api
```

### File Upload Limits

**Global Configuration:**
```typescript
// In files.module.ts or config
const fileConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFilesCount: 10,
  allowedMimeTypes: ['image/*', 'application/pdf'],
};
```

### Multer Configuration

**Custom Multer Options:**
```typescript
// In files.controller.ts or service
const multerOptions = {
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 10,
  },
  fileFilter: (req, file, callback) => {
    // Custom file filtering logic
    if (allowedMimeTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Invalid file type'), false);
    }
  },
};
```

### Troubleshooting

**Common Issues:**

1. **MinIO Connection Failed**
   - Check `FILE_MINIO_ENDPOINT` and port settings
   - Verify access keys are correct
   - Ensure MinIO service is running

2. **File Upload Timeout**
   - Increase timeout settings in client
   - Check network connectivity
   - Verify file size is within limits

3. **Invalid File Type Errors**
   - Check `accept` attribute in file input
   - Verify MIME type validation logic
   - Ensure file extensions match content

4. **CORS Issues**
   - Configure CORS in backend for file upload endpoints
   - Check `trustedOrigins` in auth configuration

**Note:** For applications requiring user authentication for file uploads, see the [Better Auth Documentation](../better-auth.md) for implementing user authentication and session management.

Previous: [Better Auth](better-auth.md)

Next: [ORPC](orpc.md)
