// Cybercase orthographic QA sheet generator. Export with:
// openscad -D 'part="none"' -o cybercase-preview.svg render-cyber-preview.scad
include <teslausb-zero-cybercase.scad>

// Bottom plan, including mounting ears, connector windows and posts.
projection(cut = true) translate([0, 0, -6]) bottom();

// Lid exterior and removable contrasting badge.
translate([88, 0]) projection(cut = false) lid();
translate([124, 19]) projection(cut = false) badge();

// Official-size quick fit gauge.
translate([0, -46]) projection(cut = false) fit_gauge();

// Assembled side silhouette.
translate([88, -42]) projection(cut = false)
  rotate([90, 0, 0]) {
    bottom();
    translate([0, outer.y, bottom_height + lid_plate]) rotate([180, 0, 0]) lid();
  }
