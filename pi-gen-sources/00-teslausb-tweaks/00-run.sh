#!/bin/bash -e
touch "${ROOTFS_DIR}/boot/ssh"
install -m 755 files/rc.local                             "${ROOTFS_DIR}/etc/"
install -m 666 files/teslausb_setup_variables.conf.sample "${ROOTFS_DIR}/boot/firmware/teslausb_setup_variables.conf"
install -m 666 files/wpa_supplicant.conf.sample           "${ROOTFS_DIR}/boot/firmware"
install -m 666 files/run_once                             "${ROOTFS_DIR}/boot/firmware"
install -d "${ROOTFS_DIR}/root/bin"

# Cache the verified camera viewer in the image so first boot does not depend on GitHub.
WEBUI_VERSION=v1.2.1
WEBUI_SHA256=d606a5a71fc15ae96b3b74b1bb8c5213d51479821bdf205f515da52119a8d774
WEBUI_DIR="${ROOTFS_DIR}/usr/share/teslausb"
install -d "$WEBUI_DIR"
curl -fL --retry 5 --retry-delay 3 \
  -o "$WEBUI_DIR/teslausb-ui-${WEBUI_VERSION}.tgz" \
  "https://github.com/marcone/teslausb-webui/releases/download/${WEBUI_VERSION}/teslausb-ui.tgz"
echo "$WEBUI_SHA256  $WEBUI_DIR/teslausb-ui-${WEBUI_VERSION}.tgz" | sha256sum -c -

# ensure dwc2 module is loaded
grep -qxF "dtoverlay=dwc2" "${ROOTFS_DIR}/boot/firmware/config.txt" || echo "dtoverlay=dwc2" >> "${ROOTFS_DIR}/boot/firmware/config.txt"

# remove unwanted packages, disable unwanted services, and disable swap
on_chroot << EOF
apt-get remove -y --force-yes --purge triggerhappy userconf-pi dphys-swapfile firmware-libertas firmware-realtek firmware-atheros mkvtoolnix
apt-get -y --force-yes autoremove
systemctl disable keyboard-setup
systemctl disable resize2fs_once
systemctl disable dpkg-db-backup
update-rc.d resize2fs_once remove
rm -f /etc/init.d/resize2fs_once
rm -f /usr/share/initramfs-tools/scripts/local-premount/firstboot
update-initramfs -u
EOF
