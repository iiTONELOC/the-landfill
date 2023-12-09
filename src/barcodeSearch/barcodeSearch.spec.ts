import { describe, expect, it } from '@jest/globals';
// import { IBarcodeLookupResult } from './types';
import { barcodeSearch } from '.';

describe('barcodeSearch', () => {
    it('should be defined', () => {
        expect(barcodeSearch).toBeDefined();
    });

    // it('should return null if the barcode is not a string', async () => {
    //     const barcodeInfo: IBarcodeLookupResult | null = await barcodeSearch(123456789012 as unknown as string);
    //     expect(barcodeInfo).toBeNull();
    // });

    // it('should return null if the barcode was not found', async () => {
    //     const barcodeInfo: IBarcodeLookupResult | null = await barcodeSearch('074780343184');
    //     expect(barcodeInfo).toBeNull();
    // });

    // it('should return a barcode lookup result if the barcode was found', async () => {
    //     const barcodeInfo: IBarcodeLookupResult | null = await barcodeSearch('037000962571');
    //     expect(barcodeInfo).toBeDefined();
    //     expect(barcodeInfo?.itemBarcode).toBe('037000962571');
    //     expect(barcodeInfo?.itemName).toBe('Febreze Odor-Eliminating Air Freshener, Heavy Duty Crisp Clean, 8.8 fl oz');
    // });
});