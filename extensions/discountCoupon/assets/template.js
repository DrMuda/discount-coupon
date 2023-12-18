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
    fetch(window.Shopify.routes.root + 'cart.js');
    // 44254330355933
    // 44254330650845
    const updates = {
      line: 1,
      // id: 44254330912989,
      // discounts: [{ amount: 14999, title: '订单降价' }],
      discounts: [],
    };

    fetch(window.Shopify.routes.root + 'cart/change.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })
      .then((response) => {
        return response.json();
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    return;
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
