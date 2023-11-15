function handleClickApply(discountCouponCode) {
  // change style
  const applyBtn = document.querySelector('.apply.btn');
  const appliedBtn = document.querySelector('.applied.btn');
  if (!applyBtn || !appliedBtn) return;
  applyBtn.className = 'apply btn none';
  appliedBtn.className = 'applied btn';

  // copy discountCouponCode
  const input = document.createElement('input');
  input.innerText = discountCouponCode;
  input.value = discountCouponCode;
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  input.remove();

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

// 检测是否为从右到左排版， 并设置相应样式
const html = document.querySelector('html');
const htmlDir = html.getAttribute('dir');
if (htmlDir === 'rtl') {
  const leftContentList = document.querySelectorAll('.left-content');
  const rightContent = document.querySelector('.right-content');
  const divider = document.querySelector('.divider');
  leftContentList.forEach((leftContent) => {
    leftContent.setAttribute('style', 'left: unset; right: 0;');
  });
  rightContent.setAttribute('style', 'left: 0; right: unset;');
  divider.setAttribute('style', 'left: 120px; right: unset;');
}
