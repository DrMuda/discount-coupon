import { type ActionFunctionArgs } from '@remix-run/node';
import { authenticate } from '~/shopify.server';
import { publicAction } from '~/utils';

export interface ICartUpdateDiscountCodeParams {
  cartId: string;
  codes: string[];
}
export async function action(actionFunctionArgs: ActionFunctionArgs) {
  return publicAction(actionFunctionArgs, async ({ request }) => {
    const { storefront } = await authenticate.public.appProxy(request);
    const data = (await request.json()) as ICartUpdateDiscountCodeParams;
    if (!data.cartId)
      return { code: 1, data: null, msg: 'require parameters cartId(string)' };
    if (!(data.codes instanceof Array))
      return { code: 1, data: null, msg: 'require parameters codes(string[])' };
    const res = await storefront?.graphql(`
    #graphql
    mutation cartDiscountCodesUpdate($cartId: ${data.cartId}) {
      cartDiscountCodesUpdate(cartId: ${data.cartId}) {
        cart {
          "cartId": ${data.cartId},
          "discountCodes": ${JSON.stringify(data.codes)}
        }
        userErrors {
          field
          message
        }
      }
    }
    `);
    const resData = await res?.json();
    return { code: 0, data: resData, msg: 'success' };
  });
}
