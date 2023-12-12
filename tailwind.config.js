/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['./app/**/*.{html,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(function ({ addComponents }) {
      addComponents({
        '.transform-center': {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        },
        '.transform-x-center': {
          left: '50%',
          transform: 'translateX(-50%)',
        },
        '.transform-y-center': {
          top: '50%',
          transform: 'translateY(-50%)',
        },
        '.bg-mosaic': {
          'background-image':
            "url('https://revasocialmedia-1307444343.cos.ap-guangzhou.myqcloud.com/shopify_discount/icons/bgMosaic.svg')",
          'background-size': '20px 20px',
        },
        '.not-destroy-hidden': {
          height: 0,
          width: 0,
          opacity: 0,
          position: 'absolute !important',
          'pointer-events': 'none',
          visibility: 'hidden',
        },
      });
    }),
  ],
};
