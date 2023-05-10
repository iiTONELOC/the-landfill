import { scrapeByXPaths, cantReturn } from '../../utils/scrapeByXPaths';
import { IBarcodeLookupResult, IxPath, IxPathLookUpResult } from '../../types';

export const barcodeIndex = async (barcode: string): Promise<IBarcodeLookupResult | null> => {
    const url = `https://barcodeindex.com/upc/${barcode}`;

    const xPaths: IxPath[] = [
        {
            key: 'itemBarcode',
            value: '/html/body/main/div/div/div[1]/section[1]/div/div/div/div[2]/h1'
        },
        {
            key: 'itemName',
            value: '/html/body/main/div/div/div[1]/section[1]/div/div/div/div[2]/h2'
        }
    ];

    const results: IxPathLookUpResult[] | null = await scrapeByXPaths(xPaths, url);

    if (results) {
        let itemBarcode = '',
            itemName = '';

        for (const { pathName, result } of results) {
            // Format the results

            if (pathName === 'itemBarcode') {
                itemBarcode = result?.replace('UPC', '')?.trim();
            }

            if (pathName === 'itemName') {
                itemName = result?.replace('Barcode for', '')?.trim();
            }
        }

        const _cantReturn = cantReturn(itemBarcode, itemName);

        return _cantReturn ? null : {
            itemBarcode, itemName, source: {
                url,
                name: 'barcodeIndex'
            }
        };
    } else {
        return null;
    }
};
