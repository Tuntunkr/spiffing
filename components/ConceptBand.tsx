export default function ConceptBand({ text }: { text: string }) {
  const body = text.trim();
  if (!body) return null;

  return (
    <section
      aria-labelledby="concept-heading"
      className="bg-[#16150f] px-5 py-16 sm:px-8 sm:py-20 lg:px-14 xl:px-16"
    >
      <div className="mx-auto max-w-[1680px]">
        <p
          id="concept-heading"
          className="text-[12px] uppercase tracking-[0.16em] text-[#8a867c]"
        >
          Concept
        </p>
        <p className="mt-5 max-w-[46rem] text-[18px] font-normal leading-[1.55] text-[#faf9f7] sm:text-[20px] sm:leading-[1.5]">
          {body}
        </p>
      </div>
    </section>
  );
}
