// Barcode Scraping
export interface IBarcodeLookupResult {
    itemBarcode: string;
    itemName: string;
    source: {
        url: string;
        name: string;
    };
}

export interface IxPath {
    key: string;
    value: string;
}

export interface IxPathLookUpResult {
    pathName: string;
    result: string;
}
