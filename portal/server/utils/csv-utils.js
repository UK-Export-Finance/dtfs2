const convertToCsv = async (file) => {
  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    // Read the .xlsx file using exceljs
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer).then(async () => {
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
      const readStreamPromise = new Promise((resolve, reject) => {
        try {
          stream
            .pipe(
              csv(
                csv({
                  mapValues: ({ header, index, value }) => header.toLowerCase(),
                }),
              ),
            )
            .on('data', (row) => {
                parsedCsvData.push(row);
            })
            .on('end', () => {
              console.log('OAWDBOIWAAOIWDBAOWI');
              console.log(parsedCsvData);
              resolve();
            });
        } catch (error) {
          console.log(error);
          reject();
        }
      });
      await readStreamPromise;
      console.log('I SHOULD COME SECOND');

      // Create a writable stream for the new .csv file
      // const csvFileName = `${file.originalname.replace(/\.[^/.]+$/, '')}.csv`;
      // const csvPath = `uploads/${csvFileName}`;
      // const csvStream = fs.createWriteStream(csvPath);

      // // Write the CSV data to the stream
      // csvData.forEach((line) => {
      //   csvStream.write(`${line}\n`);
      // });
    });
    console.log('TESTEST')
  } else if (file.mimetype === 'text/csv') {
    // The binary of the data is in file.buffer
    // we use this data and pass it into csv-parser to get the data
    // out as JSON to work with
    const csvData = [];

    const stream = Readable.from(file.buffer);
    const readStreamPromise = new Promise((resolve, reject) => {
      try {
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
            resolve();
          });
      } catch (error) {
        console.log(error);
        reject();
      }
    });
    await readStreamPromise;
  }
  return { csvJson: {} };
};

module.exports = {
  convertToCsv,
};
