export const metadata = {
  title: "เข้าสู่ระบบ | โรงพยาบาลอากาศอำนวย"
}

import FormLogin from "./FormLogin";

export default function page() {
  return (
    <div className="select-none">
      <h1 className="text-center font-semibold text-xl">เข้าสู่ระบบ</h1>
      <FormLogin />
    </div>
  )
}
