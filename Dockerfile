# Stage 1: 构建文档站
FROM node:20-alpine AS builder
WORKDIR /app

# 先复制 package.json 及 lock 文件，充分利用 Docker 缓存层
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# 复制全部源码并构建（仅运行 docusaurus build，API docs 已预生成并提交，跳过需要内网的 fetch-gateway-spec 步骤）
COPY . .
RUN yarn build

# Stage 2: nginx 服务静态文件 + API 反代
FROM nginx:alpine
RUN apk add --no-cache gettext
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf.template
EXPOSE 80
# 启动时用 envsubst 替换 ${BASE_DOMAIN}，只替换此变量避免干扰 nginx 的 $variable 语法
CMD ["/bin/sh", "-c", "envsubst '${BASE_DOMAIN}' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
