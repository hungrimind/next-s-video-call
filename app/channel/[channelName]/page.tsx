import dynamic from "next/dynamic";

const Call = dynamic(() => import("../../components/Call"), { ssr: false });

export default function Page({ params }: { params: { channelName: string } }) {
  return (
    <main className="flex w-full flex-col">
      <p className="absolute z-10 mt-2 ml-12 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        {params.channelName}
      </p>
      <Call channelName={params.channelName}></Call>
    </main>
  );
}
