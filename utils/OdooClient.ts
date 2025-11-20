interface OdooConfig {
  url: string;
  db: string;
  username: string;
  password: string;
}

interface OdooSession {
  uid: number;
  session_id: string;
  partner_id: number;
}

class OdooClient {
  private config: OdooConfig;
  private session: OdooSession | null = null;
  private requestId = 0;
  private cookies: string = "";

  constructor(config: OdooConfig) {
    this.config = config;
  }

  private async jsonRpc(endpoint: string, params: any) {
    this.requestId++;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Include cookies if we have them
    if (this.cookies) {
      headers["Cookie"] = this.cookies;
    }

    const response = await fetch(`${this.config.url}${endpoint}`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "call",
        params: params,
        id: this.requestId,
      }),
    });

    // Store cookies from response
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      this.cookies = setCookie;
    }

    if (!response.ok) {
      const text = await response.text();
      console.error("Response error:", text.substring(0, 500));
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(
        data.error.data?.message || data.error.message || "Odoo error"
      );
    }

    return data.result;
  }

  async authenticate(): Promise<number> {
    try {
      console.log(
        "🔑 Authenticating with Odoo...",
        this.config.db,
        this.config.username,
        this.config.password
      );

      const result = await this.jsonRpc("/web/session/authenticate", {
        db: this.config.db,
        login: this.config.username,
        password: this.config.password,
      });

      this.session = {
        uid: result.uid,
        session_id: result.session_id,
        partner_id: result.partner_id,
      };

      console.log("✅ Authenticated! UID:", this.session.uid);
      return this.session.uid;
    } catch (err: any) {
      console.error("❌ Authentication failed:", err.message);
      throw err;
    }
  }

  async call(
    model: string,
    method: string,
    args: any[] = [],
    kwargs: any = {}
  ): Promise<any> {
    if (!this.session) {
      throw new Error("Not authenticated. Call authenticate() first.");
    }

    return this.jsonRpc("/web/dataset/call_kw", {
      model: model,
      method: method,
      args: args,
      kwargs: kwargs,
    });
  }

  async searchRead(
    model: string,
    domain: any[] = [],
    fields: string[] = [],
    limit?: number,
    offset?: number
  ): Promise<any[]> {
    return this.call(model, "search_read", [], {
      domain: domain,
      fields: fields,
      limit: limit,
      offset: offset,
    });
  }

  async search(
    model: string,
    domain: any[] = [],
    limit?: number,
    offset?: number
  ): Promise<number[]> {
    return this.call(model, "search", [domain], {
      limit: limit,
      offset: offset,
    });
  }

  async read(
    model: string,
    ids: number[],
    fields: string[] = []
  ): Promise<any[]> {
    return this.call(model, "read", [ids], {
      fields: fields,
    });
  }

  async create(model: string, values: any): Promise<number> {
    return this.call(model, "create", [values]);
  }

  async write(model: string, ids: number[], values: any): Promise<boolean> {
    return this.call(model, "write", [ids, values]);
  }

  async unlink(model: string, ids: number[]): Promise<boolean> {
    return this.call(model, "unlink", [ids]);
  }

  getSession(): OdooSession | null {
    return this.session;
  }
}

export default OdooClient;
