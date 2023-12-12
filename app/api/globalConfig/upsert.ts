import type { ActionFunctionArgs } from '@remix-run/node';
import { type IGlobalConfig } from '~/api/globalConfig/get';
import { type IResult } from '~/utils';
import { prisma } from '../../db.server';

export type TUpsertGlobalConfigParams = Required<IGlobalConfig> & {
  shop: string;
};
export type TUpsertGlobalConfigRes = IResult<IGlobalConfig | null | unknown>;
export async function action({
  request,
}: ActionFunctionArgs): Promise<TUpsertGlobalConfigRes> {
  const data = (await request.json()) as TUpsertGlobalConfigParams;
  const { shop } = data;
  if (!shop)
    return { code: 1, data: null, msg: 'require parameters shop(string)' };
  try {
    let config: unknown | null = null;
    if (data.id) {
      config = await prisma.globalConfig.update({
        data,
        where: { id: data.id },
      });
    } else {
      config = await prisma.globalConfig.create({
        data,
      });
    }

    return { code: 0, data: config, msg: 'success' };
  } catch (error) {
    console.error(error);
    return { code: 1, data: error, msg: 'error' };
  }
}
