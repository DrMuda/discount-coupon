import type { ActionFunctionArgs } from '@remix-run/node';
import { type IGlobalConfig } from '~/api/globalConfig/get';
import { type IResult } from '~/utils';
import { prisma } from '../../db.server';

export type TUpsertParams = Required<IGlobalConfig> & { shop: string };
export async function action({
  request,
}: ActionFunctionArgs): Promise<IResult<IGlobalConfig | null | unknown>> {
  const data = (await request.json()) as TUpsertParams;
  const { shop } = data;
  if (!shop)
    return { code: 1, data: null, msg: 'require parameters shop(string)' };
  try {
    let config: unknown | null = null;
    const existsConfig = await prisma.globalConfig.findFirst({
      where: { shop },
    });
    if (existsConfig) {
      config = await prisma.globalConfig.update({
        data,
        where: { id: existsConfig.id },
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
