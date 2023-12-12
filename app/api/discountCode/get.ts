import { type LoaderFunctionArgs } from '@remix-run/node';
import { prisma } from '../../db.server';
import { type IResult, getUrlParams, publicLoader } from '~/utils';

export interface IDiscountCode {
  id: number;
  shopifyDiscountCodeId: string;
  shop: string;
  useGlobalConfig: boolean;
  show: boolean;
  templateId: number;
  codeBgColor: string | null;
  codeColor: string | null;
  textColor: string | null;
  btnBgColor: string | null;
  btnTextColor: string | null;
  /** 左侧优惠文案 */
  leftText: string | null;
  /** 作用于哪个页面 1. 商品详情页, 2. 购物车页面 */
  whichPage: number;
  createdAt: string;
}
export type TGetDiscountCodeParams = Partial<
  Pick<IDiscountCode, 'shopifyDiscountCodeId' | 'id'>
> & { shop: string };
export type TGetDiscountCodeRes = IResult<IDiscountCode[] | null>;
export async function loader(loaderFunctionArgs: LoaderFunctionArgs) {
  return publicLoader(
    loaderFunctionArgs,
    async ({ request }): Promise<TGetDiscountCodeRes> => {
      const { shop, id, shopifyDiscountCodeId } = getUrlParams(
        request.url
      ) as unknown as TGetDiscountCodeParams;
      if (typeof shop !== 'string')
        return { data: null, msg: 'require parameters shop(string)', code: 1 };

      const dbDiscountCodeList = await prisma.discountCode.findMany({
        where: { shop, id, shopifyDiscountCodeId },
      });
      return {
        data: dbDiscountCodeList.map((item) => ({
          ...item,
          createdAt: item.createdAt.toUTCString(),
        })),
        msg: 'ok',
        code: 0,
      };
    }
  );
}
