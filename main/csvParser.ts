
import * as fs from 'fs';
import { TestData } from '../main/testData';
import { parse } from 'csv-parse';



export class CsvParser {

    public static async readCsv(filePath): Promise<TestData[]> {

        const results: TestData[] = [];
        const parser = parse({
            delimiter: ','
          });

        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
            .pipe(parser)
            .on('data', (data: any) => results.push(data as TestData))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
        });
    }

    public static async csvToJson(csvLine: string, headers: string[]): Promise<object> {
        const values = csvLine.split(',');
        const jsonObject: { [key: string]: string } = {};
      
        for (let i = 0; i < headers.length; i++) {
          jsonObject[headers[i]] = values[i];
        }
      
        return jsonObject;
    }

}