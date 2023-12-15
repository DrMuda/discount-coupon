const baseUrl = 'https://lighting-walked-suzuki-survival.trycloudflare.com';
const cosDomain =
  'https://revasocialmedia-1307444343.cos.accelerate.myqcloud.com';
const templatePreviewDir = `${cosDomain}/shopify_discount/template_preview`;
const templateHtml = {};

/**
 * @description 因有些数据无法传参至方法， 所以从页面上获取变量。 页面上使用一个特殊id的div包裹一个字符串， 以此实现传参
 * @param {string} name 变量名
 * @returns {string | undefined}
 */
function getVar(name) {
  const varDiv = document.querySelector(
    `#discount-coupon-container .variable #${name}`
  );
  if (varDiv) {
    return varDiv.innerHTML.trim();
  }
  return undefined;
}

function defaultCatch(error) {
  console.error(error);
  return null;
}

/**
 * 获取模板文件
 * @param {string} templateName 模板文件名
 * @returns {Promise<string|null>}
 */
async function loadTemplateHtml(templateName) {
  if (templateHtml[templateName]) return templateHtml[templateName];
  const res = await axios
    .get(`${templatePreviewDir}/${templateName}.html`, { responseType: 'blob' })
    .catch(defaultCatch);
  if (res && res.data instanceof Blob) {
    const fileReader = new FileReader();
    fileReader.readAsText(res.data);
    const success = await new Promise((resolve, reject) => {
      fileReader.onload = () => resolve(true);
      fileReader.onerror = (error) => {
        reject(false);
        console.error(error);
      };
    });
    if (success) {
      templateHtml[templateName] = fileReader.result;
      return fileReader.result;
    }
    return null;
  }
  return null;
}

function getCookie(name) {
  const cookieArr = document.cookie.split(';');
  for (let i = 0; i < cookieArr.length; i++) {
    const cookiePair = cookieArr[i].split('=');
    const cookieName = cookiePair[0].trim();
    if (cookieName === name) {
      return cookiePair[1];
    }
  }
  return null;
}

const init = async () => {
  // 数据收集
  const globalConfgRes = await axios
    .get(`${baseUrl}/api/globalConfig/get`, {
      params: { shop: location.hostname },
    })
    .catch(defaultCatch);
  const discountCodeRes = await axios
    .get(`${baseUrl}/api/discountCode/get`, {
      params: { shop: location.hostname },
    })
    .catch(defaultCatch);
  const templateRes = await axios
    .get(`${baseUrl}/api/template/getAll`)
    .catch(defaultCatch);
  const globalConfgList = globalConfgRes?.data?.data || [];
  let discountCodeList = discountCodeRes?.data?.data || [];
  const templateList = templateRes?.data?.data || [];

  // 判断哪个页面
  const productsDetailPathTest = /^\/products\/.+$/;
  const cartPathTest = /^\/cart$/;
  const isProductDetail = productsDetailPathTest.test(location.pathname);
  const isCart = cartPathTest.test(location.pathname);
  let whichPage = isProductDetail ? 1 : 0;
  whichPage === 0 && (whichPage = isCart ? 2 : 0);
  const globalConfg = globalConfgList.find(
    (item) => whichPage === item.whichPage
  );
  if (!whichPage) return;

  // 排序折扣券
  // 全局配置理论上最多有两个， 分别作用于商品详情页和购物车页面
  // 排序字段不区分页面， 会保存在其中一个全局配置中， 或两者都有， 或两者都无， 理论上会是相同的
  const sort = (globalConfgList[0] || globalConfgList[1])?.sort;
  if (sort) {
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

  // 要动态增加的js、css文件路径集合
  const jsPathSet = new Set();
  const cssPathSet = new Set();
  // 包含颜色、文本、html内容的对象数组
  const htmlList = [];

  // 收集要动态增加到页面的js、css、html
  for (const discountCode of discountCodeList) {
    if (whichPage !== discountCode.whichPage) continue;

    const { useGlobalConfig, show, leftText, code } = discountCode;
    if (!show) continue;
    let codeBgColor = null;
    let codeColor = null;
    let textColor = null;
    let btnBgColor = null;
    let btnTextColor = null;
    let templateId = null;
    if (useGlobalConfig !== false) {
      templateId = globalConfg?.templateId;

      codeBgColor = globalConfg?.codeBgColor;
      codeColor = globalConfg?.codeColor;
      textColor = globalConfg?.textColor;
      btnBgColor = globalConfg?.btnBgColor;
      btnTextColor = globalConfg?.btnTextColor;
    } else {
      templateId = discountCode.templateId;

      codeBgColor = discountCode.codeBgColor;
      codeColor = discountCode.codeColor;
      textColor = discountCode.textColor;
      btnBgColor = discountCode.btnBgColor;
      btnTextColor = discountCode.btnTextColor;
    }
    const template =
      templateList.find(({ id }) => id === templateId) || templateList[0];
    if (template) {
      // 在使用自定义颜色后， 仍然为null值的， 使用模板的颜色
      !codeBgColor && (codeBgColor = template.codeBgColor);
      !codeColor && (codeColor = template.codeColor);
      !textColor && (textColor = template.textColor);
      !btnBgColor && (btnBgColor = template.btnBgColor);
      !btnTextColor && (btnTextColor = template.btnTextColor);
    }

    const templateJsPath = getVar(`${template.name.toLowerCase()}Js`);
    const templateCssPath = getVar(`${template.name.toLowerCase()}Css`);

    jsPathSet.add(templateJsPath);
    cssPathSet.add(templateCssPath);

    const templateHtml = await loadTemplateHtml(template.name.toLowerCase());
    htmlList.push({
      codeBgColor,
      codeColor,
      textColor,
      btnBgColor,
      btnTextColor,
      leftText,
      code,
      html: templateHtml,
    });
  }

  const discountCouponContainer = document.querySelector(
    '#discount-coupon-container'
  );
  // 先加载css， js等dom插入后再加载，避免有些加载立即执行的操作失效
  cssPathSet.forEach((jsPath) => {
    const link = document.createElement('link');
    link.href = jsPath;
    link.rel = 'stylesheet';
    discountCouponContainer.appendChild(link);
  });

  // 将html添加到页面
  let targetEle = null;
  if (whichPage === 1) {
    targetEle = document.querySelector('.product-form__error-message-wrapper');
  }
  if (whichPage === 2) {
    targetEle = document.querySelector('.cart__footer .cart__ctas');
  }
  if (!targetEle) {
    console.error('targetEle notFound');
    return;
  }
  const contain = document.createElement('div');
  setTimeout(() => {
    targetEle.parentElement?.insertBefore(contain, targetEle);
  }, 10);

  const replaceHtmlByKey = (content, key, value) => {
    const test = new RegExp(`{{ ${key} }}`, 'g');
    return content?.replace?.(test, value);
  };
  const getReplaceTemplateHtml = (htmlItem) => {
    let res = '';
    const {
      codeBgColor,
      codeColor,
      textColor,
      btnBgColor,
      btnTextColor,
      leftText,
      code,
      html,
    } = htmlItem;
    res = html;
    res = replaceHtmlByKey(res, 'codeBgColor', codeBgColor);
    res = replaceHtmlByKey(res, 'codeColor', codeColor);
    res = replaceHtmlByKey(res, 'textColor', textColor);
    res = replaceHtmlByKey(res, 'btnBgColor', btnBgColor);
    res = replaceHtmlByKey(res, 'btnTextColor', btnTextColor);
    res = replaceHtmlByKey(res, 'leftText', leftText);
    res = replaceHtmlByKey(res, 'code', code);
    res = replaceHtmlByKey(res, 'codeMd5', `code-md5-${md5(code)}`);
    return res;
  };

  if (htmlList.length === 1) {
    contain.innerHTML = getReplaceTemplateHtml(htmlList[0]);
  } else {
    let multipleDiscountContainHtml = await loadTemplateHtml(
      'multipleDiscountContain'
    );
    const { code: firstCode, leftText: firstLeftText } = htmlList[0];
    multipleDiscountContainHtml = replaceHtmlByKey(
      multipleDiscountContainHtml,
      'firstCode',
      firstCode
    );
    multipleDiscountContainHtml = replaceHtmlByKey(
      multipleDiscountContainHtml,
      'firstCodeMd5',
      `code-md5-${md5(firstCode)}`
    );
    multipleDiscountContainHtml = replaceHtmlByKey(
      multipleDiscountContainHtml,
      'firstLeftText',
      firstLeftText
    );
    let moreContent = '';
    for (const htmlItem of htmlList) {
      moreContent = moreContent + getReplaceTemplateHtml(htmlItem);
    }
    multipleDiscountContainHtml = replaceHtmlByKey(
      multipleDiscountContainHtml,
      'moreContent',
      moreContent
    );
    contain.innerHTML = multipleDiscountContainHtml;
  }
  contain.setAttribute('style', 'margin-bottom: 8px');
  jsPathSet.forEach((jsPath) => {
    const script = document.createElement('script');
    script.src = jsPath;
    script.defer = true;
    discountCouponContainer.appendChild(script);
  });
  console.log('endload');
};

if (document) {
  init();
} else {
  window.addEventListener('load', init);
}
