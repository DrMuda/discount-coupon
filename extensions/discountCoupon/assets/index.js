const baseUrl = 'https://aruba-hold-nearly-shot.trycloudflare.com';

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
 * @param {string} url 模板文件路径
 * @returns {Promise<string|null>}
 */
async function loadTemplateAssets(url) {
  const res = await fetch(url).catch(defaultCatch);
  if (res?.ok) {
    return response.text();
  }
  return null;
}

window.onload = async () => {
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
  console.log({
    classicJs,
    classicCss,
    classicHtml,
    globalConfgList,
    discountCodeList,
  });

  // 判断哪个页面
  const productsDetailPathTest = /^\/products\/.+$/;
  const cartPathTest = /^\/cart$/;
  const isProductDetail = productsDetailPathTest.test(location.pathname);
  const isCart = cartPathTest.test(location.pathname);
  let whichPage = isProductDetail ? 1 : -1;
  whichPage = isCart ? 2 : -1;
  const globalConfg = globalConfgList.find(
    (item) => whichPage === item.whichPage
  );

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
    if (whichPage !== discountCode.whichPage) return;

    const { useGlobalConfig, show, leftText, code } = discountCode;
    let codeBgColor = null;
    let codeColor = null;
    let textColor = null;
    let btnBgColor = null;
    let btnTextColor = null;
    let templateId = null;
    if (!show) return;
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
    const templateHtmlPath = getVar(`${template.name.toLowerCase()}Html`);

    jsPathSet.add(templateJsPath);
    cssPathSet.add(templateCssPath);

    const templateHtml = await loadTemplateAssets(templateHtmlPath);
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

  // 将html添加到页面
  let targetEle = null;
  if (whichPage === 1) {
    targetEle = document.querySelector('.product-form__buttons');
  }
  if (whichPage === 2) {
    targetEle = document.querySelectorAll('.cart__footer .cart__ctas');
  }
  if (!targetEle) {
    console.error('targetEle notFound');
    return;
  }
  const contain = document.createElement('div');
  if (htmlList.length === 1) {
    contain.innerHTML = htmlList[0];
    targetEle.parentElement?.insertBefore(targetEle, htmlList[0]);
    return
  }
  const multipleDiscountContain = getVar("multipleDiscountContain")
  for (const html of htmlList) {
    contain.innerHTML = contain.innerHTML + html;
    targetEle.parentElement?.insertBefore(targetEle, html);
  }
};
