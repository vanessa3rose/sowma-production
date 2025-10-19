

import { Button, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useState } from 'react'
import ExportButton from "../components/ExportButton";


export default function MyModal() {
  let [isOpen, setIsOpen] = useState(true)

  function open() {
    setIsOpen(true)
  }

  function close() {
    setIsOpen(false)
  }


  
  return (
    <>

    {/*Main box */}
    
    <ExportButton />

    <Dialog
      open={setIsOpen}
      onClose={() => setIsOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <DialogPanel className="w-[404px] h-[454px] bg-white rounded-xl shadow-lg flex flex-col p-6">
        <DialogTitle className="text-xl font-semibold mb-4">Select for Export</DialogTitle>

        {/*Date range box not yet filled */}
        <div className="w-[184px] h-[46px] opacity-100 rounded-[9px] bg-white border border-[#A1A1A1] border-[0.9px]">
            <div className=""></div>
            <div className=""></div>
            <div className=""></div>
        </div>
        <div className="w-[132.28px] h-[40px] opacity-100 flex items-center justify-start bg-white text-black font-inter font-medium text-[18px] leading-[39.6px] tracking-[0px]">
            Select
        </div>
        <div className="w-[132.28px] h-[40px] opacity-100 flex items-center justify-start bg-white text-black font-inter font-medium text-[18px] leading-[39.6px] tracking-[0px]">
            Instagram
        </div>
        <div className="w-[132.28px] h-[40px] opacity-100 flex items-center justify-start bg-white text-black font-inter font-medium text-[18px] leading-[39.6px] tracking-[0px]">
            Linkedin
        </div>
        <div className="w-[132.28px] h-[40px] opacity-100 flex items-center justify-start bg-white text-black font-inter font-medium text-[18px] leading-[39.6px] tracking-[0px]">
            News Letter
        </div>
        <div className="w-[132.28px] h-[40px] opacity-100 flex items-center justify-start bg-white text-black font-inter font-medium text-[18px] leading-[39.6px] tracking-[0px]">
            Twitter
        </div>
        <div className=" w-[132.28px] h-[40px] opacity-100 flex items-center justify-start bg-white text-black font-inter font-medium text-[18px] leading-[39.6px] tracking-[0px]">
            Facebook
        </div>
        <div className="w-[132.28px] h-[40px] opacity-100 flex items-center justify-start bg-white text-black font-inter font-medium text-[18px] leading-[39.6px] tracking-[0px]">
            TikTok
        </div>
        <div className="w-[28px] h-[28px] opacity-100 rounded-[4px] bg-white shadow-[inset_0_0_0_1px_#A9A9A9]"></div>
        <div className="w-[28px] h-[28px] opacity-100 rounded-[4px] bg-white shadow-[inset_0_0_0_1px_#A9A9A9]"></div>
        <div className="w-[28px] h-[28px] opacity-100 rounded-[4px] bg-white shadow-[inset_0_0_0_1px_#A9A9A9]"></div>
        <div className="w-[28px] h-[28px] opacity-100 rounded-[4px] bg-white shadow-[inset_0_0_0_1px_#A9A9A9]"></div>
        <div className="w-[28px] h-[28px] opacity-100 rounded-[4px] bg-white shadow-[inset_0_0_0_1px_#A9A9A9]"></div>
        <div className="w-[28px] h-[28px] opacity-100 rounded-[4px] bg-white shadow-[inset_0_0_0_1px_#A9A9A9]"></div>
        <div className="w-[28px] h-[28px] opacity-100 rounded-[4px] bg-white shadow-[inset_0_0_0_1px_#A9A9A9]"></div>
        <div className=""></div>

    </DialogPanel>
    </Dialog>

{/* // checkbox code */}
{/* <div class="flex items-center mb-4">
    <input id="default-checkbox" type="checkbox" value="" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
    <label for="default-checkbox" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Default checkbox</label>
</div>
<div class="flex items-center">
    <input checked id="checked-checkbox" type="checkbox" value="" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
    <label for="checked-checkbox" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Checked state</label>
</div> */}

</>
);
}
