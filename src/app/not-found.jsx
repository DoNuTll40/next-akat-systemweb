import Link from "next/link";

export default function notFound() {
  return (
    <div className="flex h-screen justify-center items-center bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 text-white select-none">
        <div className="flex flex-col items-center">
            <h1 className="text-8xl font-notothai font-black drop-shadow-lg">404</h1>
            <p className="text-2xl font-semibold">Page Not Found</p>
            <Link href={"/admin"} >admin</Link>
        </div>
    </div>
  )
}
