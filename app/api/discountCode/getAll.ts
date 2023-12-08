import { type LoaderFunctionArgs } from '@remix-run/node';
import {prisma} from '../../db.server';
import { getUrlParams, publicLoader } from '~/utils';

export async function loader(loaderFunctionArgs: LoaderFunctionArgs) {
  return publicLoader(loaderFunctionArgs, async ({ request }) => {
    const shop = getUrlParams(request.url, 'shop');
    if (typeof shop !== 'string')
      return { data: null, msg: 'require parameters shop(string)', code: 1 };

    const dbDiscountCodeList = await prisma.discountCode.findMany({
      where: { shop },
    });
    return { data: dbDiscountCodeList, msg: 'ok', code: 0 };
  });
}
