import React from 'react'
import FormIPD from './FormIPD'

export default function page() {
  return (
    <div className='bg-white p-4 rounded-xl text-wrap select-none'>
        <p className='font-black mb-2'>แบบตรวขประเมินคุณภาพการบันทึกเวชระเบียนผู้ป่วยใน Medical Record Audit Form (IPD)</p>
        <hr className='border-0.5 border-gray-200' />
        <FormIPD />
        <p className='text-red-600 font-pridi font-semibold text-xs text-end mt-2'>การแก้ไขข้อมูล ระบบจะต้องได้รับการปรับเปลี่ยนข้อมูลในตารางรวมถึงหัวข้อต่างๆ และโปรดเช็คข้อมูลให้ระเอียดก่อนบันทึกข้อมูล</p>
    </div>
  )
}
