import { describe, expect, it } from '@jest/globals';
import { IBarcodeLookupResult } from '../../types';
import { barcodeSpider } from './';

describe('barcodeSpider', () => {
    it('should be defined', () => {
        expect(true).toBe(true);
    });

    it('Should be able to lookup a barcode', async () => {
        const barcode = '037000962571'; // Frebreze

        const result: IBarcodeLookupResult | null = await barcodeSpider(barcode);

        expect(result).toBeDefined();
        expect(result?.itemBarcode).toBe(barcode);
        expect(result?.itemName).toBe('Febreze Air Freshener Heavy Duty, Crisp Clean (1 Count, 8.8 Oz)');
    });


    it('Should return null if the barcode wasn\'t found in their database', async () => {
        const barcode = '074780343183'; // perrier l'orange 11.15 oz

        const result: IBarcodeLookupResult | null = await barcodeSpider(barcode);

        expect(result).toBeNull();
    });
});