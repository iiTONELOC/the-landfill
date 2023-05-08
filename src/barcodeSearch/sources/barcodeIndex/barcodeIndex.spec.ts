import { describe, expect, it } from '@jest/globals';
import { IBarcodeLookupResult } from '../../types';
import { barcodeIndex } from './';

describe('barcodeIndex', () => {
    it('should be defined', () => {
        expect(true).toBe(true);
    });

    it('Should be able to lookup a barcode', async () => {
        const barcode = '037000962571'; // Frebreze

        const result: IBarcodeLookupResult | null = await barcodeIndex(barcode);

        expect(result).toBeDefined();
        expect(result?.itemBarcode).toBe(barcode);
        expect(result?.itemName).toBe('Febreze Odor-Eliminating Air Freshener, Heavy Duty Crisp Clean, 8.8 fl oz');
    });


    it('Should return null if the barcode wasn\'t found in their database', async () => {
        const barcode = '074780343184'; // made up barcode

        const result: IBarcodeLookupResult | null = await barcodeIndex(barcode);

        expect(result).toBeNull();
    });
});