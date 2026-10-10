import { useState, type ReactNode } from "react";
import {
  IconLock,
  IconMail,
  IconMapPin,
  IconPhone,
  IconBrandTelegram,
} from "@tabler/icons-react";
import type {
  CandidateCard,
  ExplanationFactor,
  FspAchievement,
  MatchExplanation,
} from "@/api/generated/model";
import {
  AvailabilityTag,
  CategoryTag,
  FspBadge,
  FspIndexBadge,
  InvitationStatusBadge,
  SkillList,
  SkillStatBars,
  Stat,
  Tag,
  ApplicationStatusBadge,
} from "@/components/tags";
import {
  formatDate,
  formatPercentile,
  formatSalaryRange,
  formatSalaryRangeShort,
  formatShortDate,
  formatYears,
} from "@/lib/format";
import {
  contactChannelLabel,
  fspDisciplineLabel,
  fspLevelLabel,
  fspResultLabel,
  industryLabel,
  workFormatLabel,
} from "@/lib/labels";
import { FadeIn } from "@/components/motion";
import { cn } from "@/lib/utils";

const POLARITY_TONE = {
  positive: "success",
  negative: "danger",
  neutral: "neutral",
} as const;

export function ExplanationChips({
  chips,
  className,
}: {
  chips: ExplanationFactor[];
  className?: string;
}) {
  return (
    <div
      className={cn("flex flex-wrap gap-1.5", className)}
      aria-label="Почему подходит"
    >
      {chips.slice(0, 3).map((c, i) => (
        <Tag key={`${c.kind}-${i}`} tone={POLARITY_TONE[c.polarity]}>
          {c.label}
        </Tag>
      ))}
    </div>
  );
}

/** «Почему в подборке»: по умолчанию свёрнуто, видны 2–3 чипа; вклад факторов по клику. */
export function WhyPanel({
  explanation,
  className,
}: {
  explanation: MatchExplanation;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const max = Math.max(
    0.01,
    ...explanation.factors.map((f) => Math.abs(f.contribution)),
  );
  return (
    <section className={cn("grid", className)} aria-labelledby="why-title">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="why-title" className="font-heading text-sm font-semibold">
          Почему в подборке
        </h2>
        <span className="num text-sm text-muted-foreground">
          <b className="text-foreground">{Math.round(explanation.score)}</b>/100
        </span>
      </div>
      {!open && <ExplanationChips chips={explanation.chips} className="mt-3" />}
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="mt-3 justify-self-start text-sm font-medium text-link"
      >
        {open ? "Свернуть" : "Подробнее"}
      </button>
      {open && (
        <>
          <ul className="mt-4 grid gap-3">
            {explanation.factors.map((f, i) => (
              <li key={`${f.kind}-${i}`} className="grid gap-1">
                <div className="flex items-start justify-between gap-3 text-sm">
                  <span>{f.label}</span>
                  <span
                    className={cn(
                      "num shrink-0",
                      f.polarity === "negative"
                        ? "text-destructive"
                        : f.polarity === "positive"
                          ? "text-success"
                          : "text-muted-foreground",
                    )}
                  >
                    {f.contribution > 0 ? "+" : ""}
                    {f.contribution.toFixed(0)}
                  </span>
                </div>
                <div
                  className="h-1.5 overflow-hidden rounded-[2px] bg-muted"
                  aria-hidden
                >
                  <div
                    className={cn(
                      "h-full",
                      f.polarity === "negative"
                        ? "bg-destructive"
                        : f.polarity === "positive"
                          ? "bg-primary"
                          : "bg-muted-foreground/50",
                    )}
                    style={{
                      width: `${(Math.abs(f.contribution) / max) * 100}%`,
                    }}
                  />
                </div>
                {f.evidence && (
                  <p className="text-xs text-muted-foreground">{f.evidence}</p>
                )}
              </li>
            ))}
          </ul>
          <p className="num mt-3 text-xs text-muted-foreground">
            совпадение с запросом {Math.round(explanation.fit)}% · сила профиля{" "}
            {Math.round(explanation.strength)}%
          </p>
        </>
      )}
    </section>
  );
}

export function Section({
  title,
  children,
  actions,
  className,
}: {
  title: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("grid content-start", className)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[0.9375rem] font-semibold">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

/** Силуэт вместо фото, пока контакты не раскрыты; после — инициалы. */
export function PlayerAvatar({
  card,
  className,
}: {
  card: CandidateCard;
  className?: string;
}) {
  const name = card.disclosure.revealed ? card.contacts?.full_name : undefined;
  if (name) {
    const initials = name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2);
    return (
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-md bg-primary font-heading text-sm font-bold text-primary-foreground",
          className,
        )}
      >
        {initials}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-end overflow-hidden rounded-md bg-muted",
        className,
      )}
      aria-label="Фото скрыто до раскрытия контактов"
      role="img"
    >
      <svg
        viewBox="0 0 40 40"
        className="h-[88%] w-full text-muted-foreground/45"
        aria-hidden
        fill="currentColor"
      >
        <circle cx="20" cy="15" r="7.5" />
        <path d="M5 40c0-9 6.7-15 15-15s15 6 15 15z" />
      </svg>
    </span>
  );
}

/** Карточка кандидата в списке: ранг, категория, 3 навыка, ФСП-индекс, вилка. */
export function PlayerCard({
  card,
  rank,
  status,
  footer,
  className,
}: {
  card: CandidateCard;
  rank?: number;
  status?: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "grid content-start gap-5 rounded-lg border bg-card p-5",
        className,
      )}
      aria-label={`Карточка ${card.alias}`}
    >
      <div className="flex items-start gap-4">
        {rank !== undefined && (
          <span
            className="num w-[3ch] shrink-0 text-[1.75rem] leading-none font-bold tracking-tight text-muted-foreground/70"
            aria-label={`Место ${rank}`}
          >
            {String(rank).padStart(2, "0")}
          </span>
        )}
        <div className="grid min-w-0 flex-1 gap-1">
          {card.category ? (
            <p className="font-heading text-[1.0625rem] leading-tight font-semibold tracking-[-0.015em] sm:text-[1.25rem]">
              {card.category.label}
            </p>
          ) : (
            <CategoryTag category={null} className="justify-self-start" />
          )}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="truncate">{card.alias}</span>
            {status}
          </div>
        </div>
      </div>
      <SkillStatBars skills={card.skills} limit={3} />
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {card.fsp?.has_history && <FspIndexBadge index={card.fsp.index} />}
        <span className="num ml-auto text-muted-foreground">
          {formatSalaryRangeShort(card.salary_expectation)}
        </span>
        {footer}
      </div>
    </article>
  );
}

/** Шапка анонимной карточки: без ФИО и контактов, только псевдоним и проверяемые сигналы. */
export function CandidateHeadline({
  card,
  right,
}: {
  card: CandidateCard;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        <div className="grid min-w-0 gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-semibold">{card.alias}</span>
            <CategoryTag category={card.category} />
            {card.fsp?.has_history && <FspBadge level={card.fsp.max_level} />}
          </div>
          <p className="text-sm text-muted-foreground">
            {formatYears(card.experience_years)} опыта
            {card.city ? ` · ${card.city}` : ""}
          </p>
        </div>
      </div>
      {right}
    </div>
  );
}

export function CandidateFacts({
  card,
  percentile = true,
}: {
  card: CandidateCard;
  percentile?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-2",
        percentile ? "sm:grid-cols-4" : "sm:grid-cols-3",
      )}
    >
      {percentile && (
        <Stat
          label="Перцентиль"
          value={formatPercentile(card.percentile)}
          accent
        />
      )}
      <Stat
        label="Ожидания"
        value={formatSalaryRange(card.salary_expectation)}
      />
      <Stat
        label="Статус"
        value={<AvailabilityTag availability={card.availability} />}
      />
      <Stat
        label="Был активен"
        value={card.last_active_at ? formatShortDate(card.last_active_at) : "—"}
      />
    </div>
  );
}

/** Полная анонимная карточка кандидата (банк, подборка, превью для самого кандидата). */
export function CandidateCardView({ card }: { card: CandidateCard }) {
  const status = card.relation.invitation ? (
    <InvitationStatusBadge
      status={card.relation.invitation.status}
      viewer="employer"
    />
  ) : card.relation.application ? (
    <ApplicationStatusBadge status={card.relation.application.status} />
  ) : null;
  return (
    <div className="grid gap-10">
      <div className="grid gap-6">
        <div className="flex items-start gap-4">
          <PlayerAvatar card={card} className="size-14" />
          <div className="grid min-w-0 flex-1 gap-1">
            <p className="font-heading text-[1.25rem] leading-tight font-semibold tracking-[-0.015em] sm:text-[1.5rem]">
              {card.category?.label ?? "Без категории"}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{card.alias}</span>
              {card.fsp?.has_history && (
                <FspIndexBadge index={card.fsp.index} />
              )}
              {status}
            </div>
            <p className="text-sm text-muted-foreground">
              {formatYears(card.experience_years)} ·{" "}
              {card.work_formats.map((f) => workFormatLabel[f]).join(", ")}
              {card.city ? ` · ${card.city}` : ""}
            </p>
          </div>
        </div>
        <CandidateFacts card={card} />
      </div>
      <Section title="Навыки">
        <SkillList skills={card.skills} showLevel />
      </Section>
      {card.experience.length > 0 && (
        <Section title="Опыт">
          <ol className="grid gap-4">
            {card.experience.map((e, i) => (
              <li key={i} className="grid max-w-prose gap-0.5">
                <span className="font-medium">{e.role}</span>
                <span className="text-sm text-muted-foreground">
                  {e.company_hidden || !e.company_name
                    ? "Компания скрыта"
                    : e.company_name}
                  {e.industry ? ` · ${industryLabel[e.industry]}` : ""} ·{" "}
                  {formatShortDate(e.start)} –{" "}
                  {e.end ? formatShortDate(e.end) : "сейчас"}
                </span>
                {e.description && <p className="text-sm">{e.description}</p>}
              </li>
            ))}
          </ol>
        </Section>
      )}
    </div>
  );
}

/** Контакты: раскрыты только после принятия инвайта или отклика. */
export function ContactsBlock({ card }: { card: CandidateCard }) {
  if (!card.disclosure.revealed || !card.contacts) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <IconLock className="size-4 shrink-0" aria-hidden />
        Контакты скрыты до принятия инвайта или отклика
      </p>
    );
  }
  return (
    <ContactList
      contacts={card.contacts}
      note={
        card.disclosure.revealed_at
          ? `Раскрыты ${formatDate(card.disclosure.revealed_at)}`
          : undefined
      }
    />
  );
}

export function ContactList({
  contacts,
  note,
}: {
  contacts: NonNullable<CandidateCard["contacts"]>;
  note?: string;
}) {
  return (
    <FadeIn
      y={4}
      className="grid gap-2 rounded-lg border border-success/30 bg-success-surface p-4 text-sm"
    >
      <p className="font-semibold">{contacts.full_name}</p>
      <p className="flex items-center gap-2">
        <IconMail className="size-4" aria-hidden />
        {contacts.email}
      </p>
      {contacts.phone && (
        <p className="flex items-center gap-2">
          <IconPhone className="size-4" aria-hidden />
          {contacts.phone}
        </p>
      )}
      {contacts.telegram && (
        <p className="flex items-center gap-2">
          <IconBrandTelegram className="size-4" aria-hidden />
          {contacts.telegram}
        </p>
      )}
      <p className="text-muted-foreground">
        Предпочитает: {contactChannelLabel[contacts.preferred_channel]}
        {note ? ` · ${note}` : ""}
      </p>
    </FadeIn>
  );
}

export function FspTimeline({
  achievements,
}: {
  achievements: FspAchievement[];
}) {
  const sorted = [...achievements].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <ol className="grid gap-5">
      {sorted.map((a) => (
        <li key={a.id} className="grid gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{a.title}</span>
            <FspBadge level={a.level} label={fspLevelLabel[a.level]} />
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDate(a.date)} · {fspDisciplineLabel[a.discipline]} ·{" "}
            {fspResultLabel[a.result]}
            {a.place ? ` · ${a.place} место` : ""}
            {a.participants_total ? ` из ${a.participants_total}` : ""}
          </p>
        </li>
      ))}
    </ol>
  );
}

export function NoFspHistory() {
  return (
    <div className="grid gap-1 text-sm">
      <p className="font-medium">Нет истории ФСП</p>
      <p className="text-muted-foreground">
        Подбор строится на тесте и навыках.
      </p>
    </div>
  );
}

export function SalaryText({ children }: { children: ReactNode }) {
  return <span className="num font-medium">{children}</span>;
}

export function IconText({
  icon,
  children,
}: {
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
      {icon ?? <IconMapPin className="size-4" aria-hidden />}
      {children}
    </span>
  );
}
