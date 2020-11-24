const resemble = require('resemblejs');

module.exports = function compareImages(image1, image2, result) {
  return new Promise((resolve, reject) => {
    resemble.compare(
      image1,
      image2,
      {
        ignore: 'antialiasing',
        // scaleToSameSize: true,
        output: {
          boundingBox: {
            left: 15,
            top: 15,
            right: 40,
            bottom: 40,
          },
        },
      }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(Object.assign(data, { result }));
        }
      },
    );
  });
};
