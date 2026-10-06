// fetch/Headers/Response 垫片：小程序没有 fetch，用 uni.request 模拟给 supabase-js 用。
// （Realtime WebSocket 暂不支持，小程序端靠 15 秒轮询兜底。）

class MPHeaders {
  private map: Record<string, string> = {}
  constructor(init?: Record<string, string>) {
    if (init) {
      for (const k of Object.keys(init)) this.map[k.toLowerCase()] = String(init[k])
    }
  }
  get(k: string): string | null {
    return this.map[k.toLowerCase()] ?? null
  }
  set(k: string, v: string): void {
    this.map[k.toLowerCase()] = v
  }
  has(k: string): boolean {
    return k.toLowerCase() in this.map
  }
  forEach(cb: (v: string, k: string) => void): void {
    for (const [k, v] of Object.entries(this.map)) cb(v, k)
  }
}

class MPResponse {
  readonly ok: boolean
  readonly status: number
  readonly headers: MPHeaders
  private body: string
  constructor(body: string, opts: { status: number; headers: Record<string, string> }) {
    this.body = body
    this.status = opts.status
    this.ok = opts.status >= 200 && opts.status < 300
    this.headers = new MPHeaders(opts.headers)
  }
  async json(): Promise<unknown> {
    return JSON.parse(this.body)
  }
  async text(): Promise<string> {
    return this.body
  }
}

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>

export function installFetch(): void {
  const g = globalThis as unknown as { fetch?: FetchLike; Headers?: unknown; Response?: unknown }
  if (typeof g.fetch !== 'undefined') return
  g.Headers = MPHeaders
  g.Response = MPResponse
  g.fetch = (input, init): Promise<Response> => {
    return new Promise((resolve, reject) => {
      let data: unknown
      if (init?.body) {
        try {
          data = JSON.parse(String(init.body))
        } catch {
          data = String(init.body)
        }
      }
      uni.request({
        url: input,
        // supabase-js 会用到 PATCH：类型联合里没有，运行时支持，强制转换
        method: (init?.method ?? 'GET') as never,
        data: data as never,
        header: (init?.headers ?? {}) as Record<string, string>,
        success: (res) => {
          const headers: Record<string, string> = {}
          if (res.header) {
            for (const k of Object.keys(res.header)) headers[k] = String((res.header as Record<string, unknown>)[k])
          }
          resolve(new MPResponse(typeof res.data === 'string' ? res.data : JSON.stringify(res.data ?? null), {
            status: res.statusCode,
            headers,
          }) as unknown as Response)
        },
        fail: (err) => reject(new Error(err.errMsg || 'request failed')),
      })
    })
  }
}
