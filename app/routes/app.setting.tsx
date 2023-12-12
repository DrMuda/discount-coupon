import { type LoaderFunctionArgs } from '@remix-run/node';
import { useEffect, useMemo, useRef, useState } from 'react';
import { type IResult, getUrlParams, defaultCatch } from '~/utils';
import classnames from 'classnames';
import Setting from '~/components/Setting';
import api from '~/utils/request';
import { type ITemplate } from '~/api/template/getAll';
import { authenticate } from '~/shopify.server';
import { useLoaderData, useNavigate } from '@remix-run/react';
import type {
  TGetGlobalConfigRes,
  IGlobalConfig,
} from '~/api/globalConfig/get';
import type {
  TGetDiscountCodeRes,
  IDiscountCode,
  TGetDiscountCodeParams,
} from '~/api/discountCode/get';
import { IoArrowBackSharp } from 'react-icons/io5';
import { Button } from '@shopify/polaris';
import { links as ClassicLinks } from '~/components/PreviewTemplate/Classic';

export const links = () => [...ClassicLinks()];

interface ILoaderData {
  shop?: string | null;
  id?: string | null;
  globalConfigList?: IGlobalConfig[] | null;
  discountCodeList?: IDiscountCode[] | null;
  code?: string | null;
  title?: string | null;
}
export async function loader({
  request,
}: LoaderFunctionArgs): Promise<ILoaderData> {
  const { session } = await authenticate.admin(request);
  const { shop } = session;
  const { id, code, title } = getUrlParams(request.url) as {
    id: string;
    code: string;
    title: string;
  };
  if (!id) return {};

  let globalConfigList: IGlobalConfig[] | null = null;
  let discountCodeList: IDiscountCode[] | null = null;
  if (id === 'global') {
    globalConfigList = await prisma.globalConfig.findMany({
      where: { shop },
    });
  } else {
    const _discountCodeList = await prisma.discountCode.findMany({
      where: { shop, shopifyDiscountCodeId: id },
    });
    discountCodeList = _discountCodeList.map((item) => ({
      ...item,
      createdAt: item.createdAt.toUTCString(),
    }));
  }

  return {
    shop,
    id,
    globalConfigList,
    discountCodeList,
    code,
    title,
  };
}

export default function SettingPage() {
  const { id, shop, code, title } = useLoaderData<ILoaderData>();
  const [globalConfigList, setGlobalConfigList] = useState<IGlobalConfig[]>([]);
  const [discountCodeList, setDiscountCodeList] = useState<IDiscountCode[]>([]);
  const [active, setActive] = useState<'product' | 'cart'>('product');
  const [templateList, setTemplateList] = useState<ITemplate[]>([]);
  const navigate = useNavigate();
  const saveMethod = useRef<() => Promise<boolean>>();

  const getTemplateList = async () => {
    const res = (await api
      .get('/api/template/getAll')
      .catch(defaultCatch)) as IResult<ITemplate[]> | null;
    if (res?.code === 0) {
      return res?.data;
    }
    return [];
  };
  const isGlobal = useMemo(() => id === 'global', [id]);

  const getGlobalConfig = async () => {
    const res = (await api
      .get('/api/globalConfig/get', { params: { shop } })
      .catch(defaultCatch)) as TGetGlobalConfigRes | null;
    if (res?.code === 0) {
      return res.data || [];
    }
    return [];
  };

  const getDiscountCode = async () => {
    const res = (await api
      .get('/api/discountCode/get', {
        params: { shop, shopifyDiscountCodeId: id } as TGetDiscountCodeParams,
      })
      .catch(defaultCatch)) as TGetDiscountCodeRes | null;
    if (res?.code === 0) {
      return res.data || [];
    }
    return [];
  };

  useEffect(() => {
    isGlobal && getGlobalConfig().then(setGlobalConfigList);
    !isGlobal && getDiscountCode().then(setDiscountCodeList);
    getTemplateList().then(setTemplateList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-2 min-w-[640px]">
      <div className="flex items-center justify-between bg-white rounded-lg px-2 py-4">
        <div className="flex gap-1 items-center">
          <div
            className="cursor-pointer text-[32px]"
            onClick={() => {
              navigate(-1);
            }}
          >
            <IoArrowBackSharp />
          </div>
          <span className="font-bold text-[16px]">
            {isGlobal ? '折扣码全局设置' : `${title || ''}: ${code || ''}`}
          </span>
        </div>
        <Button
          size="large"
          variant="primary"
          onClick={async () => {
            const success = await saveMethod.current?.();
            if (success) {
              getGlobalConfig().then(setGlobalConfigList);
              getDiscountCode().then(setDiscountCodeList);
            }
          }}
        >
          保存
        </Button>
      </div>
      <div className="mt-4 mb-2 bg-white flex items-center text-center relative p-2 rounded-lg h-[44px] gap-2">
        <div
          className={classnames({
            'absolute top-[8px] bg-[#f2f2f2] transition-all w-[calc(50%-8px-4px)] h-[calc(100%-16px)] rounded-md z-10':
              true,
            'left-[8px]': active === 'product',
            'left-[calc(50%+4px)]': active === 'cart',
          })}
        />
        <div
          className={classnames({
            'flex-1 z-20 h-full rounded-md leading-[calc(44px-16px)] cursor-pointer':
              true,
            'font-bold': active === 'product',
          })}
          onClick={() => setActive('product')}
        >
          商品详情页
        </div>
        <div
          className={classnames({
            'flex-1 z-20 h-full rounded-md leading-[calc(44px-16px)] cursor-pointer':
              true,
            'font-bold': active === 'cart',
          })}
          onClick={() => setActive('cart')}
        >
          购物车页
        </div>
      </div>
      <Setting
        id={id}
        code={code}
        shop={shop}
        templateList={templateList}
        discountCodeList={discountCodeList || []}
        globalConfigList={globalConfigList || []}
        whichPage={({ product: 1, cart: 2 } as Record<string, 1 | 2>)[active]}
        setSaveMethod={(_saveMethod) => {
          saveMethod.current = _saveMethod;
        }}
      />
    </div>
  );
}
