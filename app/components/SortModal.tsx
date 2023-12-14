import { Modal, Select } from '@shopify/polaris';
import { EEffectStatus, type ITableRowData } from '~/routes/app._index';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { RiDragMove2Fill } from 'react-icons/ri';
import { useEffect, useState } from 'react';
import {
  type IResult,
  getEffectStatus,
  showToast,
  defaultCatch,
} from '~/utils';
import dayjs, { type Dayjs } from 'dayjs';
import type { IGlobalConfig } from '~/api/globalConfig/get';
import type {
  TUpsertGlobalConfigParams,
  TUpsertGlobalConfigRes,
} from '~/api/globalConfig/upsert';
import api from '~/utils/request';

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
}
const Row = ({
  children,
  discountCode,
  ...props
}: RowProps & { discountCode: ITableRowData }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props['data-row-key'],
  });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  };

  const getDateFormatStr = (time: Dayjs) => {
    if (time.year() !== dayjs().year()) {
      return 'YY年 MM-DD';
    }
    return 'MM-DD';
  };
  const startTime = discountCode.starts_at
    ? dayjs(discountCode.starts_at)
    : null;
  const endTime = discountCode.ends_at ? dayjs(discountCode.ends_at) : null;

  return (
    <div
      style={style}
      ref={setNodeRef}
      {...attributes}
      className="flex gap-1 items-center"
    >
      <span
        style={{
          touchAction: 'none',
          cursor: 'move',
          padding: '4px',
          fontSize: '24px',
        }}
        className="w-7 flex-0 items-center justify-center"
        ref={setActivatorNodeRef}
        {...listeners}
      >
        <RiDragMove2Fill />
      </span>
      <span className="flex-1 text-center text-[13px]">
        {discountCode.code}
      </span>
      <span className="flex-1 text-center">
        {startTime && startTime.format(getDateFormatStr(startTime))}
        {endTime && ' 至 '}
        {endTime && endTime.format(getDateFormatStr(endTime))}
      </span>
    </div>
  );
};

/** 排序折扣码弹窗 */
export default function SortModal({
  shop,
  open,
  setOpen,
  discountCodeList: originDiscountCodeList,
}: {
  shop: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  discountCodeList: ITableRowData[];
}) {
  const [globalConfigSort, setGlobalConfigSort] = useState<{
    sort?: string;
    id?: number;
  }>();
  const [discountCodeList, setDiscountCodeList] = useState<ITableRowData[]>([]);
  const handleOK = async () => {
    const res = (await api
      .post('/api/globalConfig/upsert', {
        shop,
        id: globalConfigSort?.id,
        sort: discountCodeList.map(({ id }) => id).join(','),
      } as TUpsertGlobalConfigParams)
      .catch(defaultCatch)) as TUpsertGlobalConfigRes | null;
    if (res?.code === 0) {
      showToast({ content: '保存成功' });
      setOpen(false);
      return;
    }
    showToast({ content: `保存失败${res?.msg}` });
  };
  const getGlobalConfig = async () => {
    const globalConfigRes = (await api
      .get('/api/globalConfig/get', {
        params: { shop },
      })
      .catch(defaultCatch)) as IResult<IGlobalConfig[]> | null;
    if (globalConfigRes?.code === 0) {
      return globalConfigRes.data;
    }
    return undefined;
  };

  const [selectSort, setSelectSort] = useState<
    | 'newEffectFirst'
    | 'newEffectLast'
    | 'newCreateFirst'
    | 'newCreateLast'
    | 'noRlue'
  >('noRlue');

  useEffect(() => {
    let discountCodeList = JSON.parse(
      JSON.stringify(originDiscountCodeList)
    ) as ITableRowData[];
    // 过滤无效折扣码
    discountCodeList = discountCodeList.filter((discountCode) => {
      const effectStatus = getEffectStatus(discountCode);
      return effectStatus !== EEffectStatus.Expired;
    });
    // 根据保存的全局配置排序
    if (globalConfigSort) {
      const { sort } = globalConfigSort;
      const sortList = sort?.split(',');
      discountCodeList = discountCodeList.sort((a, b) => {
        let aIdIndex = -1;
        let bIdIndex = -1;
        sortList?.forEach((sortId, index) => {
          if (sortId === a.id?.toString()) aIdIndex = index;
          if (sortId === b.id?.toString()) bIdIndex = index;
        });
        return aIdIndex - bIdIndex;
      });
    }
    setDiscountCodeList(discountCodeList);
  }, [originDiscountCodeList, globalConfigSort]);

  useEffect(() => {
    open &&
      getGlobalConfig().then((values = []) => {
        const value = values.find(({ sort }) => !!sort);
        setGlobalConfigSort({
          sort: value?.sort || undefined,
          id: values[0]?.id,
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      const activeIndex = discountCodeList.findIndex(
        (i) => i.id?.toString() === active.id
      );
      const overIndex = discountCodeList.findIndex(
        (i) => i.id?.toString() === over?.id
      );
      setDiscountCodeList((list) => {
        const activeItem = list.splice(activeIndex, 1)[0];
        list.splice(overIndex, 0, activeItem);
        return [...list];
      });
      setSelectSort('noRlue');
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      title="折扣码排序"
      primaryAction={{
        content: '保存',
        onAction: handleOK,
      }}
      secondaryActions={[
        {
          content: '取消',
          onAction: () => setOpen(false),
        },
      ]}
    >
      <div className="p-2">
        <Select
          label="预设排序规则"
          options={[
            { label: '自定义', value: 'noRlue' },
            { label: '生效时间：新-旧', value: 'newEffectFirst' },
            { label: '生效时间：旧-新', value: 'newEffectLast' },
            { label: '创建时间：新-旧', value: 'newCreateFirst' },
            { label: '创建时间：旧-新', value: 'newCreateLast' },
          ]}
          value={selectSort}
          onChange={(value: typeof selectSort) => {
            setSelectSort(value);
            switch (value) {
              case 'newEffectFirst': {
                setDiscountCodeList((list) => {
                  return list.sort(
                    (a, b) =>
                      Date.parse(b.starts_at || '') -
                      Date.parse(a.starts_at || '')
                  );
                });
                break;
              }
              case 'newEffectLast': {
                setDiscountCodeList((list) => {
                  return list.sort(
                    (a, b) =>
                      Date.parse(a.starts_at || '') -
                      Date.parse(b.starts_at || '')
                  );
                });
                break;
              }
              case 'newCreateFirst': {
                setDiscountCodeList((list) => {
                  return list.sort(
                    (a, b) =>
                      Date.parse(b.created_at || '') -
                      Date.parse(a.created_at || '')
                  );
                });
                break;
              }
              case 'newCreateLast': {
                setDiscountCodeList((list) => {
                  return list.sort(
                    (a, b) =>
                      Date.parse(a.created_at || '') -
                      Date.parse(b.created_at || '')
                  );
                });
                break;
              }
            }
          }}
        />
        <div className="border-solid border-[#f6f6f6] rounded-lg mt-2">
          <DndContext
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={onDragEnd}
          >
            <div
              className="flex items-center justify-center font-bold bg-[#f6f6f6] border-solid border-[#dfdfdf] text-[#565656] text-center p-[6px]"
              style={{ border: '0', borderBottom: '1px' }}
            >
              <span className="flex-0 w-7" />
              <span className="flex-1 font-bold">折扣码</span>
              <span className="flex-1 font-bold">生效时间</span>
            </div>
            <SortableContext
              items={discountCodeList.map(({ id }) => id?.toString() || '')}
              strategy={verticalListSortingStrategy}
            >
              <div className="relative">
                {discountCodeList.map((discountCode) => (
                  <Row
                    discountCode={discountCode}
                    data-row-key={discountCode.id?.toString() || ''}
                    key={discountCode.id}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </Modal>
  );
}
