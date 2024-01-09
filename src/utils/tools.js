function findClosestNumber(arr, target) {
  let mid;
  let l = 0;
  let r = arr.length - 1;
  while (r - l > 1) {
    mid = Math.floor((l + r) / 2);
    if (target < arr[mid]) {
      r = mid;
    } else {
      l = mid;
    }
  }
  return Math.abs(target - arr[l]) <= Math.abs(target - arr[r]) ? l : r;
}
function findNumber(arr, target) {
  let mid;
  var l = 0;
  var r = arr.length - 1;
  while (l <= r) {
    mid = Math.floor((l + r) / 2);
    if (target === arr[mid]) {
      return mid;
    } else if (target > arr[mid]) {
      l = mid + 1;
    } else {
      r = mid - 1;
    }
  }
  return -1;
}

module.exports = { findClosestNumber, findNumber };
