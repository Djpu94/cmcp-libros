const buttonBase =
  'inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-[10px] text-[15px] font-bold transition duration-150 ease-in-out disabled:cursor-not-allowed disabled:opacity-70'

const focusRing = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring'

const fieldBase =
  'box-border w-full rounded-[10px] border border-line-field bg-white px-3.5 text-[15px] text-ink-field transition duration-150 ease-in-out placeholder:text-placeholder focus:border-brand-focus focus:shadow-[0_0_0_3px_rgb(119_81_211/0.14)] focus:outline-0'

export const bookStyles = {
  panel: 'grid gap-6 rounded-2xl border border-line bg-white p-6',
  statePanel: 'flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-line bg-white p-8 text-center',
  statePanelError: 'border-danger-line bg-danger-bg text-danger-strong',
  list: 'mt-6 grid gap-5',
  toolbar: 'flex flex-wrap justify-end gap-3',
  actions: 'flex flex-wrap justify-end gap-3',

  buttonPrimary: `${buttonBase} min-h-12 border-0 bg-brand px-[18px] text-white enabled:hover:-translate-y-px enabled:hover:bg-brand-hover ${focusRing}`,
  buttonSecondary: `${buttonBase} min-h-10 border border-line-field bg-white px-[18px] text-ink enabled:hover:bg-surface-hover ${focusRing}`,
  buttonDanger: `cursor-pointer rounded-lg border border-action-danger bg-white px-3 py-1.5 text-action-danger disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`,

  filtersGrid: 'grid items-start gap-4 rounded-2xl border border-line bg-white p-5   grid-cols-[repeat(auto-fit,minmax(150px,1fr))]',
    filterField: 'grid min-w-0 content-start gap-1.5',
  filterFieldCheckbox: 'flex min-h-10 min-w-0 items-center gap-2 self-end',
  filterActions: 'col-span-full flex flex-wrap items-center justify-end gap-3',
  filterControl: `box-border w-full min-w-0 min-h-10 rounded-[10px] border border-line-filter bg-white px-3 py-2 text-[15px] ${focusRing}`,

  tableWrapper: 'overflow-x-auto rounded-2xl border border-line bg-white',
  table: 'w-full border-collapse',
  tableCaption: 'caption-top px-4 py-3 text-left font-semibold',
  tableCell: 'border-t border-line-soft px-4 py-3 text-left align-middle',
  tableHeadCell: 'border-line-soft px-4 py-3 text-left align-middle text-[13px] text-muted-strong',
  tableActions: 'flex flex-wrap items-center gap-3',
  tableLink: 'text-link',
  pagination: 'flex flex-wrap items-center justify-between gap-4',

  formGrid: 'grid items-start gap-4 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]',
  formError: 'm-0 rounded-xl border border-danger-line bg-danger-bg px-4 py-3 text-danger-strong',
  checkboxField: 'flex items-center gap-2 self-center',
  imageFieldset: 'm-0 grid gap-4 rounded-xl border border-line-soft p-4',
  imageLegend: 'px-1 font-semibold',
  hint: 'text-[13px] text-muted-strong',
  preview: 'max-h-[220px] max-w-40 justify-self-start rounded-lg object-contain',

  fieldWrapper: 'grid gap-2',
  fieldLabel: 'text-[14px] font-[650] text-ink',
  fieldInput: `${fieldBase} min-h-12 px-3.5`,
  fieldInputError: 'border-danger',
  fieldError: 'text-[13px] text-danger-ink',

  detailBody: 'grid items-start gap-6 grid-cols-[minmax(120px,200px)_1fr] max-[600px]:grid-cols-1',
  detailCover: 'max-h-[300px] w-full rounded-xl bg-surface-muted object-contain',
  detailCoverEmpty: 'grid aspect-[3/4] place-items-center text-muted-strong',
  detailTitle: 'mt-0 mb-4',
  detailFields: 'm-0 grid gap-x-6 gap-y-2 grid-cols-[max-content_1fr]',
  detailTerm: 'font-semibold text-muted-strong',
  detailDescription: 'm-0',
}
