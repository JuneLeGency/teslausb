#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
SELECTION=${1:-"$ROOT_DIR/assets/xiaote/curated-selection.tsv"}
OUTPUT_DIR=${2:-"$ROOT_DIR/assets/xiaote/raw/curated"}
CATALOG="$ROOT_DIR/assets/xiaote/catalog.tsv"

if [ ! -f "$SELECTION" ] || [ ! -f "$CATALOG" ]; then
  echo "缺少精选清单或资源总清单" >&2
  exit 1
fi

sha256_file() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | awk '{print $1}'
  else
    shasum -a 256 "$1" | awk '{print $1}'
  fi
}

mkdir -p "$OUTPUT_DIR"
count=0

while IFS=$'\t' read -r category model title source_path target_path validation; do
  [ "$category" = "category" ] && continue
  source_file="$ROOT_DIR/$source_path"
  target_file="$OUTPUT_DIR/$target_path"

  if [ ! -f "$source_file" ]; then
    echo "缺少源文件：$source_path" >&2
    exit 1
  fi

  expected=$(awk -F '\t' -v path="$source_path" '$4 == path {print $6; exit}' "$CATALOG")
  if [ -z "$expected" ]; then
    echo "总清单中找不到：$source_path" >&2
    exit 1
  fi
  actual=$(sha256_file "$source_file")
  if [ "$actual" != "$expected" ]; then
    echo "SHA-256 不匹配：$source_path" >&2
    exit 1
  fi

  mkdir -p "$(dirname "$target_file")"
  cp -p "$source_file" "$target_file"
  count=$((count + 1))
done < "$SELECTION"

# Tesla 锁车音使用盘根目录的固定文件名；保留 Boombox 中的五个候选音供切换。
cp -p "$OUTPUT_DIR/Boombox/03-cinematic.wav" "$OUTPUT_DIR/LockChime.wav"

cat > "$OUTPUT_DIR/README.txt" <<'EOF'
TeslaUSB CN 个人精选素材包

- LockChime.wav：当前默认锁车音（大气结尾）
- Boombox/：5 个已校验 WAV 候选音
- LightShow/：5 套同名 MP3/FSEQ 灯光秀
- Wraps/：按精确车型模板分组的 12 张皮肤

素材来自小特资源库，仅限个人设备使用。原页面未为每项素材声明统一的再分发许可，
因此本包不会进入公开 Git 仓库或公开镜像。安装到 USB LUN 前必须先让车辆释放该盘。
EOF

size=$(du -sh "$OUTPUT_DIR" | awk '{print $1}')
echo "精选包已生成：${OUTPUT_DIR}（${count} 个清单文件 + 默认 LockChime，${size}）"
