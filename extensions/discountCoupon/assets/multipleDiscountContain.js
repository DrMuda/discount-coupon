function toggleShowMore() {
  const moreBtn = document.querySelector('.multiple-discount-contain .more');
  const moreContentContain = document.querySelector('.more-content-contain');
  if (!moreBtn || !moreContentContain) return;
  if (moreBtn.className === 'more') {
    moreBtn.className = 'more active';
    moreContentContain.className = 'more-content-contain active';
  } else {
    moreBtn.className = 'more';
    moreContentContain.className = 'more-content-contain';
    return;
  }
  const { top, left, height, width } = moreBtn.getBoundingClientRect();
  const moreContent = document.querySelector('.more-content');
  const moreContentReact = moreContent.getBoundingClientRect();
  if (!moreContent) return;
  moreContent.setAttribute(
    'style',
    `top:${top + height}px; left: ${left - moreContentReact.width + width}px`
  );

  return false;
}
