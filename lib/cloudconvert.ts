import CloudConvert from 'cloudconvert'
import { Readable } from 'stream'
import type { CloudConvertJob } from '@/types/cloudconvert'

export function getClient() {
  const key = process.env.CLOUDCONVERT_API_KEY
  if (!key) throw new Error('CloudConvert API key not configured')
  return new CloudConvert(key)
}

export async function createConversionJob(
  file: File,
  outputFormat: string,
): Promise<{ jobId: string; status: string }> {
  const cloudConvert = getClient()
  const buffer = Buffer.from(await file.arrayBuffer())

  const job = await cloudConvert.jobs.create({
    tasks: {
      'upload-file': { operation: 'import/upload' },
      'convert-file': {
        operation: 'convert',
        input: 'upload-file',
        output_format: outputFormat,
      },
      'export-file': {
        operation: 'export/url',
        input: 'convert-file',
      },
    },
  })

  const uploadTask = job.tasks?.find(t => t.name === 'upload-file')
  if (!uploadTask) throw new Error('Upload task not created')

  const stream = Readable.from(buffer)
  await cloudConvert.tasks.upload(uploadTask, stream, file.name, buffer.length)

  return { jobId: job.id, status: job.status ?? 'processing' }
}

export async function getJobStatus(jobId: string) {
  const cloudConvert = getClient()
  const job = (await cloudConvert.jobs.get(jobId)) as CloudConvertJob

  const exportTask = job.tasks?.find(t => t.operation === 'export/url')
  const files = exportTask?.result?.files ?? []

  const convertTask = job.tasks?.find(t => t.operation === 'convert')
  const errorTask = job.tasks?.find(t => t.status === 'error')

  return {
    id: job.id,
    status: job.status,
    files: files.map(f => ({ filename: f.filename, url: f.url, size: f.size })),
    error: errorTask?.message ?? (job.status === 'error' ? convertTask?.message : undefined),
  }
}

export async function waitForJob(jobId: string) {
  const cloudConvert = getClient()
  const job = await cloudConvert.jobs.wait(jobId)
  return getJobStatus(job.id)
}
