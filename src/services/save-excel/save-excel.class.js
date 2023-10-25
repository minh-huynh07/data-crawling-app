import moment from "moment";
import fs from 'fs';
import config from 'config';
import _ from 'lodash';
import ExcelJS from 'exceljs';

export class SaveExcelService {
  constructor(options) {
    this.options = options
    this.staticDomain = _.get(config, 'staticDomain')
  }

  async create(data, params) {
    const { filename, sheets } = data;
    console.log(filename, sheets)
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Younet Group';
    workbook.created = new Date();

    // eslint-disable-next-line no-restricted-syntax
    for (const sheetConfig of sheets) {
      const worksheet = workbook.addWorksheet(sheetConfig.name);
      const sheetData = !Array.isArray(sheetConfig.data) ? [sheetConfig.data] : sheetConfig.data;

      this.fillDataToWorksheet(worksheet, sheetData);
    }

    const { path: saveFolderPath, publicPath } = this.generateSaveFolderPath();
    // create uploads folder if not exists
    if (!fs.existsSync('public/uploads')) {
      // create folder
      fs.mkdirSync('public/uploads');
    }

    if (!fs.existsSync(saveFolderPath)) {
      // create folder
      fs.mkdirSync(saveFolderPath);
    }

    const savePath = `${saveFolderPath}/${filename}`;

    await workbook.xlsx.writeFile(savePath);
    return {
      status: 'ok',
      link: `${this.staticDomain}/${publicPath}/${filename}`
    };
  }

  /**
   *
   * @param {ExcelJS.Worksheet} worksheet
   * @param {any[]} data
   */
  // eslint-disable-next-line class-methods-use-this
  fillDataToWorksheet(worksheet, data) {
    if (!data.length) {
      return;
    }

    let tableColumns = [];
    const tableRows = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const dataItem of data) {
      tableColumns.push(...Object.keys(dataItem));
    }

    tableColumns = [...new Set(tableColumns)];
    tableColumns = tableColumns.map(columnName => ({
      name: columnName
    }));

    // eslint-disable-next-line no-restricted-syntax
    for (const dataItem of data) {
      const row = tableColumns.map(({ name }) => typeof dataItem[name] === 'undefined' ? "N/A" : dataItem[name]);

      tableRows.push(row);
    }

    worksheet.addTable({
      name: 'MyTable',
      ref: 'A1',
      headerRow: true,
      totalsRow: false,
      style: {
        theme: 'TableStyleLight1',
        showRowStripes: true
      },
      columns: tableColumns,
      rows: tableRows
    });
  }

  // eslint-disable-next-line class-methods-use-this
  generateSaveFolderPath() {
    const currdate = new Date(moment().utcOffset("+0070"));
    const year = currdate.getFullYear();
    const month = currdate.getMonth() <= 9 ? `0${currdate.getMonth() + 1}` : currdate.getMonth + 1;
    const date = currdate.getDate();

    const dateFolderName = `${year}-${month}-${date}`;

    return {
      path: `public/uploads/${dateFolderName}`,
      publicPath: `uploads/${dateFolderName}`
    }
  }
}

export const getOptions = (app) => {
  return { app }
}
