const { prettier } = require('@umijs/fabric');

module.exports = {
  ...prettier,
  plugins: ['@trivago/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],
  // tailwindcss
  tailwindConfig: './tailwind.config.ts',
  tailwindFunctions: ['clsx', 'cn', 'cva'],
  tailwindAttributes: [
    'className',
    'className',
    'inputClass',
    'labelClass',
    'contentClassNames',
    'liClass',
    'contentClass',
    'iconButtonClass',
    'topPlaceholderClassName',
    'spinClassName',
  ],
  // sort imports
  importOrder: ['<THIRD_PARTY_MODULES>', '^@beacon/', '^@/', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  printWidth: 160,
  singleAttributePerLine: true,
};
