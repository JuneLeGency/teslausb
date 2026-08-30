#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
OUTPUT_DIR=${1:-"$ROOT_DIR/assets/xiaote/raw"}
CATALOG_PATH="$ROOT_DIR/assets/xiaote/catalog.tsv"
FAILURES_PATH="$ROOT_DIR/assets/xiaote/failures.tsv"
RESOURCE_PAGE='https://www.xiaote.com/tools/resources'
SKIN_API='https://giga-api.xiaote.net/api/v1/tesla-wrap'
SYNC_DATE=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
TEMP_DIR=$(mktemp -d "${TMPDIR:-/tmp}/teslausb-xiaote.XXXXXX")
CATALOG_TEMP="$TEMP_DIR/catalog.tsv"
FAILURES_TEMP="$TEMP_DIR/failures.tsv"

cleanup() {
  rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

for command in curl jq shasum file
do
  command -v "$command" >/dev/null || {
    echo "缺少依赖：$command" >&2
    exit 1
  }
done

mkdir -p "$OUTPUT_DIR/lock-sounds" "$OUTPUT_DIR/lightshows" "$OUTPUT_DIR/skins"
printf 'category\tmodel\tname\tpath\tbytes\tsha256\tsource_url\tdownloaded_at\tlicense\n' > "$CATALOG_TEMP"
printf 'category\tmodel\tname\tsource_url\terror\n' > "$FAILURES_TEMP"

urlencode_path() {
  local url=$1
  local rest host path encoded_path
  rest=${url#https://}
  host=${rest%%/*}
  path=/${rest#*/}
  encoded_path=$(jq -rn --arg path "$path" '$path | split("/") | map(@uri) | join("/")')
  printf 'https://%s%s\n' "$host" "$encoded_path"
}

file_size() {
  stat -f '%z' "$1" 2>/dev/null || stat -c '%s' "$1"
}

download_file() {
  local category=$1 model=$2 name=$3 url=$4 destination=$5
  local encoded_url partial relative bytes sha mime
  encoded_url=$(urlencode_path "$url")
  partial="${destination}.part"
  mkdir -p "$(dirname "$destination")"

  if [ ! -s "$destination" ]
  then
    echo "下载 [$category] ${model:+$model / }$name"
    if ! curl --fail --silent --show-error --location --retry 5 --retry-delay 2 \
      --connect-timeout 20 --max-time 600 \
      --output "$partial" "$encoded_url"
    then
      rm -f "$partial"
      return 1
    fi
    mv "$partial" "$destination"
  else
    : # 断点续传：已有文件仍重新计算类型、大小和 SHA-256。
  fi

  mime=$(file -b --mime-type "$destination")
  case "$category:$mime" in
    lock-sound:audio/*|lightshow-audio:audio/*|lightshow-sequence:application/*|skin:image/*) ;;
    *)
      echo "文件类型异常：$destination ($mime)" >&2
      return 1
      ;;
  esac

  bytes=$(file_size "$destination")
  sha=$(shasum -a 256 "$destination" | awk '{print $1}')
  relative=${destination#"$ROOT_DIR/"}
  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n' \
    "$category" "$model" "$name" "$relative" "$bytes" "$sha" "$url" "$SYNC_DATE" '未声明，禁止公开再分发' \
    >> "$CATALOG_TEMP"
}

echo '读取锁车音列表...'
curl --fail --silent --show-error --location --retry 5 --retry-all-errors \
  --output "$TEMP_DIR/lock-sounds.html" "$RESOURCE_PAGE?tab=lockSound"
grep -o 'href="https://[^"]*"' "$TEMP_DIR/lock-sounds.html" \
  | sed 's/^href="//;s/"$//' \
  | grep '/锁车特效声/' \
  | LC_ALL=C sort -u > "$TEMP_DIR/lock-sounds.urls"

while IFS= read -r url
do
  [ -n "$url" ] || continue
  filename=${url##*/}
  if ! download_file 'lock-sound' '' "$filename" "$url" "$OUTPUT_DIR/lock-sounds/$filename"
  then
    printf '%s\t%s\t%s\t%s\t%s\n' 'lock-sound' '' "$filename" "$url" '下载或类型检查失败' >> "$FAILURES_TEMP"
  fi
done < "$TEMP_DIR/lock-sounds.urls"

echo '读取灯光秀列表...'
curl --fail --silent --show-error --location --retry 5 --retry-all-errors \
  --output "$TEMP_DIR/lightshows.html" "$RESOURCE_PAGE?tab=lightShow"
grep -o 'href="https://[^"]*"' "$TEMP_DIR/lightshows.html" \
  | sed 's/^href="//;s/"$//' \
  | grep '/灯光秀/' \
  | LC_ALL=C sort -u > "$TEMP_DIR/lightshows.urls"

while IFS= read -r audio_url
do
  [ -n "$audio_url" ] || continue
  show_path=${audio_url%/LightShow/lightshow.mp3}
  show_name=${show_path##*/}
  sequence_url=${audio_url%lightshow.mp3}lightshow.fseq
  show_dir="$OUTPUT_DIR/lightshows/$show_name/LightShow"
  if ! download_file 'lightshow-audio' '' "$show_name / lightshow.mp3" "$audio_url" "$show_dir/lightshow.mp3"
  then
    printf '%s\t%s\t%s\t%s\t%s\n' 'lightshow-audio' '' "$show_name / lightshow.mp3" "$audio_url" '下载或类型检查失败' >> "$FAILURES_TEMP"
  fi
  if ! download_file 'lightshow-sequence' '' "$show_name / lightshow.fseq" "$sequence_url" "$show_dir/lightshow.fseq"
  then
    printf '%s\t%s\t%s\t%s\t%s\n' 'lightshow-sequence' '' "$show_name / lightshow.fseq" "$sequence_url" '下载或类型检查失败' >> "$FAILURES_TEMP"
  fi
done < "$TEMP_DIR/lightshows.urls"

echo '读取皮肤车型列表...'
curl --fail --silent --show-error --location --retry 5 --retry-all-errors \
  -H 'Content-Type: application/json' -d '{}' \
  --output "$TEMP_DIR/vehicles.json" "$SKIN_API/vehicles/"
jq -e '.success == true and (.data | type == "array")' "$TEMP_DIR/vehicles.json" >/dev/null

# 与网页行为保持一致：网页主动隐藏 Cybertruck，空车型不发分页请求。
jq -r '.data[] | select(.id != "cybertruck" and .count > 0) | [.id, .displayName, (.count | tostring)] | @tsv' \
  "$TEMP_DIR/vehicles.json" > "$TEMP_DIR/vehicles.tsv"

while IFS=$'\t' read -r model_id model_name expected_count
do
  page=1
  received=0
  has_more=true
  echo "同步皮肤：${model_name}（预计 ${expected_count} 张）"

  while [ "$has_more" = true ]
  do
    response="$TEMP_DIR/skins-${model_id}-${page}.json"
    if ! curl --fail --silent --show-error --location --retry 5 --retry-all-errors \
      -H 'Content-Type: application/json' \
      -d "{\"page\":$page,\"page_size\":24}" \
      --output "$response" "$SKIN_API/vehicles/$model_id/"
    then
      printf '%s\t%s\t%s\t%s\t%s\n' 'skin-index' "$model_id" "$model_name" "$SKIN_API/vehicles/$model_id/" '分页接口请求失败' >> "$FAILURES_TEMP"
      break
    fi
    if ! jq -e '.success == true and (.data.images | type == "array")' "$response" >/dev/null
    then
      error=$(jq -r '.error // .message // "分页接口响应无效"' "$response" 2>/dev/null || echo '分页接口响应无效')
      printf '%s\t%s\t%s\t%s\t%s\n' 'skin-index' "$model_id" "$model_name" "$SKIN_API/vehicles/$model_id/" "$error" >> "$FAILURES_TEMP"
      echo "跳过皮肤车型：${model_name}（${error}）" >&2
      break
    fi

    jq -r '.data.images[] | [.filename, .name, (.url | split("?")[0])] | @tsv' "$response" \
      > "$TEMP_DIR/skin-page.tsv"
    while IFS=$'\t' read -r filename skin_name original_url
    do
      [ -n "$filename" ] || continue
      if ! download_file 'skin' "$model_id" "$skin_name" "$original_url" "$OUTPUT_DIR/skins/$model_id/$filename"
      then
        printf '%s\t%s\t%s\t%s\t%s\n' 'skin' "$model_id" "$skin_name" "$original_url" '下载或类型检查失败' >> "$FAILURES_TEMP"
      fi
      received=$((received + 1))
    done < "$TEMP_DIR/skin-page.tsv"

    has_more=$(jq -r '.data.has_more == true' "$response")
    page=$((page + 1))
  done

  if [ "$received" -ne "$expected_count" ]
  then
    echo "数量提示：${model_name} 汇总值 ${expected_count}，分页实际 ${received}；以 has_more=false 为准。" >&2
  fi
done < "$TEMP_DIR/vehicles.tsv"

mv "$CATALOG_TEMP" "$CATALOG_PATH"
mv "$FAILURES_TEMP" "$FAILURES_PATH"
echo
echo "同步完成："
awk -F '\t' 'NR > 1 {count[$1]++; bytes[$1]+=$5} END {for (key in count) printf "  %s: %d 个文件，%.1f MiB\n", key, count[key], bytes[key]/1048576}' "$CATALOG_PATH" | sort
echo "清单：$CATALOG_PATH"
failure_count=$(awk 'END {print NR - 1}' "$FAILURES_PATH")
echo "失败：${failure_count} 项（${FAILURES_PATH}）"
