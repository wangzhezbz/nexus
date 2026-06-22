// 本地开发反向代理：把所有服务收到一个端口（默认 8080），模拟生产 nginx，
// 让 SSO cookie 跨产品共享（同源）。零依赖，含 WebSocket（Next HMR）转发。
//
//   /auth/*         -> auth-service   (5100)   中央 SSO
//   /v1/*           -> api-relay 后端 (5000)   OpenAI 兼容计费网关
//   /api-relay/api/* -> api-relay 后端 (5000)  去掉 /api-relay 前缀
//   /api-relay/*    -> api-relay 前端 (3000)   Next basePath=/api-relay
//   /*              -> 门户 portal    (3001)
//
// 用法：node platform/dev-gateway.mjs
import http from "node:http";

const PORT = process.env.GATEWAY_PORT || 8080;
const H = "127.0.0.1";

// [匹配前缀, 目标端口, 要剥掉的前缀(null=不剥)]
const ROUTES = [
  ["/auth", 5100, null],
  ["/v1", 5000, null],
  ["/api-relay/api", 5000, "/api-relay"], // /api-relay/api/me -> 后端 /api/me
  ["/api-relay", 3000, null],             // Next basePath=/api-relay，路径原样
  ["/", 3001, null],
];

function pick(url) {
  for (const [prefix, port, strip] of ROUTES) {
    const hit = prefix === "/" ||
      url === prefix || url.startsWith(prefix + "/");
    if (hit) {
      let path = url;
      if (strip) path = url.slice(strip.length) || "/";
      return { port, path };
    }
  }
  return { port: 3001, path: url };
}

const server = http.createServer((req, res) => {
  const { port, path } = pick(req.url);
  const opts = {
    host: H, port, path, method: req.method,
    headers: { ...req.headers, host: `${H}:${port}` },
  };
  const proxy = http.request(opts, (up) => {
    res.writeHead(up.statusCode || 502, up.headers);
    up.pipe(res);
  });
  proxy.on("error", (e) => {
    res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(`[dev-gateway] 上游 :${port} 不可达 — ${e.code || e.message}`);
  });
  req.pipe(proxy);
});

// WebSocket 升级（Next 热更新依赖）
server.on("upgrade", (req, socket, head) => {
  const { port, path } = pick(req.url);
  const up = http.request({
    host: H, port, path, method: req.method,
    headers: { ...req.headers, host: `${H}:${port}` },
  });
  up.on("upgrade", (upRes, upSocket, upHead) => {
    socket.write(
      `HTTP/1.1 101 Switching Protocols\r\n` +
      Object.entries(upRes.headers)
        .map(([k, v]) => `${k}: ${v}`).join("\r\n") + "\r\n\r\n");
    if (upHead && upHead.length) upSocket.unshift(upHead);
    upSocket.pipe(socket);
    socket.pipe(upSocket);
    upSocket.on("error", () => socket.destroy());
  });
  up.on("error", () => socket.destroy());
  if (head && head.length) up.write(head);
  up.end();
});

server.listen(PORT, () => {
  console.log(`[dev-gateway] http://localhost:${PORT}  ->  门户/产品/SSO/网关 已合并`);
});
