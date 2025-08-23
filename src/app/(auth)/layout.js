import Image from "next/image";

export default function AuthLayout({ children }) {
  return (
    <main className="flex w-full h-screen">
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 bg-white">
        <>{children}</>
      </div>
      <div className="hidden md:block w-1/2 bg-indigo-600">
        <Image
          src={"/illustration.svg"}
          width={100}
          height={100}
          alt="illustration"
          className="w-full h-full "
        />
      </div>
    </main>
  );
}
