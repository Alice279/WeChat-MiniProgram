import * as React from "react";
import { createContext, FC, memo, useContext } from "react";
import { auth, Endpoint } from "./api";

export * from "./api";
const DEVICE_TOKEN_KEY = "backend-device-token";

export class BackendContext {
  caller?: (context: BackendContext) => Call;
  storage?: Storage;
  prefix?: string;
  host?: string;
  session?: string;
  deviceToken?: string;

  call<P, R>(endpoint: Endpoint<P, R>, data: P, opt?: CallOpt): Promise<R> {
    return this.caller(this)(endpoint, data, opt);
  }

  setSession(session: string) {
    this.session = session;
  }

  async setDeviceToken(token: string) {
    this.deviceToken = token;
    await this.storage?.set(DEVICE_TOKEN_KEY, token);
  }

  async getSession(): Promise<string | null> {
    console.log(this, this.session);
    if (this.session) {
      return this.session;
    }
    if (!this.deviceToken && this.storage) {
      this.deviceToken =
        (await this.storage.get(DEVICE_TOKEN_KEY)) || undefined;
    }
    if (this.deviceToken) {
      const data = await this.caller!(this)(
        auth.UserService.RefreshSession,
        { deviceToken: this.deviceToken },
        { useSession: false }
      );
      this.session = data.session;
      return this.session;
    }
    return null;
  }
}

const backendContext = createContext<BackendContext>(new BackendContext());
export type CallOpt = { get?: boolean; useSession?: boolean };
export type Call = <P, R>(
  endpoint: Endpoint<P, R>,
  data: P,
  opt?: { get?: boolean; useSession?: boolean }
) => Promise<R>;

export interface Storage {
  set: (key: string, value: string) => Promise<void>;
  get: (key: string) => Promise<string | null>;
}

export interface BackendProps {
  caller: (context: BackendContext) => Call;
  host?: string;
  prefix?: string;
  storage?: Storage;
}

export const Backend: FC<BackendProps> = memo(function Backend(props) {
  const { caller, host, prefix = "/api/", storage } = props;

  const context = new BackendContext();
  context.caller = caller;
  context.prefix = prefix;
  context.host = host;
  context.storage = storage;

  return (
    <backendContext.Provider value={context}>
      {props.children}
    </backendContext.Provider>
  );
});

export function useBackend() {
  const context = useContext(backendContext);
  if (!context) {
    throw "`useBackend` should be used within <Backend>...</Backend>";
  }
  return {
    get context() {
      return context;
    },
    call: context.call.bind(context),
    setDeviceToken(token: string) {
      return context.setDeviceToken(token);
    },
    setSession(session: string) {
      return context.setSession(session);
    },
  };
}
