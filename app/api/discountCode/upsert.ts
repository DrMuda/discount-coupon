import { type ActionFunctionArgs } from '@remix-run/node';
import { type IDiscountCode } from '~/api/discountCode/get';
import { type IResult } from '~/utils';

export type TUpsertDiscountCodeParams = Required<IDiscountCode>;
export type TUpsertDiscountCodeRes = IResult<IDiscountCode | null | unknown>;

export async function action({
  request,
}: ActionFunctionArgs): Promise<TUpsertDiscountCodeRes> {
  const data = (await request.json()) as TUpsertDiscountCodeParams;
  if (!data.shop) return { code: 1, data: null, msg: 'no auth' };
  try {
    let config: unknown | null = null;
    if (data.id) {
      config = await prisma.discountCode.update({
        data,
        where: { id: data.id },
      });
    } else {
      config = await prisma.discountCode.create({
        data,
      });
    }

    return { code: 0, data: config, msg: 'success' };
  } catch (error) {
    console.error(error);
    return { code: 1, data: error, msg: 'error' };
  }
}
