const ExcelJS = require('exceljs');
const csv = require('csv-parser');
const { Readable } = require('stream');

const getUtilisationReportUpload = async (req, res) => {
  try {
    return res.render('utilisation-reporting-service/utilisation-report-upload/utilisation-report-upload.njk', {
      user: req.session.user,
      primaryNav: 'utilisation_report_upload',
    });
  } catch (error) {
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};

const postUtilisationReportUpload = async (req, res) => {
  try {
    let validationError;
    let errorSummary;
    if (res?.locals?.fileUploadError) {
      errorSummary = [
        {
          text: res?.locals?.fileUploadError?.text,
          href: '#utilisation-report-file-upload',
        },
      ];
      validationError = res?.locals?.fileUploadError;
    } else if (!req?.file) {
      errorSummary = [
        {
          text: 'You must upload a file',
          href: '#utilisation-report-file-upload',
        },
      ];
      validationError = { text: 'You must upload a file' };
    }
    if (validationError || errorSummary) {
      return res.render('utilisation-reporting-service/utilisation-report-upload/utilisation-report-upload.njk', {
        validationError,
        errorSummary,
        user: req.session.user,
        primaryNav: 'utilisation_report_upload',
      });
    }

    console.log(123123123);
    const { fileData, jsonData } = extractCsvData(req.file);
    // validateCsvData(csvData);
    if (errors) {
      return res.render('data-errors.njk');
    }
    saveFileToSession(csvFile);
    return res.render('utilisation-reporting-service/utilisation-report-upload/utilisation-report-upload.njk');
  } catch (error) {
    console.log(error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};

const convertToCsv = (file) => {
  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    // Read the .xlsx file using exceljs
    const workbook = new ExcelJS.Workbook();
    workbook.xlsx.load(file.buffer).then(() => {
      const worksheet = workbook.getWorksheet(1); // Assume the utilisation report data is on sheet 1
      const csvData = [];

      // Iterate through rows and columns and extract data
      worksheet.eachRow((row, rowNumber) => {
        const rowData = [];
        row.eachCell((cell) => {
          rowData.push(cell.value);
        });
        csvData.push(rowData.join(','));
      });

      console.log(csvData);
      console.log(csvData.length);
      const stream = new Readable({
        read() {
          for (const line of csvData) {
            this.push(line + '\n'); // Add newline to simulate line-by-line reading
          }
          this.push(null); // End the stream
        },
      });
      const parsedCsvData = [];
      stream
        .pipe(
          csv({
            mapValues: ({ header, index, value }) => header.toLowerCase(),
          }),
        )
        .on('data', (row) => {
          console.log('OOOOOO');
          console.log(row);
          parsedCsvData.push(row);
        })
        .on('end', () => {
          console.log('OAWDOOADW');
          console.log(parsedCsvData);
        });

      // Create a writable stream for the new .csv file
      // const csvFileName = `${file.originalname.replace(/\.[^/.]+$/, '')}.csv`;
      // const csvPath = `uploads/${csvFileName}`;
      // const csvStream = fs.createWriteStream(csvPath);

      // // Write the CSV data to the stream
      // csvData.forEach((line) => {
      //   csvStream.write(`${line}\n`);
      // });
    });
  } else if (file.mimetype === 'text/csv') {
    // The binary of the data is in file.buffer
    // we use this data and pass it into csv-parser to get the data
    // out as JSON to work with
    const csvData = [];

    const stream = Readable.from(file.buffer);
    stream
      .pipe(
        csv(
          csv({
            mapValues: ({ header, index, value }) => header.toLowerCase(),
          }),
        ),
      )
      .on('data', (row) => {
        csvData.push(row);
      })
      .on('end', () => {
        console.log('OAWDBOIWAAOIWDBAOWI');
        console.log(csvData);
      });
  }
  return true;
};

const validateCsvData = (csvData) => {
  return true;
};

const saveFileToSession = (csvFile) => {
  return true;
};

module.exports = {
  getUtilisationReportUpload,
  postUtilisationReportUpload,
};
