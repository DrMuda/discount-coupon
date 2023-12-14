import {
  Button,
  IndexTable,
  Select,
  TextField,
  Icon,
  Badge,
  type BadgeProps,
} from '@shopify/polaris';
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authenticate } from '~/shopify.server';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import type { PriceRule } from 'node_modules/@shopify/shopify-api/rest/admin/2023-10/price_rule';
import {
  type IResult,
  getEffectStatus,
  isNil,
  mapToOptions,
  defaultCatch,
} from '~/utils';
import dayjs, { type Dayjs } from 'dayjs';
import { CancelMinor, TickMinor } from '@shopify/polaris-icons';
import SortModal from '~/components/SortModal';
import api from '~/utils/request';
import type { IDiscountCode } from '~/api/discountCode/get';

enum EYesNo {
  Yes = 'yes',
  No = 'no',
}
const yesNoMap = {
  [EYesNo.Yes]: '是',
  [EYesNo.No]: '否',
};
enum EDiscountType {
  FixedAmount = 'fixedAmount',
  Percentage = 'percentage',
  FreeShipping = 'freeShipping',
  BuyXGetY = 'buyXGetY',
}
const discountTypeMap = {
  [EDiscountType.Percentage]: '百分比折扣',
  [EDiscountType.FixedAmount]: '固定金额',
  [EDiscountType.BuyXGetY]: '买X送Y',
  [EDiscountType.FreeShipping]: '免运费',
};
/** 生效状态 */
export enum EEffectStatus {
  InEffect = 'inEffect',
  /** 已安排 */
  Arranged = 'arranged',
  /** 已失效 */
  Expired = 'expired',
}
const effectStatusMap = {
  [EEffectStatus.InEffect]: '生效中',
  [EEffectStatus.Arranged]: '已安排',
  [EEffectStatus.Expired]: '已失效',
};
const effectBadgeToneMap: Record<EEffectStatus, BadgeProps['tone']> = {
  [EEffectStatus.InEffect]: 'success',
  [EEffectStatus.Arranged]: 'attention',
  [EEffectStatus.Expired]: undefined,
};
interface ISearchValue {
  type?: EDiscountType;
  isGlobal?: EYesNo;
  codeOrName?: string;
}

export type ITableRowData = Pick<
  PriceRule,
  | 'starts_at'
  | 'ends_at'
  | 'id'
  | 'title'
  | 'target_type'
  | 'allocation_method'
  | 'value_type'
  | 'created_at'
> & {
  code?: string;
  useInProductDetail?: boolean;
  useInCart?: boolean;
  productDetailUseGlobalConfig?: boolean;
};
interface ILoaderData {
  discountCodeList?: ITableRowData[];
  shop?: string;
}
export async function loader({
  request,
}: LoaderFunctionArgs): Promise<ILoaderData> {
  const { admin, session } = await authenticate.admin(request);
  const { shop } = session;

  try {
    // 获取价格规则总数
    const page = 1;
    const limit = 250;
    const { count: priceRuleCount = 0 } =
      ((await admin.rest.resources.PriceRule.count({
        session,
      })) || {}) as {
        count: number;
      };

    // 获取第一页价格规则
    const priceRuleList: PriceRule[] = [];
    let priceRuleListRes = await admin.rest.resources.PriceRule.all({
      session,
      limit,
    });
    priceRuleListRes.data.forEach((priceRule) => {
      priceRuleList.push(priceRule);
    });
    // 如果还有下一页， 获取下一页
    while (priceRuleCount > page * limit && priceRuleListRes.pageInfo) {
      priceRuleListRes = await admin.rest.resources.PriceRule.all({
        ...priceRuleListRes.pageInfo?.nextPage?.query,
        session,
        limit: 10,
      });
      priceRuleListRes.data.forEach((priceRule) => {
        priceRuleList.push(priceRule);
      });
    }

    // 通过价格规则id获取折扣码列表
    const pList = priceRuleList.map(({ id }) => {
      return admin.rest.resources.DiscountCode.all({
        session: session,
        price_rule_id: id,
      });
    });
    const resList = await Promise.allSettled(pList);

    const discountCodeList: ITableRowData[] = [];
    resList.forEach((res) => {
      if (res.status === 'fulfilled') {
        const { data: dataList = [] } = res.value;
        dataList.forEach(({ code = '', price_rule_id, id }) => {
          if (!price_rule_id || !id) return;
          const priceRule = priceRuleList.find(
            (priceRule) => priceRule.id === price_rule_id
          );
          if (!priceRule) return;
          discountCodeList.push({
            ...priceRule,
            code: code || undefined,
            id,
          } as ITableRowData);
        });
      }
      return null;
    });
    return { discountCodeList, shop };
  } catch (error) {
    console.error(error);
    return {};
  }
}

export default function Index() {
  const { discountCodeList: shopifyDiscountCodeList, shop } =
    useLoaderData() as ILoaderData;
  const [discountCodeList, setDiscountCodeList] = useState<ITableRowData[]>([]);
  const [searchValue, setSearchValue] = useState<ISearchValue>({
    codeOrName: undefined,
    type: undefined,
    isGlobal: undefined,
  });
  const navigate = useNavigate();
  const [sortModalOpen, setSortModalOpen] = useState(false);

  const getDiscountCodeList = useCallback(async (): Promise<
    ITableRowData[]
  > => {
    if (!shopifyDiscountCodeList || shopifyDiscountCodeList.length <= 0)
      return [];
    const dbDiscountCodeListRes = (await api
      .get(`/api/discountCode/get`, { params: { shop } })
      .catch(defaultCatch)) as IResult<IDiscountCode[]> | null;
    const dbDiscountCodeList = dbDiscountCodeListRes?.data || [];

    return shopifyDiscountCodeList.map((shopifyDiscountCode) => {
      const useInProductDetail =
        dbDiscountCodeList.findIndex(
          ({ whichPage, show, shopifyDiscountCodeId }) =>
            shopifyDiscountCodeId === shopifyDiscountCode.id?.toString() &&
            whichPage === 1 &&
            show
        ) > -1;
      const useInCart =
        dbDiscountCodeList.findIndex(
          ({ whichPage, show, shopifyDiscountCodeId }) =>
            shopifyDiscountCodeId === shopifyDiscountCode.id?.toString() &&
            whichPage === 2 &&
            show
        ) > -1;
      // 找出不跟随全局的, 找不到的都默认跟随全局
      const productDetailNotUseGlobalConfig =
        dbDiscountCodeList.findIndex(
          ({ whichPage, useGlobalConfig, shopifyDiscountCodeId }) =>
            shopifyDiscountCodeId === shopifyDiscountCode.id?.toString() &&
            whichPage === 1 &&
            useGlobalConfig === false
        ) > -1;

      return {
        ...shopifyDiscountCode,
        useInCart,
        useInProductDetail,
        productDetailUseGlobalConfig: !productDetailNotUseGlobalConfig,
      } as ITableRowData;
    });
  }, [shopifyDiscountCodeList, shop]);

  useEffect(() => {
    getDiscountCodeList().then(setDiscountCodeList);
  }, [getDiscountCodeList]);

  const tableRows = useMemo(() => {
    const rows: ReactNode[] = [];
    discountCodeList.forEach((discountCode, index) => {
      const { codeOrName, isGlobal, type } = searchValue;
      if (isNil(discountCode.id)) return;

      // 筛选名称或code
      if (
        codeOrName &&
        !discountCode.title?.includes(codeOrName) &&
        !discountCode.code?.includes(codeOrName)
      )
        return;

      // 算出类型并筛选
      let discountType: EDiscountType | null = null;
      if (discountCode.target_type === 'shipping_line') {
        discountType = EDiscountType.FreeShipping;
      }
      if (discountCode.target_type === 'line_item') {
        if (discountCode.allocation_method === 'each') {
          discountType = EDiscountType.BuyXGetY;
        }
        if (discountCode.allocation_method === 'across') {
          if (discountCode.value_type === 'percentage') {
            discountType = EDiscountType.Percentage;
          }
          if (discountCode.value_type === 'fixed_amount') {
            discountType = EDiscountType.FixedAmount;
          }
        }
      }
      if (type && discountType !== type) return;

      // 生效状态
      const startTime = discountCode.starts_at
        ? dayjs(discountCode.starts_at)
        : null;
      const endTime = discountCode.ends_at ? dayjs(discountCode.ends_at) : null;
      const effectStatus = getEffectStatus(discountCode);

      // 筛选是否使用全局配置
      if (
        isGlobal &&
        isGlobal === EYesNo.Yes &&
        discountCode.productDetailUseGlobalConfig !== true
      )
        return;
      if (
        isGlobal &&
        isGlobal === EYesNo.No &&
        discountCode.productDetailUseGlobalConfig !== false
      )
        return;

      const getDateFormatStr = (time: Dayjs) => {
        if (time.year() !== dayjs().year()) {
          return 'YY年 MM-DD';
        }
        return 'MM-DD';
      };

      rows.push(
        <IndexTable.Row
          key={discountCode.id}
          id={discountCode.id.toString()}
          position={index}
          onClick={() => {
            navigate(
              `setting?id=${discountCode.id}&code=${encodeURIComponent(
                discountCode.code || ''
              )}&title=${encodeURIComponent(discountCode.title || '')}`
            );
          }}
        >
          <IndexTable.Cell>
            {discountCode.title && [discountCode.title, <br key="br" />]}
            {discountCode.code}
          </IndexTable.Cell>
          <IndexTable.Cell>
            {discountType && discountTypeMap[discountType]}
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Badge
              tone={effectStatus ? effectBadgeToneMap[effectStatus] : undefined}
            >
              {effectStatus ? effectStatusMap[effectStatus] : '未知'}
            </Badge>
          </IndexTable.Cell>
          <IndexTable.Cell>
            {startTime && startTime.format(getDateFormatStr(startTime))}
            {endTime && ' 至 '}
            {endTime && endTime.format(getDateFormatStr(endTime))}
          </IndexTable.Cell>
          <IndexTable.Cell>
            {discountCode.useInProductDetail ? (
              <Icon source={TickMinor} />
            ) : (
              <Icon source={CancelMinor} />
            )}
          </IndexTable.Cell>
          <IndexTable.Cell>
            {discountCode.useInCart ? (
              <Icon source={TickMinor} />
            ) : (
              <Icon source={CancelMinor} />
            )}
          </IndexTable.Cell>
          <IndexTable.Cell>
            {discountCode.productDetailUseGlobalConfig !== false ? (
              <Icon source={TickMinor} />
            ) : (
              <Icon source={CancelMinor} />
            )}
          </IndexTable.Cell>
        </IndexTable.Row>
      );
    });
    return rows;
  }, [discountCodeList, searchValue, navigate]);

  return (
    <div className="p-2">
      <div className="bg-white rounded-lg p-3">
        <p className="text-lg mb-2">折扣码全局设置</p>
        <p className="mb-2">
          可设置商品匹配到2张或更多折扣券展示样式、折扣码在商品详情页展示顺序等
        </p>
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="large"
            onClick={() => {
              navigate(`setting?id=global`);
            }}
          >
            样式设置
          </Button>
          <Button size="large" onClick={() => setSortModalOpen(true)}>
            折扣码排序
          </Button>
        </div>
      </div>
      <div className="bg-white rounded-lg p-3 mt-4">
        <div className="flex gap-2 mb-2">
          <div className="w-[200px]">
            <TextField
              label=""
              labelHidden={false}
              value={searchValue.codeOrName}
              onChange={(codeOrName) =>
                setSearchValue((value) => ({ ...value, codeOrName }))
              }
              autoComplete="off"
              placeholder="折扣码/活动名称"
            />
          </div>
          <div className="w-[200px]">
            <Select
              label="类型"
              labelInline
              options={[
                { label: '全部', value: 'all' },
                ...mapToOptions(discountTypeMap),
              ]}
              value={searchValue.type || 'all'}
              onChange={(type: EDiscountType | 'all') => {
                if (type === 'all') {
                  setSearchValue((value) => ({ ...value, type: undefined }));
                } else {
                  setSearchValue((value) => ({ ...value, type }));
                }
              }}
            />
          </div>
          <div className="w-[200px]">
            <Select
              label="跟随全局"
              labelInline
              options={[
                { label: '全部', value: 'all' },
                ...mapToOptions(yesNoMap),
              ]}
              value={searchValue.isGlobal || 'all'}
              onChange={(isGlobal: EYesNo | 'all') => {
                if (isGlobal === 'all') {
                  setSearchValue((value) => ({
                    ...value,
                    isGlobal: undefined,
                  }));
                } else {
                  setSearchValue((value) => ({ ...value, isGlobal }));
                }
              }}
            />
          </div>
        </div>
        <div className="no-select-table-contain">
          <IndexTable
            headings={[
              { title: '折扣码' },
              { title: '类型' },
              { title: '状态' },
              { title: '生效时间' },
              { title: '商品详情页', alignment: 'center' },
              { title: '购物车页', alignment: 'center' },
              { title: '商详页跟随全局', alignment: 'center' },
            ]}
            itemCount={tableRows.length}
            // selectable={false}
          >
            {tableRows}
          </IndexTable>
        </div>
      </div>
      <SortModal
        shop={shop || ''}
        open={sortModalOpen}
        setOpen={setSortModalOpen}
        discountCodeList={discountCodeList}
      />
    </div>
  );
}
