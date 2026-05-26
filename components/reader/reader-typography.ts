/** Shared reading typography — long-form comfort, minimal distraction */

export const readerColumnClass =
  "min-h-0 flex-1 overflow-y-auto bg-[#0c0d12] px-4 pt-8 pb-[calc(2.5rem+env(safe-area-inset-bottom))] md:px-12 md:pt-12 md:pb-12 lg:px-14";

export const readerTitleClass =
  "mb-10 max-w-[42rem] text-[1.375rem] font-medium leading-[1.35] tracking-[-0.02em] text-zinc-100 md:text-[1.5rem]";

export const readerArticleClass =
  "reader-article mx-auto w-full max-w-[42rem] space-y-[1.65em] antialiased [text-rendering:optimizeLegibility] selection:bg-accent/20 selection:text-zinc-100 md:space-y-[1.45em]";

/** Applied to each paragraph — body copy rhythm */
export const readerParagraphClass =
  "select-text text-pretty text-[1.0625rem] font-normal leading-[1.95] tracking-[0.004em] text-[#c4c6d0] md:leading-[1.78]";
