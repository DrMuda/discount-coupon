async function handleApply(discountCouponCode, codeMd5) {
  const productsDetailPathTest = /^\/products\/.+$/;
  const cartPathTest = /^\/cart$/;
  const isProductDetail = productsDetailPathTest.test(location.pathname);
  const isCart = cartPathTest.test(location.pathname);
  let whichPage = isProductDetail ? 1 : 0;
  whichPage === 0 && (whichPage = isCart ? 2 : 0);

  // change style
  const applyBtnList = document.querySelectorAll(`.${codeMd5} .apply.btn`);
  const appliedBtnList = document.querySelectorAll(`.${codeMd5} .applied.btn`);
  if (!applyBtnList || !appliedBtnList) return;
  applyBtnList.forEach((applyBtn) => {
    applyBtn.className = 'apply btn none';
  });
  appliedBtnList.forEach((appliedBtn) => {
    appliedBtn.className = 'applied btn';
  });


  if (whichPage === 2) {
    console.log(window.Shopify.routes.root);
    return
  }

  // 商品详情页才需要复制及提示
  // copy discountCouponCode

  await navigator.clipboard.writeText(discountCouponCode).catch((error) => {
    console.error('catch', error);
    // clipboard api 失效， 采用原始的方法
    const input = document.createElement('input');
    input.innerText = discountCouponCode;
    input.value = discountCouponCode;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    input.remove();
  });

  // show toast
  const toast = document.createElement('div');
  toast.innerText = 'Coupon code is successfully copy';
  if (!toast) return;
  toast.className = 'copy-success-toast toast-show';
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.setAttribute('style', 'opacity: 0;');
  }, 2000);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}
