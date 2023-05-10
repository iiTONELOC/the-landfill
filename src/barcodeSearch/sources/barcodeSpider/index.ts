import { scrapeByXPaths, cantReturn } from '../../utils/scrapeByXPaths';
import { IBarcodeLookupResult, IxPath, IxPathLookUpResult } from '../../types';

export const barcodeSpider = async (barcode: string): Promise<IBarcodeLookupResult | null> => {
    let itemBarcode = '',
        itemName = '';

    const url = `https://www.barcodespider.com/${barcode}`;
    const xPaths: IxPath[] = [
        {
            key: 'itemBarcode',
            value: '/html/body/div/section[2]/div/div/div/div[2]/div/h1'
        },
        {
            key: 'itemName',
            value: '/html/body/div/section[2]/div/div/div/div[2]/div/div[1]/h2'
        }
    ];

    const results: IxPathLookUpResult[] | null = await scrapeByXPaths(xPaths, url);

    if (results) {
        for (const { pathName, result } of results) {
            if (pathName === 'itemBarcode') {
                itemBarcode = result?.replace('UPC', '')?.replace(/[lL]ookup/, '')?.trim();
            }

            if (pathName === 'itemName') {
                itemName = result?.trim();
            }
        }

        const _cantReturn = cantReturn(itemBarcode, itemName);

        return _cantReturn ? null : {
            itemBarcode, itemName, source: {
                url,
                name: 'BarcodeSpider'
            }
        };
    } else {
        return null;
    }
};
