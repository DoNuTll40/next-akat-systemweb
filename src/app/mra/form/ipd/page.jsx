import React from 'react'
import FormIPD from './FormIPD'

export default function page() {
  return (
    <div className='bg-white p-4 rounded-xl text-wrap select-none'>
        <p className='font-black mb-2'>แบบตรวขประเมินคุณภาพการบันทึกเวชระเบียนผู้ป่วยใน Medical Record Audit Form (IPD)</p>
        <hr className='border-0.5 border-gray-200' />
        <FormIPD />
    </div>
  )
}
