/// Fetch Wrapper for wx miniapp
import { login, request } from "remax/wechat";
import { auth, BackendContext, Endpoint, CallOpt } from ".";

export default (context: BackendContext) => {
  const doCall = async <P, R>(
    endpoint: Endpoint<P, R>,
    data: P,
    opt?: CallOpt
  ): Promise<R> => {
    const { get = false, useSession = true } = opt || {};
    //@ts-ignore: leak type for headers
    const init: WechatMiniprogram.RequestOption = {
      url: (context.host || "") + (context.prefix || "") + endpoint,
      header: {},
    };
    if (get) {
      init.method = "GET";
    } else {
      init.method = "POST";
      init.data = data;
      init.header!["content-type"] = "application/json";
    }
    if (useSession) {
      let session = await context.getSession();
      if (!session) {
        const loginResult = await login();
        const data = await context.call(
          auth.UserService.WechatLogin,
          {
            code: loginResult.code,
          },
          { useSession: false }
        );
        await context.setDeviceToken(data.deviceToken!);
        await context.setSession(data.session!);
        session = data.session!;
      }
      init.header!["authorization"] = session;
    }
    console.log("call", endpoint, "data", data);
    const resp = await request(init);
    if (Math.floor(resp.statusCode / 100) !== 2) {
      throw `${resp.statusCode}:${resp.errMsg}`;
    }
    const body = await resp.data;
    if (!body.ok) {
      throw body.error;
    }
    return body.data;
  };
  return doCall;
};
