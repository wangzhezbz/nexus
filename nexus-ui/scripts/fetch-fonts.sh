#!/usr/bin/env bash
# 自托管字体抓取（可复现）：把 Google Fonts 的 woff2 拉到 nexus-ui/src/fonts/，
# 并生成 src/fonts.css 的 @font-face。开发机执行一次、产物提交进库；
# 生产/CI 离线构建直接用提交的 woff2，不再连 Google。
#
# 用法： bash platform/nexus-ui/scripts/fetch-fonts.sh
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)"        # nexus-ui/
FONTS="$DIR/src/fonts"; mkdir -p "$FONTS"
CSS="$DIR/src/fonts.css"
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'

# 马善政（笔触/装饰 CJK）只用到少量汉字 → 用 &text= 取字形子集（极小）。
# 若某产品在 .brush/.title-cn 用到下表之外的汉字，把它加进来重跑本脚本。
BRUSH_TEXT='山海AI聊天工具作流每日热榜中转写翻译总结绘图模型对话框接入程序余额充值令牌价格控制台登录注册免费开始文档接口按量计费透明国产海外统一网关账号一键把难搞的活做成就能用不学搭建流程填几个空结果直接拿走视频成片商品数字人口播主图生成小红书种草笔记脚本朋友圈社群文案'

emit_face () { # <family-name> <weight> <file>
  cat >> "$CSS" <<EOF
@font-face {
  font-family: '$1';
  font-style: normal;
  font-weight: $2;
  font-display: swap;
  src: url('./fonts/$3') format('woff2');
}
EOF
}

# 取某字重的 latin 子集 woff2（CSS2 返回多段，latin 段的 woff2 在最后）
fetch_latin () { # <FamilyPlus> <FamilyName> <slug> <weight>
  local famplus="$1" famname="$2" slug="$3" w="$4"
  local css url file
  css=$(curl -s -m 30 -H "User-Agent: $UA" \
    "https://fonts.googleapis.com/css2?family=${famplus}:wght@${w}&display=swap")
  url=$(printf '%s' "$css" | grep -oE 'https://[^)]+\.woff2' | tail -1)
  file="${slug}-${w}.woff2"
  curl -s -m 40 -o "$FONTS/$file" "$url"
  echo "  $famname $w -> $file ($(wc -c < "$FONTS/$file") B)"
  emit_face "$famname" "$w" "$file"
}

: > "$CSS"
echo "/* 自托管字体 @font-face —— 由 scripts/fetch-fonts.sh 生成，勿手改 */" >> "$CSS"

echo "[1] Orbitron (display)"
for w in 500 700 900; do fetch_latin "Orbitron" "Orbitron" "orbitron" "$w"; done
echo "[2] Rajdhani (head)"
for w in 500 700; do fetch_latin "Rajdhani" "Rajdhani" "rajdhani" "$w"; done
echo "[3] JetBrains Mono (mono)"
for w in 400 700; do fetch_latin "JetBrains+Mono" "JetBrains Mono" "jetbrains-mono" "$w"; done

echo "[4] Ma Shan Zheng (brush, 字形子集)"
mscss=$(curl -s -m 30 -H "User-Agent: $UA" -G "https://fonts.googleapis.com/css2" \
  --data-urlencode "family=Ma Shan Zheng" \
  --data-urlencode "text=$BRUSH_TEXT" --data-urlencode "display=swap")
# &text= 子集返回的是 /l/font?kit=... 动态 URL（不以 .woff2 结尾），按 url() 内容取
msurl=$(printf '%s' "$mscss" | grep -oE 'https://[^) ]+' | head -1)
curl -s -m 40 -o "$FONTS/ma-shan-zheng.woff2" "$msurl"
echo "  Ma Shan Zheng 400 -> ma-shan-zheng.woff2 ($(wc -c < "$FONTS/ma-shan-zheng.woff2") B)"
emit_face "Ma Shan Zheng" 400 "ma-shan-zheng.woff2"

echo "完成 → $CSS"
