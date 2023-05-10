import { scrapeByXPaths, cantReturn } from '../../utils/scrapeByXPaths';
import { IBarcodeLookupResult, IxPath, IxPathLookUpResult } from '../../types';

export const upcItemDb = async (barcode: string): Promise<IBarcodeLookupResult | null> => {
    let itemBarcode = '',
        itemName = '';

    const url = `https://www.upcitemdb.com/upc/${barcode}`;
    const xPaths: IxPath[] = [
        {
            key: 'itemBarcode',
            value: '/html/body/div[1]/div/h2'
        },
        {
            key: 'itemName',
            value: '/html/body/div[1]/div/p'
        }
    ];

    const results: IxPathLookUpResult[] | null = await scrapeByXPaths(xPaths, url);

    if (results) {
        for (const { pathName, result } of results) {
            if (pathName === 'itemBarcode') {
                itemBarcode = result?.replace('UPC', '')?.trim();
            }

            if (pathName === 'itemName') {
                itemName = result?.trim();

                itemName.includes('with') && (
                    itemName = itemName
                        .split('with')[1]
                        .trim()
                );
            }
        }

        const _cantReturn = cantReturn(itemBarcode, itemName) || itemName.includes('invalid');

        return _cantReturn ? null : {
            itemBarcode, itemName, source: {
                url,
                name: 'upcItemDb'
            }
        };

    } else {
        return null;
    }
};
