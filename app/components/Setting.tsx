import { Button, Icon, TextField } from '@shopify/polaris';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { type ITemplate } from '~/api/template/getAll';
import Swicth from '~/components/Swicth';
import { templatePreviewDir } from '~/config';
import type { TDivProps } from '~/utils/types';
import { TickMinor } from '@shopify/polaris-icons';
import classNames from 'classnames';
import { ColorPicker, message, type ColorPickerProps } from 'antd';
import { type IGlobalConfig } from '~/api/globalConfig/get';
import { type IDiscountCode } from '~/api/discountCode/get';
import { SyncOutlined } from '@ant-design/icons';
import type {
  TUpsertGlobalConfigParams,
  TUpsertGlobalConfigRes,
} from '~/api/globalConfig/upsert';
import api from '~/utils/request';
import type {
  TUpsertDiscountCodeParams,
  TUpsertDiscountCodeRes,
} from '~/api/discountCode/upsert';
import { RiComputerLine } from 'react-icons/ri';
import { ImMobile } from 'react-icons/im';
import BagsIcon from '~/components/BagsIcon';
import Classic from '~/components/PreviewTemplate/Classic';

const LeftItemContain = (props: TDivProps) => {
  return (
    <div
      {...props}
      className={
        'bg-white mb-4 last:!mb-0 rounded-lg p-3 w-full ' + props.className ||
        ''
      }
    >
      {props.children}
    </div>
  );
};

const ColorSetting = ({
  text,
  ...colorPickerProps
}: { text?: string } & ColorPickerProps) => {
  // remix框架貌似和 antd 不太兼容， 当切换到此页面后， 然后刷新页面 ColorPicker 就会报错， 所以延时到下一帧再渲染 ColorPicker
  const [showColorPicker, setShowColorPicker] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setShowColorPicker(true);
    }, 0);
  }, []);

  return (
    <div className="flex gap-1 items-center">
      {showColorPicker && <ColorPicker {...colorPickerProps} />}
      {text}
    </div>
  );
};

export type TColorType =
  | 'textColor'
  | 'btnBgColor'
  | 'btnTextColor'
  | 'codeBgColor'
  | 'codeColor';

export default function Setting({
  templateList,
  id,
  code,
  shop,
  globalConfigList,
  discountCodeList,
  whichPage,
  setSaveMethod,
  hidden,
}: {
  templateList: ITemplate[];
  id?: string | null;
  code?: string | null;
  shop?: string | null;
  globalConfigList: IGlobalConfig[];
  discountCodeList: IDiscountCode[];
  whichPage: 1 | 2;
  setSaveMethod: (method: () => Promise<boolean>) => void;
  hidden?: boolean;
}) {
  const defaultTemplate = useMemo(() => {
    return templateList.find(({ id }) => id === 1) || templateList[0];
  }, [templateList]);

  const [showDiscountCode, setShowDiscountCode] = useState(false);
  const [useGlobalConfig, setUseGlobalConfig] = useState(true);
  const [showAllTemplate, setShowAllTemplate] = useState(false);
  const [selectTemplate, setSelectTemplate] = useState<ITemplate | undefined>(
    defaultTemplate
  );
  const isGlobal = useMemo(() => id === 'global', [id]);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'pc'>('mobile');

  const [colorConfig, setColorConfig] =
    useState<Partial<Record<TColorType, string | null | undefined>>>();
  // 左侧优惠文案
  const [leftText, setLeftText] = useState<string | null>(null);

  const saveMethod = useMemo(() => {
    const fn: () => Promise<boolean> = async () => {
      const msgKey = 'save';
      const { btnBgColor, btnTextColor, codeBgColor, codeColor, textColor } =
        colorConfig || {};
      if (!shop) {
        message.error({ key: msgKey, content: '店铺id异常' });
        return false;
      }
      message.loading({ key: msgKey, content: '正在保存', duration: 0 });

      if (isGlobal) {
        const globalConfig = globalConfigList.find(
          (item) => item.whichPage === whichPage
        );
        const params: Partial<TUpsertGlobalConfigParams> = {
          btnBgColor,
          btnTextColor,
          codeBgColor,
          codeColor,
          textColor,
          templateId: selectTemplate?.id,
          id: globalConfig?.id,
          whichPage,
          shop,
        };
        const res = (await api
          .post('/api/globalConfig/upsert', params)
          .catch(() => null)) as TUpsertGlobalConfigRes | null;
        if (res?.code === 0) {
          message.success({ key: msgKey, content: '保存成功' });
          return true;
        }
        message.error({ key: msgKey, content: '保存失败' });
        return false;
      }

      if (!id) {
        message.error({ key: msgKey, content: '折扣码id 异常' });
        return false;
      }
      const discountCode = discountCodeList.find(
        (item) => item.whichPage === whichPage
      );
      const params: Partial<TUpsertDiscountCodeParams> = {
        btnBgColor,
        btnTextColor,
        codeBgColor,
        codeColor,
        id: discountCode?.id,
        leftText,
        shop,
        templateId: selectTemplate?.id,
        textColor,
        useGlobalConfig,
        whichPage,
        shopifyDiscountCodeId: id,
        code,
      };
      params.show = showDiscountCode;
      const res = (await api
        .post('/api/discountCode/upsert', params)
        .catch(() => null)) as TUpsertDiscountCodeRes | null;
      if (res?.code === 0) {
        message.success({ key: msgKey, content: '保存成功' });
        return true;
      }
      message.error({ key: msgKey, content: '保存失败' });
      return false;
    };
    return fn;
  }, [
    colorConfig,
    discountCodeList,
    globalConfigList,
    id,
    isGlobal,
    leftText,
    selectTemplate,
    shop,
    showDiscountCode,
    useGlobalConfig,
    whichPage,
    code,
  ]);

  useEffect(() => {
    setSaveMethod(saveMethod);
  }, [saveMethod, setSaveMethod]);

  useEffect(() => {
    // 全局配置
    if (!isGlobal) return;
    const globalConfig = globalConfigList.find(
      (item) => item.whichPage === whichPage
    );
    if (!globalConfig) {
      setColorConfig(undefined);
      setSelectTemplate(defaultTemplate);
      return;
    }
    const template = templateList.find(
      (item) => item.id === globalConfig?.templateId
    );
    setSelectTemplate(template);
    setColorConfig({
      btnBgColor: globalConfig.btnBgColor,
      btnTextColor: globalConfig.btnTextColor,
      codeBgColor: globalConfig.codeBgColor,
      codeColor: globalConfig.codeColor,
      textColor: globalConfig.textColor,
    });
  }, [globalConfigList, isGlobal, templateList, whichPage, defaultTemplate]);

  useEffect(() => {
    // 单个折扣码配置
    if (!id || isGlobal) return;
    const discountCode = discountCodeList.find(
      (item) => item.whichPage === whichPage
    );
    if (!discountCode) {
      setColorConfig(undefined);
      setSelectTemplate(defaultTemplate);
      setUseGlobalConfig(true);
      setShowDiscountCode(false);
      setLeftText('');
      return;
    }
    const template = templateList.find(
      (item) => item.id === discountCode?.templateId
    );
    setSelectTemplate(template);
    setLeftText(discountCode.leftText);
    setColorConfig({
      btnBgColor: discountCode.btnBgColor,
      btnTextColor: discountCode.btnTextColor,
      codeBgColor: discountCode.codeBgColor,
      codeColor: discountCode.codeColor,
      textColor: discountCode.textColor,
    });
    setShowDiscountCode(discountCode.show);
    setUseGlobalConfig(discountCode.useGlobalConfig);
  }, [
    discountCodeList,
    id,
    templateList,
    whichPage,
    isGlobal,
    defaultTemplate,
  ]);

  const getColor = useCallback(
    (key: TColorType) => {
      return (
        colorConfig?.[key] ||
        selectTemplate?.[key] ||
        defaultTemplate?.[key] ||
        '#000000'
      );
    },
    [colorConfig, selectTemplate, defaultTemplate]
  );

  return (
    <div
      className={classNames({
        'sm:flex sm:gap-2': true,
        'not-destroy-hidden': hidden,
      })}
    >
      <div className="flex-1 w-full min-w-[180px] sm:max-w-[510px]">
        {!isGlobal && (
          <LeftItemContain className="flex justify-between items-center gap-1">
            <div>
              <span className="font-bold text-[14px]">展示折扣券</span>
              <br />
              <span className="text-[12px] text-[#858585] mt-2">
                启用后，客户可以直接在对应的商品详情页应用折扣码
              </span>
            </div>
            <Swicth
              value={showDiscountCode}
              onChange={(show) => {
                setShowDiscountCode(show);
              }}
              className="flex-shrink-0"
            />
          </LeftItemContain>
        )}

        {!isGlobal && (
          <LeftItemContain className="flex justify-between items-center gap-1">
            <div className="font-bold text-[14px]">跟随全局样式</div>
            <Swicth
              value={useGlobalConfig}
              onChange={(show) => {
                setUseGlobalConfig(show);
              }}
              className="flex-shrink-0"
            />
          </LeftItemContain>
        )}

        <LeftItemContain>
          <div className="font-bold text-[14px]">模板选择</div>
          <div className="h-[1px] bg-slate-300 my-2" />
          <div className="flex gap-[6px] mb-1" style={{ flexFlow: 'wrap' }}>
            {templateList
              .slice(0, showAllTemplate ? undefined : 3)
              .map((template) => {
                const { name, id } = template;
                const isSelected =
                  (selectTemplate || defaultTemplate)?.id === id;
                return (
                  <div
                    key={id}
                    onClick={() => {
                      setSelectTemplate(template);
                    }}
                    className={classNames({
                      'relative w-[155px] h-[100px] rounded-md border-solid border-1':
                        true,
                      'border-[#2065f9]': isSelected,
                      'border-[#d7dbe7]': !isSelected,
                    })}
                  >
                    <div
                      className={classNames({
                        'absolute top-[-1px] left-[-1px] text-white bg-[#2065f9] rounded-md w-4 h-4 fill-white ':
                          true,
                        'opacity-0': !isSelected,
                        'opacity-100': isSelected,
                      })}
                    >
                      <Icon source={TickMinor} />
                    </div>
                    <img
                      src={`${templatePreviewDir}/${name.toLowerCase()}.png`}
                      alt={name}
                      className="w-full object-contain rounded-t-[5px]"
                    />
                    <br />
                    <span className="h-7 leading-7 pl-4">{name}</span>
                  </div>
                );
              })}
          </div>
          <Button
            variant="plain"
            disclosure={showAllTemplate ? 'up' : 'down'}
            onClick={() => {
              setShowAllTemplate(!showAllTemplate);
            }}
          >
            {showAllTemplate ? '更少模板' : '更多模板'}
          </Button>
        </LeftItemContain>

        <LeftItemContain>
          <div className="font-bold text-[14px] flex gap-1">
            <span>样式设置</span>
            <span
              className="ml-2 text-[#1890ff] cursor-pointer flex items-center"
              onClick={() => setColorConfig(undefined)}
            >
              <SyncOutlined /> 重置
            </span>
          </div>
          <div className="h-[1px] bg-slate-300 my-2" />
          <div
            className="grid gap-4"
            style={{ flexFlow: 'wrap', gridTemplateColumns: '1fr 1fr' }}
          >
            <ColorSetting
              text="折扣码背景色"
              value={getColor('codeBgColor')}
              onChange={(value) => {
                setColorConfig({
                  ...colorConfig,
                  codeBgColor: value.toHexString(),
                });
              }}
            />
            <ColorSetting
              text="按钮背景色"
              value={getColor('btnBgColor')}
              onChange={(value) => {
                setColorConfig({
                  ...colorConfig,
                  btnBgColor: value.toHexString(),
                });
              }}
            />
            <ColorSetting
              text="文字颜色"
              value={getColor('textColor')}
              onChange={(value) => {
                setColorConfig({
                  ...colorConfig,
                  textColor: value.toHexString(),
                });
              }}
            />
            <ColorSetting
              text="按钮文字色"
              value={getColor('btnTextColor')}
              onChange={(value) => {
                setColorConfig({
                  ...colorConfig,
                  btnTextColor: value.toHexString(),
                });
              }}
            />
            <ColorSetting
              text="折扣码文字色"
              value={getColor('codeColor')}
              onChange={(value) => {
                setColorConfig({
                  ...colorConfig,
                  codeColor: value.toHexString(),
                });
              }}
            />
          </div>
        </LeftItemContain>

        {!isGlobal && (
          <LeftItemContain>
            <div className="font-bold text-[14px]">内容设置</div>
            <div className="h-[1px] bg-slate-300 my-2" />
            <TextField
              label="优惠文案"
              autoComplete="off"
              value={leftText || ''}
              onChange={setLeftText}
            />
          </LeftItemContain>
        )}
      </div>
      {/* 父容器最小宽度640px, 左侧设置栏宽度：180px， gap：8px, 16px: 父容器padding */}
      <div
        className="min-w-[calc(640px-180px-8px-16px)] bg-gray-100 rounded-lg p-2"
        style={{ flex: 2 }}
      >
        <div className="flex justify-end px-2 pt-2 border-solid border-transparent border-b-slate-300">
          <div className="flex items-center text-[26px] gap-4 mb-[-2px]">
            <div
              className={classNames({
                'cursor-pointer text-[23px] pb-2 border-solid border-transparent':
                  true,
                '!border-[#1890ff]': previewDevice === 'mobile',
              })}
              style={{ borderWidth: 0, borderBottomWidth: '2px' }}
              onClick={() => {
                setPreviewDevice('mobile');
              }}
            >
              <ImMobile />
            </div>
            <div
              className={classNames({
                'cursor-pointer pb-2 border-solid border-transparent': true,
                '!border-[#1890ff]': previewDevice === 'pc',
              })}
              style={{ borderWidth: 0, borderBottomWidth: '2px' }}
              onClick={() => {
                setPreviewDevice('pc');
              }}
            >
              <RiComputerLine />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-4">
          {previewDevice === 'mobile' && (
            <div className="rounded-lg bg-white w-[360px]">
              <div className="rounded-lg overflow-hidden">
                <div className="p-4 bg-white flex justify-between items-center">
                  <div className="bg-slate-200 rounded w-12 h-6"></div>
                  <div className="flex gap-2">
                    <div className="bg-slate-200 rounded-full w-6 h-6"></div>
                    <div className="bg-slate-200 rounded-full w-6 h-6"></div>
                    <div className="bg-slate-200 rounded-full w-6 h-6"></div>
                  </div>
                </div>
                <div className="bg-slate-200 flex items-center justify-center">
                  <BagsIcon />
                </div>
                <div className="bg-white p-4">
                  <div className="bg-slate-200 rounded h-8 w-36 mb-4" />
                  <div className="bg-slate-200 rounded h-4 w-full mb-4" />
                  <div className="text-slate-200 text-[26px] mb-4">$$$$</div>
                  <div className="mb-4">
                    <Classic
                      btnBgColor={colorConfig?.btnBgColor || undefined}
                      btnTextColor={colorConfig?.btnTextColor || undefined}
                      codeBgColor={colorConfig?.codeBgColor || undefined}
                      codeColor={colorConfig?.codeColor || undefined}
                      textColor={colorConfig?.textColor || undefined}
                      code={code || undefined}
                      leftText={leftText || undefined}
                      previewDevice={previewDevice}
                    />
                  </div>
                  <div className="text-[18px] text-slate-400 flex gap-4 mb-4">
                    <div className="rounded px-4 py-2 bg-slate-200">XS</div>
                    <div className="rounded px-4 py-2 bg-slate-200">M</div>
                    <div className="rounded px-4 py-2 bg-slate-200">XL</div>
                  </div>
                  <div className="bg-slate-200 text-[18px] text-slate-400 rounded text-center py-4">
                    ADD TO CART
                  </div>
                </div>
              </div>
            </div>
          )}
          {previewDevice === 'pc' && (
            <div className="rounded-lg bg-white w-full">
              <div className="rounded-lg overflow-hidden">
                <div className="p-2 bg-slate-200 flex">
                  <div className="flex gap-2">
                    <div className="bg-slate-300 rounded-full w-3 h-3"></div>
                    <div className="bg-slate-300 rounded-full w-3 h-3"></div>
                    <div className="bg-slate-300 rounded-full w-3 h-3"></div>
                  </div>
                </div>
                <div className="bg-white flex justify-center py-16">
                  <div className="bg-slate-200 flex items-center justify-center w-[200px] h-fit">
                    <BagsIcon />
                  </div>
                  <div className="bg-white px-6">
                    <div className="bg-slate-200 rounded h-8 w-36 mb-4" />
                    <div className="bg-slate-200 rounded h-4 w-full mb-4" />
                    <div className="text-slate-200 text-[26px] mb-4 font-bold">
                      $$$$
                    </div>
                    <div className="mb-4 w-[300px]">
                      <Classic
                        btnBgColor={colorConfig?.btnBgColor || undefined}
                        btnTextColor={colorConfig?.btnTextColor || undefined}
                        codeBgColor={colorConfig?.codeBgColor || undefined}
                        codeColor={colorConfig?.codeColor || undefined}
                        textColor={colorConfig?.textColor || undefined}
                        code={code || undefined}
                        leftText={leftText || undefined}
                        previewDevice={previewDevice}
                      />
                    </div>
                    <div className="text-[18px] text-slate-400 flex gap-4 mb-4">
                      <div className="rounded px-4 py-2 bg-slate-200">XS</div>
                      <div className="rounded px-4 py-2 bg-slate-200">M</div>
                      <div className="rounded px-4 py-2 bg-slate-200">XL</div>
                    </div>
                    <div className="bg-slate-200 text-[18px] text-slate-400 rounded text-center py-4">
                      ADD TO CART
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
