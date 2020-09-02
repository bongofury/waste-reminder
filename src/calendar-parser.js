const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const sharp = require('sharp');
const { Poppler } = require('node-poppler');
const compareImages = require('./compare-images');

const poppler = new Poppler('/usr/bin');

const readDir = promisify(fs.readdir);

const TMP_DIR = './tmp/calendar';
const DAYS_DIR = path.join(TMP_DIR, 'days');
const MONTHS_DIR = path.join(TMP_DIR, 'months');
const SAMPLES_DIR = './input/service-samples';
const CUR_YEAR = '2020';
const OUTPUT_JSON = './output/service-calendar.json';

const pagesToPng = (inputPdf) => {
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
  console.log(monthNum);
  for (let i = 0; i < daysInMonth(monthNum); i += 1) {
    for (let j = 0; j < 3; j += 1) {
      const outputFile = `${DAYS_DIR}/${CUR_YEAR}${(String(monthNum)).padStart(2, '0')}${(String(i + 1)).padStart(2, '0')}-${j}.png`;
      console.log(outputFile);
      // eslint-disable-next-line no-await-in-loop
      await month.extract({
        width: 70,
        height: 68,
        left: 350 + (parseInt(i / 16, 10) * 430 + (j * 72)),
        top: 200 + ((i % 16) * 74),
      }).toFile(outputFile);
    }
  }
};

const findDayServices = async (dayString) => {
  const allFiles = await readDir(DAYS_DIR);
  const dayFiles = allFiles.filter((f) => f.startsWith(dayString));
  console.log(dayFiles);
  const serviceSamples = await readDir(SAMPLES_DIR);
  const allPromises = dayFiles.reduce((acc, dayFile) => (
    [
      ...acc,
      ...serviceSamples.map((service) => compareImages(
        path.join(SAMPLES_DIR, service),
        path.join(DAYS_DIR, dayFile),
        service,
      )),
    ]
  ), []);
  return Promise.all(allPromises);
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
  const results = await Promise.all(
    samplesData.map(({ name: serviceName, path: servicePath }) => (
      compareImages(currentImgPath, servicePath, serviceName)
    )),
  );

  const serviceFound = results
    .filter(({ rawMisMatchPercentage: p = 100 }) => p < 2)
    .sort((
      { rawMisMatchPercentage: p1 },
      { rawMisMatchPercentage: p2 },
    ) => p1 - p2);
  return serviceFound.length
    ? (serviceFound[0] && serviceFound[0].result)
    : null;
};

const createServiceCalendar = async () => {
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
  await pagesToPng('./input/casarile-2020-ok.pdf')
    .then((monthImgsPaths) => Promise.all(
      monthImgsPaths.map(dailyServicesImgsFromMonth),
    ))
    .then(createServiceCalendar)
    .then(writeOutput);
};

parsePdf();

module.exports = {
  parsePdf,
};
