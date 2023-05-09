import 'dotenv/config';
import { GraphQLError } from 'graphql';
import { addUserProductMutationArgs } from '../types';
import { barcodeSearch } from '../../../barcodeSearch';
import { UserProduct, Product, Source } from '../../../db/Models';
import authenticatedUser from '../../../auth/isAuthenticated';
import { AuthenticatedContext, UserProductModel, ProductModel, IBarcodeLookupResult, SourceModel } from '../../../types';



export const userProductQueries = {
};

export const userProductMutations = {
    addUserProduct: async (_: any, { userId, barcode }: addUserProductMutationArgs, { user }: AuthenticatedContext) => {
        if (!user) {
            throw new GraphQLError('You must be logged in to add a product to your list.');
        }
        // check if the user is authenticated
        await authenticatedUser(user._id);

        // tracks product information from our database
        let product: ProductModel | null = null;

        // Look for the userProduct in the database by barcode and userId
        const existingUserProduct: UserProductModel | null = await UserProduct.findOne({ //NOSONAR
            userId: userId, barcode: { $in: [barcode] }
        }).catch((err: Error) => {
            throw new GraphQLError(err.message);
        });

        // If the userProduct exists, return it
        if (existingUserProduct) {
            return existingUserProduct;
        }

        // If the userProduct does not exist, create it:
        // first, try to see if the product already exists in the database by barcode

        const existingProduct: ProductModel | null = await Product.findOne({ barcode: { $in: [barcode] } });

        // if the product exists, use it, otherwise create a new product
        if (existingProduct) {
            product = existingProduct;
        } else {
            // the product doesn't exist in the database, so we need to search for the product information
            // using the barcodeSearch Module
            const barcodeSearchData: IBarcodeLookupResult | null = await barcodeSearch(barcode);

            // if the data is null that means that the barcodeSearch module did not find any data

            const sourceName = barcodeSearchData?.source?.name || 'User Added';
            const url: string | undefined = barcodeSearchData?.source?.url || undefined;
            const name: string | undefined = barcodeSearchData?.itemName || 'Product not found';
            const _barcode: string | undefined = barcodeSearchData?.itemBarcode || undefined;


            // lookup the source
            let source: SourceModel | null = await Source.findOne({ name: { $in: [sourceName] } });

            // if the source exists, use it, otherwise create a new source
            if (!source) {
                source = await Source.create({ name: sourceName, url }).catch(_ => {
                    throw new GraphQLError('Error creating a source for a user product.');
                });
            }

            // create the product
            product = await Product.create({ name, barcode: _barcode, source: source._id }).catch((err: Error) => {
                throw new GraphQLError('Error creating a product for a user product.');
            });
        }

        // create the userProduct
        const userProduct: UserProductModel | null = await UserProduct
            .create({ userId, barcode, productData: product._id })
            .catch((err: Error) => {
                throw new GraphQLError('Error creating a user product.');
            });

        // if there is no userProduct, throw an error
        if (!userProduct) {
            throw new GraphQLError('Error creating a user product.');
        }

        const requestedProduct = UserProduct.findOne({ _id: userProduct._id })
            .select('-__v')
            .populate({ path: 'productData', select: '-__v -source' });

        return requestedProduct;
    },
};

export const userProductController = {
    userProductQueries,
    userProductMutations
};

export default userProductController;
