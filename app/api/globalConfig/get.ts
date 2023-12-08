import { type LoaderFunctionArgs } from '@remix-run/node';
import { getUrlParams, publicLoader } from '~/utils';

export interface IGlobalConfig {
  id: number;
  shop: string;
  styleId: number;
  codeBgColor: string | null;
  codeColor: string | null;
  textColor: string | null;
  btnBgColot: string | null;
  btnTextColor: string | null;
  sort: string | null;
}
export async function loader(loaderFunctionArgs: LoaderFunctionArgs) {
  return publicLoader(loaderFunctionArgs, async ({ request }) => {
    const shop = getUrlParams(request.url, 'shop');
    if (typeof shop !== 'string')
      return { data: null, msg: 'require parameters shop(string)', code: 1 };
    console.log({ shop });
    const configList = await prisma.globalConfig.findFirst({ where: { shop } });
    return { data: configList, msg: 'ok', code: 0 };
  });
}
