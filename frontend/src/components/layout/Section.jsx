import PageContainer from "./PageContainer.jsx";

/** Vertical page section with consistent spacing and an optional heading. */
const Section = ({
  id,
  eyebrow,
  title,
  description,
  align = "center",
  children,
  className = "",
}) => {
  const alignClasses = align === "center" ? "mx-auto text-center items-center" : "text-left items-start";

  return (
    <section id={id} className={`px-4 py-16 sm:px-6 lg:px-8 ${className}`}>
      <PageContainer>
        {(eyebrow || title || description) && (
          <div className={`mb-12 flex max-w-2xl flex-col gap-3 ${alignClasses}`}>
            {eyebrow && (
              <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
                {eyebrow}
              </span>
            )}
            {title && <h2 className="text-h2">{title}</h2>}
            {description && <p className="text-body text-text-muted">{description}</p>}
          </div>
        )}
        {children}
      </PageContainer>
    </section>
  );
};

export default Section;
