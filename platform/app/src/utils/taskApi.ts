/**
 * Task API client for the `/v2` backend.
 *
 * Centralizes the base URL and all task-related endpoints so that new
 * endpoints can be added here instead of being hard-coded across the app.
 */

const TASK_API_BASE_URL = 'http://192.168.50.211:8080/v2';

function buildUrl(path: string, params?: Record<string, string | undefined>): string {
  const url = new URL(`${TASK_API_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    });
  }
  return url.toString();
}

function buildHeaders(token?: string): Record<string, string> {
  return token ? { 'access-key': token } : {};
}

export interface MarkConfParams {
  taskId?: string;
  taskStatus?: string;
  taskWorkType?: string;
  taskAccess?: string;
}

export interface MarkConfResponse {
  data?: {
    dicom_config?: unknown;
  };
}

/**
 * Marks a task as confirmed (/v2/tasks/mark-conf).
 * @param params - The query parameters for the request.
 * @param token - Optional access token for the `access-key` header.
 */
export async function markConf(params: MarkConfParams, token?: string): Promise<MarkConfResponse> {
  const query: Record<string, string | undefined> = {
    task_id: params.taskId,
    status: params.taskStatus,
    work_type: params.taskWorkType,
    access: params.taskAccess,
  };

  const response = await fetch(buildUrl('/tasks/mark-conf', query), {
    headers: buildHeaders(token),
  });

  return response.json();
}

export const taskApi = {
  baseUrl: TASK_API_BASE_URL,
  markConf,
};

export default taskApi;
