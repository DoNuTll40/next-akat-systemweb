import { Button } from "primereact/button";

export default function Home() {
  return (
    <div className="flex justify-center items-center h-screen text-2xl">
      <div className="flex gap-2 items-end">
        <h1>Hello World </h1>
        <Button className="bg-green-300 focus:outline-0 px-4 py-0.5 text-4xl" label="test" />
      </div>
    </div>
  );
}
