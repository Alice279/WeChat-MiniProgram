import {
  BackendProps,
  Endpoint,
  BackendContext,
  CallOpt,
} from "../shared/backend";

const FetchCaller = (context: BackendContext) => {
  return async <P, R>(
    endpoint: Endpoint<P, R>,
    data: P,
    opt?: CallOpt
  ): Promise<R> => {
    const { get = false, useSession = true } = opt || {};
    const init: RequestInit = { headers: {} };
    if (get) {
      init.method = "GET";
    } else {
      init.method = "POST";
      init.headers["content-type"] = "application/json";
      init.body = JSON.stringify(data);
    }

    if (useSession) {
      init.headers["authorization"] = await context.getSession();
    }

    const resp = await fetch(context.prefix + endpoint, init);
    if (!resp.ok) {
      throw `${resp.status}:${resp.statusText}`;
    }
    const body = await resp.json();
    if (!body.ok) {
      throw body.error;
    }
    return body.data;
  };
};

export default FetchCaller;
