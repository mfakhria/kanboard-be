import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export function isServerlessRuntime() {
  return Boolean(
    process.env.VERCEL
    || process.env.LAMBDA_TASK_ROOT
    || process.env.AWS_LAMBDA_FUNCTION_NAME,
  );
}

export function getUploadsRootPath() {
  return isServerlessRuntime()
    ? join('/tmp', 'uploads')
    : join(process.cwd(), 'uploads');
}

export function ensureUploadsRootPath() {
  const uploadsPath = getUploadsRootPath();

  if (!existsSync(uploadsPath)) {
    mkdirSync(uploadsPath, { recursive: true });
  }

  return uploadsPath;
}

export function ensureTaskAttachmentsPath() {
  const destination = join(ensureUploadsRootPath(), 'task-attachments');

  if (!existsSync(destination)) {
    mkdirSync(destination, { recursive: true });
  }

  return destination;
}

export function getTaskAttachmentFilePath(fileName: string) {
  return join(ensureTaskAttachmentsPath(), fileName);
}
