function setClassicRtl() {
  const classic = document.querySelector('.classic');

  // 检测是否为从右到左排版， 并设置相应样式
  const html = document.querySelector('html');
  const htmlDir = html.getAttribute('dir');
  if (htmlDir === 'rtl') {
    const leftContentList = document.querySelectorAll('.classic .left-content');
    const rightContent = document.querySelector('.classic .right-content');
    const divider = document.querySelector('.classic .divider');
    leftContentList.forEach((leftContent) => {
      leftContent.setAttribute('style', 'left: unset; right: 0;');
    });
    rightContent.setAttribute('style', 'left: 0; right: unset;');
    divider.setAttribute('style', 'left: 120px; right: unset;');
  }
}

if (document) {
  setClassicRtl();
} else {
  window.addEventListener('load', setClassicRtl);
}
