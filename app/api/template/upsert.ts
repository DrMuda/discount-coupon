import type { ActionFunctionArgs } from '@remix-run/node';
import { type IResult } from '~/utils';
import { prisma } from '../../db.server';
import { type ITemplate } from '~/api/template/getAll';

export type TUpsertTemplateParams = Required<ITemplate>;
export type TUpsertTemplateRes = IResult<ITemplate | null | unknown>;
export async function action({
  request,
}: ActionFunctionArgs): Promise<TUpsertTemplateRes> {
  const data = (await request.json()) as TUpsertTemplateParams;
  try {
    let config: unknown | null = null;
    if (data.id) {
      config = await prisma.template.update({
        data,
        where: { id: data.id },
      });
    } else {
      config = await prisma.template.create({
        data,
      });
    }

    return { code: 0, data: config, msg: 'success' };
  } catch (error) {
    console.error(error);
    return { code: 1, data: error, msg: 'error' };
  }
}
