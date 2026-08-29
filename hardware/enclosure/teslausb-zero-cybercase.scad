// TeslaUSB Zero Cybercase — angular vehicle-inspired enclosure
// SPDX-License-Identifier: CC-BY-SA-4.0
// Mechanical datum: Raspberry Pi Zero 2 W official mechanical drawing.

part = "print_plate"; // bottom, lid, badge, fit_gauge, print_plate, assembly
mounting_ears = true;
gpio_window = false;

$fn = 48;

board = [65, 30, 1.6];
hole_spacing = [58, 23];
hole_edge = 3.5;
xy_clearance = 1.5;
fit_tolerance = 0.25;
wall = 2.0;
floor = 2.0;
bottom_height = 12.0;
board_z = 5.5;
post_od = 6.0;
post_pilot = 2.0;
lid_plate = 2.2;
lip_height = 2.4;
lip_wall = 1.2;
chamfer = 5.0;

inner = [board.x + 2 * xy_clearance, board.y + 2 * xy_clearance];
outer = [inner.x + 2 * wall, inner.y + 2 * wall];
board_origin = [wall + xy_clearance, wall + xy_clearance];

mount_holes = [
  [board_origin.x + hole_edge, board_origin.y + hole_edge],
  [board_origin.x + hole_edge + hole_spacing.x, board_origin.y + hole_edge],
  [board_origin.x + hole_edge, board_origin.y + hole_edge + hole_spacing.y],
  [board_origin.x + hole_edge + hole_spacing.x, board_origin.y + hole_edge + hole_spacing.y]
];

module cyber_outline_2d(size, cut) {
  polygon([
    [cut, 0], [size.x - cut, 0], [size.x, cut],
    [size.x, size.y - cut], [size.x - cut, size.y],
    [cut, size.y], [0, size.y - cut], [0, cut]
  ]);
}

module cyber_box(size, cut) {
  linear_extrude(height = size.z) cyber_outline_2d([size.x, size.y], cut);
}

module rounded_board_2d(size, radius) {
  hull()
    for (x = [radius, size.x - radius], y = [radius, size.y - radius])
      translate([x, y]) circle(r = radius);
}

module strap_ear(x, upper = false) {
  y0 = upper ? outer.y : -7;
  translate([x - 7, y0, 0])
    linear_extrude(height = floor)
      polygon([[2, 0], [12, 0], [14, 2], [14, 7], [0, 7], [0, 2]]);
}

module shell_only() {
  difference() {
    union() {
      cyber_box([outer.x, outer.y, bottom_height], chamfer);
      if (mounting_ears)
        for (x = [18, outer.x - 18], upper = [false, true]) strap_ear(x, upper);
    }

    translate([wall, wall, floor])
      cyber_box([inner.x, inner.y, bottom_height + 1], chamfer - wall);

    // Official connector centres with generous cable-shell allowance.
    translate([board_origin.x + 4.8, -0.1, board_z - 1.0]) cube([15.2, wall + xy_clearance + 0.3, 7.2]);
    translate([board_origin.x + 35.4, -0.1, board_z - 1.0]) cube([10.5, wall + xy_clearance + 0.3, 7.2]);
    translate([board_origin.x + 48.0, -0.1, board_z - 1.0]) cube([11.0, wall + xy_clearance + 0.3, 7.2]);
    translate([-0.1, board_origin.y + 4.0, board_z - 1.5]) cube([wall + xy_clearance + 0.3, 20.0, 6.2]);
    translate([outer.x - wall - xy_clearance - 0.2, board_origin.y + 4.0, board_z - 1.0]) cube([wall + xy_clearance + 0.3, 20.0, 6.0]);

    if (mounting_ears)
      for (x = [18, outer.x - 18], y = [-3.5, outer.y + 3.5])
        translate([x, y, -0.1]) hull() {
          translate([-2.5, 0]) cylinder(d = 3.2, h = floor + 0.2);
          translate([2.5, 0]) cylinder(d = 3.2, h = floor + 0.2);
        }
  }
}

module bottom() {
  difference() {
    union() {
      shell_only();
      for (p = mount_holes)
        translate([p.x, p.y, floor]) cylinder(d = post_od, h = board_z - floor);
      // Low ribs echo the body crease and stiffen the floor.
      translate([outer.x / 2, outer.y / 2, floor])
        rotate([0, 0, 45]) cube([1.2, 24, 0.8], center = true);
      translate([outer.x / 2, outer.y / 2, floor])
        rotate([0, 0, -45]) cube([1.2, 24, 0.8], center = true);
    }
    for (p = mount_holes)
      translate([p.x, p.y, floor - 0.1]) cylinder(d = post_pilot, h = board_z - floor + 0.2);
  }
}

module t_badge_2d(clearance = 0) {
  // Original angular T motif, deliberately not a copy of the Tesla trademark.
  offset(delta = clearance)
    union() {
      polygon([[-9, 4], [9, 4], [7, 1], [2.3, 0], [-2.3, 0], [-7, 1]]);
      polygon([[-2.2, 0.5], [2.2, 0.5], [1.4, -8], [0, -10], [-1.4, -8]]);
    }
}

module lid() {
  lip_outer = [inner.x - 2 * fit_tolerance, inner.y - 2 * fit_tolerance];
  lip_inner = [lip_outer.x - 2 * lip_wall, lip_outer.y - 2 * lip_wall];

  difference() {
    union() {
      cyber_box([outer.x, outer.y, lid_plate], chamfer);
      translate([wall + fit_tolerance, wall + fit_tolerance, lid_plate])
        linear_extrude(height = lip_height)
          difference() {
            cyber_outline_2d(lip_outer, chamfer - wall);
            translate([lip_wall, lip_wall]) cyber_outline_2d(lip_inner, chamfer - wall - lip_wall);
          }
    }

    for (p = mount_holes)
      translate([p.x, p.y, -0.1]) cylinder(d = 2.9, h = lid_plate + lip_height + 1.0);

    // Angled cooling slots form a bonnet-like centre line.
    for (side = [-1, 1], y = [-5.2, -2.6, 0, 2.6, 5.2])
      translate([outer.x / 2 + side * 14, outer.y / 2 + y, -0.1])
        rotate([0, 0, side * 12]) cube([11, 1.45, lid_plate + 0.2], center = true);

    // Shallow exterior panel creases, mirrored for assembled orientation.
    for (angle = [-24, 24])
      translate([outer.x / 2, outer.y / 2, -0.1])
        rotate([0, 0, angle]) cube([55, 0.65, 0.55], center = true);

    // 0.8 mm recess for a contrasting badge.
    translate([outer.x / 2, outer.y / 2 + 1.2, -0.1])
      mirror([0, 1, 0]) linear_extrude(height = 0.9) t_badge_2d(0.18);

    translate([outer.x / 2, outer.y / 2 - 11.8, -0.1])
      mirror([0, 1, 0]) linear_extrude(height = 0.55)
        text("TESLAUSB ZERO", size = 2.5, halign = "center", valign = "center", font = "Liberation Sans:style=Bold");

    if (gpio_window)
      translate([board_origin.x + 5.5, board_origin.y + 23.0, -0.1])
        cube([52.5, 5.0, lid_plate + 0.2]);
  }
}

module badge() {
  linear_extrude(height = 0.75) t_badge_2d(0);
}

module fit_gauge() {
  // Fast 1.2 mm datum gauge based on the official rounded PCB outline and
  // mounting-hole centres. Verify it before spending material on the case.
  difference() {
    translate([board_origin.x, board_origin.y, 0])
      linear_extrude(height = 1.2) rounded_board_2d([board.x, board.y], 3);
    for (p = mount_holes)
      translate([p.x, p.y, -0.1]) cylinder(d = 2.8, h = 1.4);
  }
}

module assembly() {
  bottom();
  %translate([board_origin.x, board_origin.y, board_z]) color("green") cube(board);
  translate([0, outer.y, bottom_height + lid_plate]) rotate([180, 0, 0]) lid();
  translate([outer.x / 2, outer.y / 2 - 1.2, bottom_height + lid_plate + 0.02]) badge();
}

if (part == "bottom") {
  bottom();
} else if (part == "lid") {
  lid();
} else if (part == "badge") {
  badge();
} else if (part == "fit_gauge") {
  fit_gauge();
} else if (part == "assembly") {
  assembly();
} else if (part == "print_plate") {
  bottom();
  translate([outer.x + 12, 0, 0]) lid();
  translate([outer.x * 2 + 23, outer.y / 2, 0]) badge();
}
