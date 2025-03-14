import FormLogin from "./FormLogin";

export default function page() {
  return (
    <div className="">
      <div className="flex gap-2 justify-center items-center my-2">
        <img className="max-w-[80px]" src="http://akathospital.com/assets/images/moph-sm.png" alt="logo" />
      </div>
      <h1 className="text-center font-semibold text-xl">เข้าสู่ระบบ</h1>
      <FormLogin />
      <p className="text-center text-xs border-t border-gray-300 pt-2">&copy; Copyright 2025 โรงพยาบาลอากาศอำนวย</p>
    </div>
  )
}
