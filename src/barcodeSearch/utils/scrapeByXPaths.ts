import { JSDOM } from 'jsdom';
import { IxPath, IxPathLookUpResult } from '../types';
/**
 * Fetches a URL and scrapes the HTML using the provided xPaths
 * @param xPaths An array of IxPath objects to use for scraping
 * @param url The URL to fetch
 * @returns An array of xPathLookUpResult objects or null if no results were found
 * @example
 * ``` ts
 * // example of an IxPath object
 * interface IxPath {
 *   key: string;
 *   value: string;
 * }
 * ```
 * ``` js
 *
 * // Example data is for example purposes only and the xPaths are not valid
 * const xPaths = [
 *    { key: 'itemBarcode',
 *      value: '/html/body/main/div/div/div[1]1'
 *    },
 *    { key: 'itemName',
 *      value: '/html/body/main/div/div/div[1]2'
 *    }
 * ];
 *
 * const results = await scrapeByXPaths(xPaths, 'https://barcodeindex.com/upc/123456789012');
 * console.log(results);
 *
 * // expected output:
 * ```
 * ```json
 * [
 *  { "pathName": "itemBarcode", "result": "123456789012" },
 *  { "pathName": "itemName", "result": "Item Name" }
 * ]
 * ```
 * */
export async function scrapeByXPaths(xPaths: IxPath[], url: string): Promise<IxPathLookUpResult[] | null> {
    try {
        const response = await fetch(url);
        const data = await response.text();
        // mount the HTML into a JSDOM object
        const dom = new JSDOM(data);

        const results: IxPathLookUpResult[] = [];

        for (const { key: pathName, value } of xPaths) {
            const result = dom.window.document
                .evaluate(value, dom.window.document, null, 2, null).stringValue;
            results.push({ pathName, result });
        }

        return results.length > 0 ? results : null;
    } catch (error) {
        console.error('Error using scrapeByXPaths: ', error);
        return null;
    }
}


export const cantReturn = (itemBarcode: string, itemName: string): boolean => itemBarcode === ''
    || itemName === ''
    || itemName.includes('has no record in our database')