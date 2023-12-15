import { type LoaderFunctionArgs } from '@remix-run/node';
import { type IResult, getUrlParams, publicLoader } from '~/utils';
import prisma from '../../db.server';

export interface IGlobalConfig {
  id: number;
  shop: string;
  templateId: number | null;
  codeBgColor: string | null;
  codeColor: string | null;
  textColor: string | null;
  btnBgColor: string | null;
  btnTextColor: string | null;
  sort: string | null;
  /** 作用于哪个页面 1. 商品详情页, 2. 购物车页面 */
  whichPage: number;
}
export type TGetGlobalConfigRes = IResult<IGlobalConfig[] | null>;
export async function loader(loaderFunctionArgs: LoaderFunctionArgs) {
  return publicLoader(
    loaderFunctionArgs,
    async ({ request }): Promise<TGetGlobalConfigRes> => {
      const { shop } = getUrlParams(request.url) as { shop: string };
      if (typeof shop !== 'string')
        return { data: null, msg: 'require parameters shop(string)', code: 1 };
      const configList = await prisma.globalConfig.findMany({
        where: { shop },
      });
      return { data: configList, msg: 'ok', code: 0 };
    }
  );
}
