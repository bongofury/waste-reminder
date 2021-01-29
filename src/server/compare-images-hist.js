const { HistAxes } = require('opencv4nodejs');
const cv = require('opencv4nodejs');

const histAxesH = new HistAxes({
  channel: 0,
  bins: 10,
  ranges: [0, 180],
});

const histAxesS = new HistAxes({
  channel: 1,
  bins: 20,
  ranges: [0, 256],
});

module.exports = function compareImages(image1, image2) {
  return new Promise((resolve) => {
    const a = cv.imread(image1);
    const b = cv.imread(image2);

    const hsvA = a.cvtColor(cv.COLOR_BGR2HSV);
    const hsvB = b.cvtColor(cv.COLOR_BGR2HSV);

    let histA = cv.calcHist(hsvA, [
      histAxesH,
      histAxesS,
    ]);

    let histB = cv.calcHist(hsvB, [
      histAxesH,
      histAxesS,
    ]);

    histA = histA.convertTo(cv.CV_32F);
    histB = histB.convertTo(cv.CV_32F);

    histA = histA.normalize(0, 1, cv.NORM_MINMAX);
    histB = histB.normalize(0, 1, cv.NORM_MINMAX);

    const result = histA.compareHist(histB, 0);

    resolve(result > 0.98);
  });
};
