import { type LoaderFunctionArgs } from '@remix-run/node';
import { type IResult, publicLoader } from '~/utils';
import prisma from '../../db.server';

export interface ITemplate {
  id: number;
  name: string;
  codeBgColor: string | null;
  codeColor: string | null;
  textColor: string | null;
  btnBgColor: string | null;
  btnTextColor: string | null;
}
export type TGetAllTemplateRes = IResult<ITemplate[] | null | string>;
export async function loader(loaderFunctionArgs: LoaderFunctionArgs) {
  return publicLoader(
    loaderFunctionArgs,
    async ({ request }): Promise<TGetAllTemplateRes> => {
      try {
        const templateList = await prisma.template.findMany();
        return { code: 0, data: templateList, msg: 'success' };
      } catch (error) {
        console.error(error);
        return { code: 1, data: `${error}`, msg: 'error' };
      }
    }
  );
}
