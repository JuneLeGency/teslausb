// Orthographic QA sheet generator. Export with:
// openscad -D 'part="none"' -o preview.svg render-preview.scad
include <teslausb-zero-enclosure.scad>

// Bottom section through the connector openings and mounting posts.
projection(cut = true) translate([0, 0, -6]) bottom();

// Lid outer face with screw holes, vents and lettering.
translate([88, 0]) projection(cut = false) lid();

// Assembled side silhouette.
translate([0, -34]) projection(cut = false)
  rotate([90, 0, 0]) {
    bottom();
    translate([0, outer.y, bottom_height + lid_plate]) rotate([180, 0, 0]) lid();
  }
