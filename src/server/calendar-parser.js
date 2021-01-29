const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const sharp = require('sharp');
const { Poppler } = require('node-poppler');
const compareImages = require('./compare-images-hist');

const poppler = new Poppler('/usr/bin');

const readDir = promisify(fs.readdir);

const TMP_DIR = './tmp/calendar';
const DAYS_DIR = path.join(TMP_DIR, 'days');
const MONTHS_DIR = path.join(TMP_DIR, 'months');
const SAMPLES_DIR = '../../input/service-samples';
const CUR_YEAR = (new Date()).getFullYear();
const OUTPUT_JSON = '../../output/service-calendar.json';

const pagesToPng = (inputPdf) => {
  console.log('1/3 Getting pages from pdf');
  const pages = [7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29];

  const pagesToPngPromises = pages.map((p, idx) => {
    const options = {
      firstPageToConvert: p,
      lastPageToConvert: p,
      pngFile: true,
      singleFile: true,
    };
    const outputPath = `${MONTHS_DIR}/month-${idx + 1}`;
    return poppler.pdfToCairo(options, inputPdf, outputPath)
      .then(() => `${outputPath}.png`);
  });

  return Promise.all(pagesToPngPromises);
};

const daysInMonth = (monthNum, fullYear = new Date().getFullYear()) => (
  new Date(fullYear, monthNum, 0).getDate()
);

const dailyServicesImgsFromMonth = async (monthImg) => {
  const month = sharp(monthImg);
  const monthNum = parseInt(monthImg.split('-')[1], 10);
  for (let i = 0; i < daysInMonth(monthNum); i += 1) {
    for (let j = 0; j < 3; j += 1) {
      const outputFile = `${DAYS_DIR}/${CUR_YEAR}${(String(monthNum)).padStart(2, '0')}${(String(i + 1)).padStart(2, '0')}-${j}.png`;
      // eslint-disable-next-line no-await-in-loop
      await month.extract({
        width: 65,
        height: 60,
        left: 355 + (parseInt(i / 16, 10) * 430 + (j * 72)),
        top: 265 + ((i % 16) * 74),
      }).toFile(outputFile);
    }
  }
};

const getInfoFromFilename = (fileName) => (
  fileName && (fileName.split('.')[0]).split('-')[0]
);

const initServiceSamplesData = async () => {
  const fileNames = await readDir(SAMPLES_DIR);
  return fileNames.map((f) => ({
    path: path.join(SAMPLES_DIR, f),
    name: getInfoFromFilename(f),
  }));
};

const findServiceGivenImg = async (currentImgPath, samplesData) => {
  const serviceResults = await Promise.all(
    samplesData.map(({ name: serviceName, path: servicePath }) => (
      compareImages(currentImgPath, servicePath).then(
        (isMatching) => isMatching && serviceName,
      )
    )),
  );

  const serviceMatching = serviceResults
    .filter(Boolean);

  if (serviceMatching.length > 1) {
    throw (new Error('Not sure for a service, more than one matching'));
  }

  return serviceMatching.length === 1
    ? serviceMatching[0]
    : null;
};

const createServiceCalendar = async () => {
  console.log('2/3 Recognizing services from images data');
  const allDayServiceFiles = await readDir(DAYS_DIR);
  const samplesData = await initServiceSamplesData();
  const allMatches = await Promise.all(
    allDayServiceFiles.map(
      (file) => findServiceGivenImg(
        path.join(DAYS_DIR, file),
        samplesData,
      ).then((service) => service && [file, service]),
    ),
  );
  return allMatches
    .filter(Boolean)
    .reduce((calendar, [file, service]) => {
      const dayString = getInfoFromFilename(file);
      // eslint-disable-next-line no-param-reassign
      calendar[dayString] = [...(calendar[dayString] || []), service];
      return calendar;
    }, {});
};

const writeOutput = (data) => {
  fs.writeFileSync(
    OUTPUT_JSON,
    // stringify and let arrays on one line
    JSON.stringify(
      data,
      null,
      2,
    ),
  );
};

const parsePdf = async () => {
  await pagesToPng('../../input/casarile-2021-ok.pdf')
    .then((monthImgsPaths) => {
      console.log('3/3 Splitting month images into single service images');
      return Promise.all(
        monthImgsPaths.map(dailyServicesImgsFromMonth),
      );
    })
    .then(createServiceCalendar)
    .then(writeOutput);
  console.log('Done, calendar written to', OUTPUT_JSON);
};

parsePdf();

module.exports = {
  parsePdf,
};
