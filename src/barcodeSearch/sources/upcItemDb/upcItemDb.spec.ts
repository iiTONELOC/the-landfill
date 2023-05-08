import { describe, expect, it } from '@jest/globals';
import { IBarcodeLookupResult } from '../../types';
import { upcItemDb } from './';

describe('upcItemDb', () => {
    it('should be defined', () => {
        expect(upcItemDb).toBeDefined();
    });

    it('Should be able to lookup a barcode', async () => {
        const barcode = '037000962571'; // Frebreze

        const result: IBarcodeLookupResult | null = await upcItemDb(barcode);

        expect(result).toBeDefined();
        expect(result?.itemBarcode).toBe(barcode);
        expect(result?.itemName).toBe('Febreze Odor-Fighting Air Freshener  Heavy Duty Crisp Clean  8.8 oz');
    });

    it('Should return null if the barcode wasn\'t found in their database', async () => {
        const barcode = '074780343183'; // perrier l'orange 11.15 oz

        const result: IBarcodeLookupResult | null = await upcItemDb(barcode);

        expect(result).toBeNull();
    });
});