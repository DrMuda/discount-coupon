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
import { type IResult, getEffectStatus, isNil, mapToOptions } from '~/utils';
import dayjs, { type Dayjs } from 'dayjs';
import { CancelMinor, TickMinor } from '@shopify/polaris-icons';
import emotionStyled from '@emotion/styled';
import SortModal from '~/components/SortModal';
import axios from 'axios';

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
export type TDiscountCode = PriceRule & {
  code?: string;
  useInProductDetail?: boolean;
  useInCart?: boolean;
  useGlobalConfig?: boolean;
};
interface ISearchValue {
  type?: EDiscountType;
  isGlobal?: EYesNo;
  codeOrName?: string;
}

// 去除表格选择框。 IndexTable 设置 selectable:false 会导致表格行无法点击
const TableContain = emotionStyled.div(() => ({
  tr: {
    'td:first-of-type': { display: 'none' },
    'th:first-of-type': { display: 'none' },
  },
}));

export async function loader({ request }: LoaderFunctionArgs) {
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

    const discountCodeList: TDiscountCode[] = [];
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
          } as TDiscountCode);
        });
      }
      return null;
    });
    return { discountCodeList, shop };
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default function Index() {
  const { discountCodeList: shopifyDiscountCodeList, shop } =
    useLoaderData() as { discountCodeList: TDiscountCode[]; shop: string };
  const [discountCodeList, setDiscountCodeList] = useState<TDiscountCode[]>([]);
  const [searchValue, setSearchValue] = useState<ISearchValue>({
    codeOrName: undefined,
    type: undefined,
    isGlobal: undefined,
  });
  const navigate = useNavigate();
  const [sortModalOpen, setSortModalOpen] = useState(false);

  const getDiscountCodeList = useCallback(async () => {
    if (shopifyDiscountCodeList.length <= 0) return [];
    const dbDiscountCodeListRes = (await axios.get(
      `/api/discountCode/getAll?shop=${shop}`,
      {
        method: 'get',
      }
    )) as unknown as { data: IResult<TDiscountCode[]> };
    const dbDiscountCodeList = dbDiscountCodeListRes.data.data;
    return shopifyDiscountCodeList.map((shopifyDiscountCode) => {
      const dbDiscountCode = dbDiscountCodeList.find(
        ({ id }) => id === shopifyDiscountCode.id
      );
      if (dbDiscountCode) {
        return { ...shopifyDiscountCode, ...dbDiscountCode };
      }
      return { ...shopifyDiscountCode, useGlobalConfig: true };
    });
  }, [shopifyDiscountCodeList, shop]);

  useEffect(() => {
    getDiscountCodeList().then(
      (value) => {
        console.log({ discountCodeList: value });
        setDiscountCodeList(value as TDiscountCode[]);
      },
      (error) => {
        console.error(error);
      }
    );
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
        discountCode.useGlobalConfig !== true
      )
        return;
      if (
        isGlobal &&
        isGlobal === EYesNo.No &&
        discountCode.useGlobalConfig !== false
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
            navigate(`/app/${discountCode.id}/setting`);
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
              navigate('/app/global/setting');
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

        <TableContain>
          <IndexTable
            headings={[
              { title: '折扣码' },
              { title: '类型' },
              { title: '状态' },
              { title: '生效时间' },
              { title: '商品详情页', alignment: 'center' },
              { title: '购物车页', alignment: 'center' },
            ]}
            itemCount={tableRows.length}
            // selectable={false}
          >
            {tableRows}
          </IndexTable>
        </TableContain>
      </div>
      <SortModal
        shop={shop}
        open={sortModalOpen}
        setOpen={setSortModalOpen}
        discountCodeList={discountCodeList}
      />
    </div>
  );
}
