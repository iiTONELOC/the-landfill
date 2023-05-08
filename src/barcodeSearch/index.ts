import { IBarcodeLookupResult } from './types';
import { barcodeIndex, upcItemDb, barcodeSpider } from './sources';

const EAN_LENGTH = 13;

const lookupMethods = {
    barcodeIndex,
    upcItemDb,
    barcodeSpider
};

// seal the object so it can't be modified
Object.seal(lookupMethods);


/**
 * Tries to look up a barcode on the internet using our
 * pre-defined lookup methods
 * @param barcode A string representing the barcode to look up
 * @returns A BarcodeLookupResult object or null if no results were found
 * @example
 * ``` js
 * const barcodeInfo = await barcodeSearch('123456789012');
 * console.log(barcodeInfo);
 *
 * // expected output:
 * ```
 *
 * ```json
 * {
 *  "itemBarcode": "123456789012",
 *  "itemName": "Item Name",
 *  "source": {
 *      "url": "https://barcodeindex.com/upc/123456789012",
 *      "name": "Barcode Index"
 *   }
 * }
 * ```
 */
export async function barcodeSearch(barcode: string): Promise<IBarcodeLookupResult | null> {
    // holds our result
    let barcodeInfo: IBarcodeLookupResult | null = null;

    // if the barcode is not a string, return null
    if (typeof barcode !== 'string') {
        return barcodeInfo;
    }

    if (barcode.length === EAN_LENGTH) {
        // we need to remove the first digit of the barcode to make it UPC compatible
        // this makes for a more accurate lookup
        barcode = barcode.slice(0);
    }

    const methods: string[] = Object.keys(lookupMethods);

    for (const method of methods) {

        // eslint-disable-next-line
        // @ts-ignore
        const result: IBarcodeLookupResult = await lookupMethods[`${method}`](barcode);

        if (result) {
            barcodeInfo = result;
            break;
        }
    }

    return barcodeInfo;
}
