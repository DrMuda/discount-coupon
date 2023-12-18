import {
  type LoaderFunctionArgs,
  json,
  type ActionFunctionArgs,
} from '@remix-run/node';
import dayjs from 'dayjs';
import { EEffectStatus, type ITableRowData } from '~/routes/app._index';

export interface IResult<Data = any> {
  data: Data;
  msg: string;
  code: number;
}
export const publicLoader = async (
  loaderFunctionArgs: LoaderFunctionArgs,
  callback: (loaderFunctionArgs: LoaderFunctionArgs) => Promise<IResult>
) => {
  const { request } = loaderFunctionArgs;
  const origin = request.headers.get('Origin') || request.headers.get('origin');
  const publicHeaders = origin && getPublicHeaders(origin);

  const data = await callback(loaderFunctionArgs);

  return json(data, { headers: publicHeaders || undefined });
};
export const publicAction = async (
  actionFunctionArgs: ActionFunctionArgs,
  callback: (actionFunctionArgs: ActionFunctionArgs) => Promise<IResult>
) => {
  const { request } = actionFunctionArgs;
  const origin = request.headers.get('Origin') || request.headers.get('origin');
  const publicHeaders = origin && getPublicHeaders(origin);

  const data = await callback(actionFunctionArgs);

  return json(data, { headers: publicHeaders || undefined });
};

export const getPublicHeaders = (origin: string) => {
  const regExp = new RegExp('https://.+.myshopify.com');
  if (regExp.test(origin))
    return {
      'Access-Control-Allow-Origin': origin, // 允许跨域访问
      'Access-Control-Allow-Methods':
        'GET, POST, OPTIONS, HEAD, PUT, DELETE, CONNECT', // 允许的请求方法
      'Access-Control-Allow-Headers': 'Content-Type', // 允许的请求头
    };
  return undefined;
};

export const isNil = (value: any): value is null | undefined => {
  if (value === undefined || value === null) return true;
  return false;
};

export type TOption = {
  label: any;
  value: string;
};
export const mapToOptions = (map: Record<string, any>): TOption[] => {
  return Object.entries(map).map(([key, value]) => {
    return { label: value, value: key };
  });
};

// 算出生效状态
export const getEffectStatus = (discountCode: ITableRowData) => {
  let effectStatus: EEffectStatus | null = null;
  const startTime = discountCode.starts_at
    ? dayjs(discountCode.starts_at)
    : null;
  const endTime = discountCode.ends_at ? dayjs(discountCode.ends_at) : null;
  if (startTime) {
    if (startTime > dayjs()) {
      effectStatus = EEffectStatus.Arranged;
    }
    if (startTime <= dayjs()) {
      if (endTime && endTime <= dayjs()) {
        effectStatus = EEffectStatus.Expired;
      } else {
        effectStatus = EEffectStatus.InEffect;
      }
    }
  }
  return effectStatus;
};

// 获取url参数
export const getUrlParams = (urlStr: string) => {
  if (typeof urlStr !== 'string') return {};
  const parmas: Record<string, string> = {};
  const url = new URL(urlStr);
  const searchParams = url.searchParams;
  Array.from(searchParams.entries()).forEach(([key, value]) => {
    parmas[key] = value;
  });
  return parmas;
};

export const showToast = ({
  content,
  duration,
}: {
  content: string;
  duration?: number;
}) => {
  const toast = document.createElement('div');
  toast.innerText = content;
  if (!toast) return;
  toast.className = 'toast toast-show';
  document.body.appendChild(toast);
  if (isNil(duration)) {
    duration = 2000;
  }
  setTimeout(() => {
    toast.setAttribute('style', 'opacity: 0;');
  }, duration);
  setTimeout(() => {
    toast.remove();
  }, duration + 1000);
};

export const defaultCatch = (error: any) => {
  console.error(error);
  return null;
};

// 获取url上用于验证的参数
export const getUrlSessionParams = () => {
  const { embedded, hmac, host, id_token, locale, session, shop, timestamp } =
    getUrlParams(location.href);
  const params = {
    embedded,
    hmac,
    host,
    id_token,
    locale,
    session,
    shop,
    timestamp,
  };
  const search = Object.entries(params)
    .map(([key, value]) => `${key}=${value || ''}`)
    .join('&');
  return { params, search };
};
