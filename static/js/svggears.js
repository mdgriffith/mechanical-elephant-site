// Generated by CoffeeScript 1.6.3
(function() {
  var Back, Corner, Mask, Planetary, box, gear, gearline, lock, masked, positioning, rotate, tooth;

  rotate = function(x, y, xm, ym, a) {
    var xr, yr;
    a = a * Math.PI / 180;
    xr = (x - xm) * Math.cos(a) - (y - ym) * Math.sin(a) + xm;
    yr = (x - xm) * Math.sin(a) + (y - ym) * Math.cos(a) + ym;
    return [xr, yr];
  };

  gearline = function(d) {
    var a0, da, i, n, path, r0, r1, r2, r3;
    n = d.teeth;
    r2 = Math.abs(d.radius);
    r0 = r2 - d.toothHeight;
    r1 = r2 + d.toothHeight;
    if (d.annulus) {
      r3 = r0;
      r0 = r1;
      r1 = r3;
      r3 = r2 + d.thickness;
    } else {
      r3 = d.radius - d.thickness;
    }
    da = Math.PI / n;
    a0 = -Math.PI / 2 + (d.annulus !== void 0 && d.annulus ? Math.PI / n : 0);
    i = -1;
    path = ["M", r0 * Math.cos(a0), ",", r0 * Math.sin(a0)];
    while (++i < n) {
      path.push(tooth(r0, r1, r2, a0 + (i * 2 * da), da));
    }
    path.push("M0," + (-r3) + "A" + r3 + "," + r3 + " 0 0,0 0," + r3 + "A" + r3 + "," + r3 + " 0 0,0 0," + (-r3) + "Z");
    return path.join("");
  };

  tooth = function(r0, r1, r2, a0, da) {
    var path;
    path = [];
    path.push("A" + r0 + "," + r0 + " 0 0,1 " + (r0 * Math.cos(a0 += da)) + "," + (r0 * Math.sin(a0)));
    path.push("L", r2 * Math.cos(a0), ",", r2 * Math.sin(a0));
    path.push("L", r1 * Math.cos(a0 += da / 3), ",", r1 * Math.sin(a0));
    path.push("A", r1, ",", r1, " 0 0,1 ", r1 * Math.cos(a0 += da / 3), ",", r1 * Math.sin(a0));
    path.push("L", r2 * Math.cos(a0 += da / 3), ",", r2 * Math.sin(a0));
    path.push("L", r0 * Math.cos(a0), ",", r0 * Math.sin(a0));
    return path.join("");
  };

  positioning = function(d) {
    var transformation;
    transformation = "";
    if (d.offset !== void 0 && d.offset !== null) {
      transformation = "translate(" + d.offset[0] + "," + d.offset[1] + ")";
    }
    if (d.offset !== void 0 && d.offset !== null && d.rotation !== void 0 && d.rotation !== null) {
      transformation = "" + transformation + "rotate(" + d.rotation + "," + d.offset[0] + "," + d.offset[1] + ")";
    }
    return transformation;
  };

  gear = function(frame, data, classed) {
    var g;
    data["radius"] = data["teeth"] * 5;
    data["thickness"] = 20;
    data["toothHeight"] = 7;
    frame.append("g").attr("class", classed).datum(data).attr("transform", positioning).append("path").attr("radius", data["radius"]).attr("direction", data["direction"]).attr("d", gearline);
    g = {
      frame: frame,
      original: data,
      offset: function(rotation, classed, data) {
        var new_offset;
        if (rotation !== null) {
          new_offset = lock(this.original["teeth"], data["teeth"], rotation, this.original["annulus"]);
          if ("offset" in data) {
            new_offset[0] = new_offset[0] + data["offset"][0];
            new_offset[1] = new_offset[1] + data["offset"][1];
          }
          data["offset"] = new_offset;
        }
        return gear(this.frame, data, classed);
      }
    };
    return g;
  };

  lock = function(size, size2, angle, annulus) {
    var coords, distance, r, r2;
    if (annulus == null) {
      annulus = false;
    }
    console.log(size + ":" + size2);
    r = size * 5;
    r2 = size2 * 5;
    if (annulus) {
      distance = r - r2;
    } else {
      distance = r + r2;
    }
    coords = rotate(0, distance, 0, 0, angle);
    return coords;
  };

  Planetary = function(frame) {
    var annulus, outer, sun, sun_data;
    frame.append("g").attr("class", "inset");
    outer = {
      teeth: 37,
      annulus: true,
      direction: -1
    };
    annulus = gear(frame, outer, "gear annulus");
    sun_data = {
      teeth: 11,
      direction: 1,
      offset: [22, -60],
      rotation: 3
    };
    sun = gear(frame, sun_data, "gear sun");
    annulus.offset(0, "gear planet", {
      teeth: 19,
      direction: -1
    });
    annulus.offset(140, "gear planet", {
      teeth: 11,
      direction: -1,
      rotation: 2
    });
    return annulus.offset(215, "gear planet", {
      teeth: 7,
      direction: -1,
      rotation: -2
    });
  };

  Corner = function(frame) {
    var base;
    frame.append("g").attr("class", "inset");
    base = gear(frame, {
      teeth: 12,
      direction: 1
    }, "gear");
    base.offset(0, "gear", {
      teeth: 7,
      direction: -1,
      rotation: 0
    });
    return base.offset(90, "gear", {
      teeth: 7,
      direction: -1,
      rotation: -3.5
    });
  };

  masked = function(d) {
    var path;
    path = [];
    path.push("M 0 0 l 25 0 l 0 25 l -25 0 z");
    path.push("M 10,10 c 0,-0.7 -0.08,-1.38 -0.18,-2.06 -0.1,-0.68 -0.2,-1.36 -0.2,-2 0,-0.78 0.2,-1.68 1.68,-1.92 0.1,-0.1 0.1,-0.3 0,-0.4 -0.98,0 -2.84,0.18 -2.84,2.52 0,0.68 0.1,1.42 0.16,2.12 0.06,0.72 0.14,1.38 0.14,2 0,0.68 -0.08,1.54 -1.74,1.66 -0.1,0.12 -0.1,0.32 0,0.44 1.66,0.12 1.74,0.98 1.74,1.66 0,0.6 -0.06,1.28 -0.14,1.98 -0.08,0.72 -0.16,1.44 -0.16,2.14 0,2.33999 1.86,2.52 2.84,2.52 0.1,-0.1 0.1,-0.32 0,-0.4 -1.48,-0.24 -1.68,-1.14 -1.68,-1.92 0,-0.66 0.12,-1.32 0.2,-2 0.08,-0.68 0.18,-1.38 0.18,-2.06 0,-1.14 -0.46,-1.84 -1.5,-2.1 l 0,-0.08 c 1.04,-0.26 1.5,-0.96 1.5,-2.1");
    return path.join("");
  };

  box = function(d) {
    var path;
    path = [];
    path.push("M 0 0 l 25 0 l 0 25 l -25 0 z");
    return path.join("");
  };

  Back = function(frame) {
    return frame.append("g").attr("class", "backmask").append("path").attr("d", box).attr("transform", "scale(1.0)");
  };

  Mask = function(frame) {
    return frame.append("g").attr("class", "mask").append("path").attr("d", masked).attr("transform", "scale(1.0)");
  };

  window.Planetary = Planetary;

  window.Gear = gear;

  window.Back = Back;

  window.Mask = Mask;

  window.Lock = lock;

  window.Corner = Corner;

}).call(this);
