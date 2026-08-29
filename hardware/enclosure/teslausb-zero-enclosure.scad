// TeslaUSB Raspberry Pi Zero W / Zero 2 W vehicle enclosure
// SPDX-License-Identifier: CC-BY-SA-4.0
// Dimensions are millimetres. Source board outline and mounting pattern:
// Raspberry Pi Zero 2 mechanical drawing, Raspberry Pi Ltd.

part = "print_plate"; // "bottom", "lid", "print_plate", "assembly"
mounting_ears = true;
gpio_window = false;
label_text = true;

$fn = 48;

board = [65, 30, 1.6];
hole_spacing = [58, 23];
hole_edge = 3.5;
clearance = 1.5;
wall = 2.0;
floor = 2.0;
corner_radius = 4.0;
bottom_height = 12.0;
board_z = 5.5;
post_od = 6.0;
post_pilot = 2.0; // M2.5 self-tapping screw pilot
lid_plate = 2.0;
lip_height = 2.4;
lip_wall = 1.2;
fit = 0.25;

inner = [board.x + 2 * clearance, board.y + 2 * clearance];
outer = [inner.x + 2 * wall, inner.y + 2 * wall];
board_origin = [wall + clearance, wall + clearance];

mount_holes = [
  [board_origin.x + hole_edge, board_origin.y + hole_edge],
  [board_origin.x + hole_edge + hole_spacing.x, board_origin.y + hole_edge],
  [board_origin.x + hole_edge, board_origin.y + hole_edge + hole_spacing.y],
  [board_origin.x + hole_edge + hole_spacing.x, board_origin.y + hole_edge + hole_spacing.y]
];

module rounded_rect_2d(size, radius) {
  hull() {
    for (x = [radius, size.x - radius], y = [radius, size.y - radius])
      translate([x, y]) circle(r = radius);
  }
}

module rounded_box(size, radius) {
  linear_extrude(height = size.z) rounded_rect_2d([size.x, size.y], radius);
}

module mounting_ear(x, mirrored = false) {
  translate([x, mirrored ? outer.y : 0, 0])
    linear_extrude(height = floor)
      hull() {
        translate([0, mirrored ? 4 : -4]) circle(r = 5);
        translate([0, mirrored ? 0 : 0]) circle(r = 5);
      }
}

module bottom_shell() {
  difference() {
    union() {
      rounded_box([outer.x, outer.y, bottom_height], corner_radius);
      if (mounting_ears) {
        mounting_ear(18, false);
        mounting_ear(outer.x - 18, false);
        mounting_ear(18, true);
        mounting_ear(outer.x - 18, true);
      }
    }

    // Main cavity.
    translate([wall, wall, floor])
      rounded_box([inner.x, inner.y, bottom_height + 1], corner_radius - wall);

    // Mini HDMI, USB OTG and power openings on the connector edge.
    translate([board_origin.x + 4.8, -0.1, board_z - 1.0]) cube([15.2, wall + clearance + 0.3, 7.2]);
    translate([board_origin.x + 35.4, -0.1, board_z - 1.0]) cube([10.5, wall + clearance + 0.3, 7.2]);
    translate([board_origin.x + 48.0, -0.1, board_z - 1.0]) cube([11.0, wall + clearance + 0.3, 7.2]);

    // MicroSD service opening and camera ribbon opening on the short ends.
    translate([-0.1, board_origin.y + 4.0, board_z - 1.5]) cube([wall + clearance + 0.3, 20.0, 6.2]);
    translate([outer.x - wall - clearance - 0.2, board_origin.y + 4.0, board_z - 1.0]) cube([wall + clearance + 0.3, 20.0, 6.0]);

    if (mounting_ears)
      for (x = [18, outer.x - 18], y = [-4, outer.y + 4])
        translate([x, y, -0.1]) cylinder(d = 3.8, h = floor + 0.2);
  }
}

module bottom() {
  difference() {
    union() {
      bottom_shell();
      for (p = mount_holes)
        translate([p.x, p.y, floor]) cylinder(d = post_od, h = board_z - floor);
    }
    for (p = mount_holes)
      translate([p.x, p.y, floor - 0.1]) cylinder(d = post_pilot, h = board_z - floor + 0.2);
  }
}

module lid() {
  lip_outer = [inner.x - 2 * fit, inner.y - 2 * fit];
  lip_inner = [lip_outer.x - 2 * lip_wall, lip_outer.y - 2 * lip_wall];

  difference() {
    union() {
      rounded_box([outer.x, outer.y, lid_plate], corner_radius);
      translate([wall + fit, wall + fit, lid_plate])
        linear_extrude(height = lip_height)
          difference() {
            rounded_rect_2d(lip_outer, corner_radius - wall);
            translate([lip_wall, lip_wall])
              rounded_rect_2d(lip_inner, max(0.8, corner_radius - wall - lip_wall));
          }

    }

    // Four M2.5 clearance holes; use pan-head screws and washers.
    for (p = mount_holes)
      translate([p.x, p.y, -0.1]) cylinder(d = 2.9, h = lid_plate + lip_height + 1.0);

    // Five heat vents above the Zero 2 W system-in-package.
    for (y = [-4.8, -2.4, 0, 2.4, 4.8])
      translate([board_origin.x + 27.4, board_origin.y + 14.1 + y, -0.1])
        hull() {
          translate([-7, 0]) cylinder(d = 1.5, h = lid_plate + 0.2);
          translate([7, 0]) cylinder(d = 1.5, h = lid_plate + 0.2);
        }

    if (gpio_window)
      translate([board_origin.x + 5.5, board_origin.y + 23.0, -0.1])
        cube([52.5, 5.0, lid_plate + 0.2]);

    // Mirrored in print orientation so the recessed text reads correctly
    // after the lid is flipped onto the enclosure.
    if (label_text) {
      translate([outer.x / 2, outer.y / 2 + 4.2, -0.1])
        mirror([0, 1, 0]) linear_extrude(height = 0.55)
          text("TESLAUSB", size = 6.2, halign = "center", valign = "center", font = "Liberation Sans:style=Bold");
      translate([outer.x / 2, outer.y / 2 - 4.0, -0.1])
        mirror([0, 1, 0]) linear_extrude(height = 0.45)
          text("ZERO  /  CN", size = 2.4, halign = "center", valign = "center", font = "Liberation Sans:style=Bold");
    }
  }
}

module board_preview() {
  %translate([board_origin.x, board_origin.y, board_z])
    color("green") cube(board);
}

if (part == "bottom") {
  bottom();
} else if (part == "lid") {
  lid(); // print with the outer face on the bed and the locating lip upward
} else if (part == "assembly") {
  bottom();
  board_preview();
  translate([0, outer.y, bottom_height + lid_plate]) rotate([180, 0, 0]) lid();
} else if (part == "print_plate") {
  bottom();
  translate([outer.x + 12, 0, 0]) lid();
}
