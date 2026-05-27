// Simple validation tests for the polyline routing helpers

const findClosestPointOnPolyline = (point, polyline) => {
  if (polyline.length === 0) return point;
  if (polyline.length === 1) return polyline[0];

  let minD2 = Infinity;
  let closestPoint = polyline[0];
  const [px, py] = point;

  for (let i = 0; i < polyline.length - 1; i++) {
    const [ax, ay] = polyline[i];
    const [bx, by] = polyline[i + 1];

    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;

    let t = 0;
    if (len2 > 0) {
      t = ((px - ax) * dx + (py - ay) * dy) / len2;
      t = Math.max(0, Math.min(1, t));
    }

    const cx = ax + t * dx;
    const cy = ay + t * dy;

    const dist2 = (px - cx) * (px - cx) + (py - cy) * (py - cy);
    if (dist2 < minD2) {
      minD2 = dist2;
      closestPoint = [cx, cy];
    }
  }

  return closestPoint;
};

const getProgressOnPolyline = (point, polyline) => {
  if (polyline.length < 2) return 0;

  let minD2 = Infinity;
  let bestProgress = 0;
  let accumulatedDist = 0;
  const [px, py] = point;

  for (let i = 0; i < polyline.length - 1; i++) {
    const [ax, ay] = polyline[i];
    const [bx, by] = polyline[i + 1];

    const dx = bx - ax;
    const dy = by - ay;
    const segmentLength = Math.sqrt(dx * dx + dy * dy);

    let t = 0;
    if (segmentLength > 0) {
      t = ((px - ax) * dx + (py - ay) * dy) / (segmentLength * segmentLength);
      t = Math.max(0, Math.min(1, t));
    }

    const cx = ax + t * dx;
    const cy = ay + t * dy;

    const dist2 = (px - cx) * (px - cx) + (py - cy) * (py - cy);
    if (dist2 < minD2) {
      minD2 = dist2;
      bestProgress = accumulatedDist + t * segmentLength;
    }
    accumulatedDist += segmentLength;
  }

  return bestProgress;
};

// TEST SUITE
const runTests = () => {
  console.log("🏃 Running Routing Logic Unit Tests...");

  // Test Case 1: Closest point on simple segment
  const polyline = [[0, 0], [10, 0]];
  const p1 = [5, 2];
  const closest = findClosestPointOnPolyline(p1, polyline);
  console.assert(closest[0] === 5 && closest[1] === 0, `TC1 Failed: expected [5, 0], got [${closest}]`);

  // Test Case 2: Clamped segment projection (before start)
  const p2 = [-2, 1];
  const closest2 = findClosestPointOnPolyline(p2, polyline);
  console.log("closest2", closest2);
  console.assert(closest2[0] === 0 && closest2[1] === 0, `TC2 Failed: expected [0, 0], got [${closest2}]`);

  // Test Case 3: Polyline progress check
  const polyline3 = [[0, 0], [5, 0], [5, 5]]; // total length = 10
  const progressStart = getProgressOnPolyline([1, 0.1], polyline3);
  const progressMid = getProgressOnPolyline([5, 2], polyline3);
  console.log("progressStart:", progressStart, "progressMid:", progressMid);
  console.assert(progressStart < progressMid, `TC3 Failed: expected start progress (${progressStart}) to be less than mid progress (${progressMid})`);

  console.log("🎉 All Tests Passed successfully!");
};

runTests();
