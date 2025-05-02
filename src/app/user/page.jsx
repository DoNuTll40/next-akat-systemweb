import FormShowCase from "./FormShowCase";

export default function page() {
  return (
    <div className="min-h-dvh bg-white rounded-lg p-4">
      <p className="font-bold md:ml-2 md:text-lg">ข้อมูลจากระบบลงเวลา</p>
      <FormShowCase />
    </div>
  )
}
