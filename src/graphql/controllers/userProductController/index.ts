import 'dotenv/config';
import { GraphQLError } from 'graphql';
import { barcodeSearch } from '../../../barcodeSearch';
import authenticatedUser from '../../../auth/isAuthenticated';
import { UserProduct, Product, Source } from '../../../db/Models';
import { addUserProductMutationArgs, editUserProductMutationArgs } from '../types';
import { AuthenticatedContext, UserProductModel, ProductModel, IBarcodeLookupResult, SourceModel, UserModel } from '../../../types';


export const userProductMutations = {
    addUserProduct: async (_: any, { userId, barcode }: addUserProductMutationArgs, { user }: AuthenticatedContext) => {
        await authenticatedUser(user as UserModel);

        // tracks product information from our database
        let product: ProductModel | null = null;

        const existingProduct: ProductModel | null = await Product.findOne({ barcode: { $in: [barcode] } })
            .exec()
            .catch((err: Error) => {
                throw new GraphQLError(err.message);
            });

        // Look for the userProduct in the database by barcode and userId
        const existingUserProduct: UserProductModel | null = await UserProduct.findOne({
            userId
        }).where('productData')
            .equals(existingProduct?._id)
            .populate({ path: 'productData', populate: { path: 'source' } })
            .catch((err: Error) => {
                throw new GraphQLError(err.message);
            });

        // If the userProduct exists, return it
        if (existingUserProduct) {
            return existingUserProduct;
        }

        // user product doesn't exist, so we will need to create it.
        // check for an existing product in the database
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
            let source: SourceModel | null = await Source.findOne({ name: { $in: [sourceName] } })
                .exec().catch((_: Error) => {
                    throw new GraphQLError('Error looking up a source for a user product.');
                });

            // if the source exists, use it, otherwise create a new source
            if (!source) {
                source = await Source.create({ name: sourceName, urlToSearchResult: url }).catch(_ => {
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
            .catch((_: Error) => {
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
    updateUserProduct: async (_: any, { userProductId, productAlias }: editUserProductMutationArgs, { user }: AuthenticatedContext) => {
        await authenticatedUser(user as UserModel);

        // Look for the userProduct in the database by barcode and userId
        const updatedProduct = await UserProduct.findOneAndUpdate({ //NOSONAR
            _id: userProductId, userId: user?._id
        }, { productAlias }, { new: true, runValidators: true })
            .select('-__v')
            .populate({ path: 'productData', select: '-__v -source' }).catch((err: Error) => {
                throw new GraphQLError(err.message);
            });

        if (!updatedProduct) {
            throw new GraphQLError('Error updating user product.');
        }

        return updatedProduct;
    }

};

export const userProductController = {
    userProductMutations
};

export default userProductController;
