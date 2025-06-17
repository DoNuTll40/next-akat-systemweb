export const metadata = {
  title: "สร้างผู้ใช้งาน | โรงพยาบาลอากาศอำนวย"
}

import FormSignIn from './FormSignIn'

export default function page() {
  return (
    <div className='select-none'>
      <h1 className="text-center font-semibold text-xl">สร้างผู้ใช้งาน</h1>
      <FormSignIn />
    </div>
  )
}
