import {URL_MAPPING} from "../../constants/url_mapper.js";
import puppeteer from "puppeteer";
import _ from 'lodash';
import moment from "moment";
import { CATEGORY_MAPPER } from "../../constants/category_mapper.js";
// This is a skeleton for a custom service class. Remove or add the methods you need here
export class DataCrawlerService {

  constructor(options,app) {
    this.options = options
    this.app = app;
  }

  async find(_params) {
    const { category, crawlingTo } = _params.query;

    if(!category || !crawlingTo) return 'Missing Params'

    const url_array_holder = [];

    let i = 1;

    while (i <= parseInt(crawlingTo)) {
      url_array_holder.push(URL_MAPPING(category, i));

      i+=1;
    }

    let data_holder = []

    for (let i = 0; i < url_array_holder.length; i++) {
      const data = await this.crawlData(url_array_holder[i]);
      data_holder.push(data);
    };

    data_holder = data_holder.map((eachPage, i) => {
      const dataTitles = _.get(eachPage, 'titles', []);
      const dataDetails = _.get(eachPage, 'details', []);
  
      const fullData = dataTitles.map((title, index) => {
        try {
          return {
            ..._.merge(title, dataDetails[index])
          };
        } catch (error) {
          return {
            ...title,
            "Loại doanh nghiệp": 'N/A',
            "Địa chỉ": 'N/A',
            "Giấy phép kinh doanh lữ hành số": "N/A",
            "Ngày cấp": 'N/A',
            "Điện thoại": 'N/A',
            "Email": 'N/A',
            "Website": 'N/A',
          }
        }
      })
      return fullData;
    })

    const flatten = _.flatten(data_holder).map((data, index) => ({"index": index + 1, ...data }))

    try {
      // Create Excel Linkß
      const excelLink = await this.app.service('save-excel').create({
        filename: `data_quanlyluhanh_${CATEGORY_MAPPER[category]}_${moment().utc("+0070").format("DDMMYYYY_HHmmSS")}.xlsx`,
        sheets: [
          {
            name: `data_${CATEGORY_MAPPER[category]}`,
            data: flatten
          }
        ]
      });
      return excelLink;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async get(id, _params) {
    return {
      id: 0,
      text: `A new message with ID: ${id}!`
    }
  }
  async create(data, params) {
    if (Array.isArray(data)) {
      return Promise.all(data.map((current) => this.create(current, params)))
    }

    return {
      id: 0,
      ...data
    }
  }

  // This method has to be added to the 'methods' option to make it available to clients
  async update(id, data, _params) {
    return {
      id: 0,
      ...data
    }
  }

  async patch(id, data, _params) {
    return {
      id: 0,
      text: `Fallback for ${id}`,
      ...data
    }
  }

  async remove(id, _params) {
    return {
      id: 0,
      text: 'removed'
    }
  }

  async wait(unit){
    return new Promise((resolve) => setTimeout(resolve, unit));
  }

  async crawlData(url){
    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(url);

      const data = await page.evaluate(() => {
        const titles = [];
        const details = [];
        // Crawl Title
        let company_name_wrapper = document.querySelectorAll('.company-name');
        company_name_wrapper.forEach((company_name) => {
          let dataJson = {
            "Tên tiếng việt": "N/A",
            "Tên tiếng anh": "N/A"
          };
          try {
            const vietnameseTitle = company_name.querySelector('.tendn').innerText;
            
            if(vietnameseTitle){
              const splitted = vietnameseTitle.split(": ");
              dataJson["Tên tiếng việt"] = splitted[splitted.length - 1];
            }

          }
          catch (err) {
              console.log(err)
          }

          try {
            const englishTitle = company_name.querySelector('.tengiaodich').innerText;
            
            if(englishTitle){
              const splitted = englishTitle.split(": ");
              dataJson["Tên tiếng anh"] = splitted[splitted.length - 1];
            }
          }
          catch (err) {
              console.log(err)
          }
          titles.push(dataJson);
        });
        // Crawl Detailed Information

        let detailed_information_wrapper = document.querySelectorAll('.other-info');

        detailed_information_wrapper.forEach((detail) => {
          const information_data = {
            "Loại doanh nghiệp": 'N/A',
            "Địa chỉ": 'N/A',
            "Giấy phép kinh doanh lữ hành số": "N/A",
            "Ngày cấp": 'N/A',
            "Điện thoại": 'N/A',
            "Email": 'N/A',
            "Website": 'N/A',
          }
          try {
            const crawled_info = detail.innerText || 'N/A'

            const crawled_info_arr = crawled_info.split('\n');

            crawled_info_arr.forEach((info_line) => {
              const content = info_line.split(': ');
              information_data[content[0]] = content[1];
            })
          } catch (error) {
            console.log(error);
          }
          details.push(information_data);
        })

        return {
          titles,
          details
        };
      });
      await browser.close();
      return data;
    } catch (error) {
      console.log("Error why crawling data from: ", url)
    }
    
  }
}

export const getOptions = (app) => {
  return { app }
}
