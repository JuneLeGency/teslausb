#!/bin/bash -eu

SRC=$(dirname $(readlink -f $0))
DEST=$(readlink -f .)
RASPBIAN_MIRROR=${RASPBIAN_MIRROR:-https://mirror.nju.edu.cn/raspbian/raspbian/}

if [[ "$DEST" != */pi-gen ]]
then
  echo "$0 should be called from the RPi-Distro pi-gen folder"
  exit 1
fi

cp "$SRC/pi-gen-config" config
rm -rf stage2/EXPORT_NOOBS stage2/EXPORT_IMAGE export-image/01-user-rename/00-packages
mkdir -p stage_teslausb
touch stage_teslausb/EXPORT_IMAGE
cp stage2/prerun.sh stage_teslausb/prerun.sh
cp -r "$SRC/00-teslausb-tweaks" stage_teslausb

case "$RASPBIAN_MIRROR" in
  http://*|https://*) ;;
  *)
    echo "RASPBIAN_MIRROR must be an http(s) URL"
    exit 1
    ;;
esac

# Pin a predictable mirror instead of Raspberry Pi's global redirector. The
# redirector may mix many distant mirrors in a single build. A .bak suffix
# keeps this compatible with both GNU sed and macOS/BSD sed.
sed -i.bak "s|http://raspbian.raspberrypi.com/raspbian/|$RASPBIAN_MIRROR|g" \
  stage0/prerun.sh stage0/00-configure-apt/files/sources.list
rm -f stage0/prerun.sh.bak stage0/00-configure-apt/files/sources.list.bak

# pi-gen's Bookworm Docker helper uses Linux's `aarch64` name and wraps ARMHF
# commands with `setarch linux32`. macOS reports Apple Silicon as `arm64`, and
# OrbStack/Docker cannot set that Linux personality even though QEMU ARMHF
# execution works. Keep all compatibility edits in the disposable pi-gen clone.
if [ "$(uname -s)" = Darwin ] && [ "$(uname -m)" = arm64 ]
then
  sed -i.bak 's/^  aarch64)$/  aarch64|arm64)/' build-docker.sh
  sed -i.bak 's/setarch linux32 capsh/capsh/g' scripts/common
  rm -f build-docker.sh.bak scripts/common.bak
  if ! grep -q 'PI_GEN_FILE_BACKED_EXPORT' export-image/prerun.sh
  then
    patch --batch --forward -p1 < "$SRC/apple-silicon-file-export.patch"
  fi
  if ! grep -q '^export PI_GEN_FILE_BACKED_EXPORT=1$' config
  then
    echo 'export PI_GEN_FILE_BACKED_EXPORT=1' >> config
  fi
  echo 'Enabled Apple Silicon Docker compatibility.'
fi

echo "Build config set (Raspbian mirror: $RASPBIAN_MIRROR)."
echo 'Now use "./build.sh" or "./build-docker.sh" to build the TeslaUSB image.'
