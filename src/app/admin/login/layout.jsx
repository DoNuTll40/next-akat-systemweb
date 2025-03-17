import OtpInput from "@/components/OtpInput"

export const metadata = {
  title: "เข้าสู่ระบบ | โรงพยาบาลอากาศอำนวย"
}

export default function layout({children}) {

  return (
    <div className="flex justify-center w-full top-0 items-center h-screen px-4 bg-[url('https://5.imimg.com/data5/SELLER/Default/2021/8/LR/AP/SW/6976612/hospital-wallpaper.jpg')] bg-center bg-cover relative">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-xs z-0"></div>
      <OtpInput />
      <div className="w-96 bg-gray-50/85 border border-white backdrop-blur-xl text-black shadow-xl hover:border-black/20 h-fit rounded-2xl p-4 transition-all transform ease-in-out duration-300">
        {children}
      </div>
    </div>
  )
}
