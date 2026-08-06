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

/**
 * 解析鉴权 token：优先取 URL 的 `token` 查询参数，其次取 localStorage 的 `authToken`。
 * 集中在此处统一获取，调用方无需再自行传入 token。
 */
function resolveToken(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  const urlToken = new URLSearchParams(window.location.search).get('token');
  if (urlToken) {
    return urlToken;
  }
  return localStorage.getItem('authToken') || undefined;
}

function buildHeaders(token?: string): Record<string, string> {
  const resolved = token ?? resolveToken();
  return resolved ? { 'access-key': resolved } : {};
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
 * @param token - Optional access token override; if omitted, token is resolved automatically.
 */
export async function markConf(params: MarkConfParams): Promise<MarkConfResponse> {
  const query: Record<string, string | undefined> = {
    task_id: params.taskId,
    status: params.taskStatus,
    work_type: params.taskWorkType,
    access: params.taskAccess,
  };

  const response = await fetch(buildUrl('/tasks/mark-conf', query), {
    headers: buildHeaders(),
  });

  return response.json();
}

export interface BatchCheckServiceParams {
  time: number;
  /** 任务/工单 ID */
  // id: string;
  /** 访问角色 */
  access: number | string;
  /** 标注/作业类型 */
  work_type: number | string;
  /** 状态 */
  status: number | string;
  action: 'pass' | 'deny';
  use_time: number;
  is_package: number;
  /** 数据包 ID（字符串） */
  package_id: string;
  task_key: string;
  spot_check_pack_id: string;
  /** 是否随机，0/1 */
  // is_random: number | string;
  /** 当前包 ID（数值，无引号） */
  // cur_package_id: number;
}

export interface BatchCheckServiceResponse {
  code: string;
  msg?: string;
}

/**
 * 整题批量审核（通过 / 驳回）。
 * 在标注/审核页面点击「整题通过(G)」或「整题驳回(H)」时调用。
 * 以 application/x-www-form-urlencoded 方式发送，body 为 JSON 字符串。
 */
export async function batchCheckService(
  params: BatchCheckServiceParams
): Promise<BatchCheckServiceResponse> {
  const body = JSON.stringify(params);

  const response = await fetch(`${TASK_API_BASE_URL}/tasks/batch-check-service`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
      ...buildHeaders(),
    },
    body,
  });

  return response.json();
}

export const taskApi = {
  baseUrl: TASK_API_BASE_URL,
  markConf,
  batchCheckService,
};

export default taskApi;
