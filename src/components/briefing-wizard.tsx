"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ImagePlus,
  Mic,
  Plus,
  Save,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  createPrototypeOrder,
  defaultBriefing,
  emptyCharacter,
  generateStoryPages,
  messageFromIdea,
  savePrototypeOrder,
  suggestedTitle,
  themeFromIdea,
  type PrototypeBriefing,
  type PrototypeCharacter,
} from "@/lib/prototype-store";

type SpeechRecognitionConstructor = new () => {
  lang: string;
  interimResults: boolean;
  start: () => void;
  onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const steps = ["Ideia", "Livro", "Personagens", "Revisao"];

const themeSuggestions = [
  "uma aventura pelo espaco",
  "uma aventura no vale dos dinossauros",
  "um mergulho no fundo do mar",
  "o primeiro dia de escola",
  "uma noite tranquila e cheia de carinho",
  "uma descoberta entre irmaos",
];

const messageSuggestions = [
  "lar e onde a familia esta",
  "coragem tambem e pedir ajuda",
  "cada crianca tem um brilho unico",
  "o amor acompanha cada descoberta",
  "ser gentil muda o caminho da aventura",
];

const titleSuggestions = [
  "O Segredo do Pequeno Explorador",
  "A Estrela que Sabia Voltar",
  "O Abraco que Acendeu o Caminho",
  "Uma Aventura do Tamanho do Coracao",
  "O Mapa das Coisas Queridas",
];

const characterPresets = [
  { label: "Mae", relation: "mae" },
  { label: "Pai", relation: "pai" },
  { label: "Vovo", relation: "avo" },
  { label: "Vova", relation: "avo" },
  { label: "Irmao", relation: "irmao" },
  { label: "Irma", relation: "irma" },
  { label: "Pet", relation: "pet" },
  { label: "Especial", relation: "personagem especial" },
];

const blockedTerms = [
  "terror",
  "sangue",
  "arma",
  "assassin",
  "morte violenta",
  "droga",
  "sexo",
  "odio",
];

export function BriefingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [briefing, setBriefing] = useState<PrototypeBriefing>(defaultBriefing);
  const [notice, setNotice] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [savedOrderId, setSavedOrderId] = useState("");
  const [expandedCharacterId, setExpandedCharacterId] = useState(briefing.characters[0]?.id ?? "");

  const progress = useMemo(() => `${Math.round((step / steps.length) * 100)}%`, [step]);
  const storyPreview = useMemo(() => generateStoryPages(briefing), [briefing]);
  const safetyIssues = useMemo(() => findSafetyIssues(briefing), [briefing]);
  const heroName = briefing.childName || briefing.characters[0]?.name || "a crianca";

  function updateField<K extends keyof PrototypeBriefing>(field: K, value: PrototypeBriefing[K]) {
    setBriefing((current) => ({ ...current, [field]: value }));
  }

  function updateChildName(value: string) {
    setBriefing((current) => ({
      ...current,
      childName: value,
      characters: current.characters.map((character, index) => {
        if (index !== 0) return character;
        const shouldSync = !character.name.trim() || character.name.trim() === current.childName.trim();
        return {
          ...character,
          name: shouldSync ? value : character.name,
          role: "Protagonista",
          relation: "propria crianca",
        };
      }),
    }));
  }

  function updateCharacter(id: string, patch: Partial<PrototypeCharacter>) {
    setBriefing((current) => ({
      ...current,
      characters: current.characters.map((character) =>
        character.id === id ? { ...character, ...patch } : character
      ),
    }));
  }

  function addCharacter(role = "Personagem", relation = "") {
    const character = emptyCharacter(role);
    character.relation = relation;
    setBriefing((current) => ({
      ...current,
      characters: [...current.characters, character],
    }));
    setExpandedCharacterId(character.id);
  }

  function removeCharacter(id: string) {
    setBriefing((current) => ({
      ...current,
      characters:
        current.characters.length === 1
          ? current.characters
          : current.characters.filter((character) => character.id !== id),
    }));
  }

  function handlePhoto(characterId: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      updateCharacter(characterId, {
        hasPhoto: true,
        photoName: file.name,
        photoPreview: String(reader.result),
      });
    };
    reader.readAsDataURL(file);
  }

  function startVoice() {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!Recognition) {
      setNotice("Este navegador nao liberou captura de voz aqui. Pode digitar normalmente.");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      updateField("idea", `${briefing.idea}${briefing.idea ? " " : ""}${text}`.trim());
    };
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => {
      setIsRecording(false);
      setNotice("Nao consegui capturar a voz. Tente de novo ou digite a ideia.");
    };
    setIsRecording(true);
    recognition.start();
  }

  function fillFromIdea() {
    setBriefing((current) => {
      const next = {
        ...current,
        theme: current.theme || themeFromIdea(current.idea),
        emotionalMessage: current.emotionalMessage || messageFromIdea(current.idea),
      };

      return {
        ...next,
        title: current.title || suggestedTitle(next),
      };
    });
    setNotice("Sugestao preenchida. Voce pode editar qualquer campo.");
  }

  function validateCurrentStep() {
    if (step === 1 && !briefing.idea.trim()) return "Conte a ideia principal do livro antes de continuar.";
    if (step === 2 && !briefing.theme.trim()) return "Escreva ou escolha um tema.";
    if (step === 2 && !briefing.emotionalMessage.trim()) return "Defina a mensagem emocional do livro.";
    if (step === 3 && !briefing.childName.trim() && !briefing.characters[0]?.name.trim()) {
      return "Informe o nome ou apelido da crianca protagonista.";
    }
    if (step === 3 && briefing.characters.some((character) => !character.name.trim())) {
      return "Todo personagem adicionado precisa ter nome ou apelido.";
    }
    return "";
  }

  function nextStep() {
    const error = validateCurrentStep();
    if (error) {
      setNotice(error);
      return;
    }
    if (step === 1 && (!briefing.theme || !briefing.emotionalMessage || !briefing.title)) {
      fillFromIdea();
    } else {
      setNotice("");
    }
    setStep((current) => Math.min(steps.length, current + 1));
  }

  function saveDraft() {
    const order = createPrototypeOrder(briefing, { draft: true });
    savePrototypeOrder(order);
    setSavedOrderId(order.id);
    setNotice("Rascunho salvo neste navegador.");
  }

  function saveOrder() {
    const error = validateCurrentStep();
    if (error) {
      setNotice(error);
      return;
    }

    if (safetyIssues.length > 0) {
      setNotice("Ajuste o tema antes de enviar. Encontramos um ponto sensivel para livro infantil.");
      return;
    }

    const order = createPrototypeOrder(briefing);
    savePrototypeOrder(order);
    setSavedOrderId(order.id);
    setNotice("Pedido criado. A historia ja esta pronta para aprovacao.");
    router.push(`/cliente/pedidos/${order.id}`);
  }

  return (
    <div className="rounded-[28px] border border-[#d9ddd9] bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#0f5f63]">
              Novo livro
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-[#173331]">{steps[step - 1]}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {steps.map((item, index) => (
              <button
                key={item}
                type="button"
                onClick={() => setStep(index + 1)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  step === index + 1
                    ? "bg-[#173331] text-white"
                    : index + 1 < step
                      ? "bg-[#e5f3ed] text-[#146448]"
                      : "bg-[#f0ebe0] text-[#68716e]"
                }`}
              >
                {index + 1}. {item}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-[#edf0ec]">
          <div className="h-2 rounded-full bg-[#0f5f63]" style={{ width: progress }} />
        </div>
      </div>

      {notice && (
        <div className="mb-6 rounded-2xl border border-[#f1d394] bg-[#fff4dc] p-4 text-sm font-medium text-[#7a5012]">
          {notice}
        </div>
      )}

      {safetyIssues.length > 0 && (
        <div className="mb-6 rounded-2xl border border-[#efb7ad] bg-[#fde7e3] p-4 text-sm font-medium text-[#9a3f2f]">
          Tema sensivel detectado para publico infantil. Revise: {safetyIssues.join(", ")}.
        </div>
      )}

      {step === 1 && (
        <section className="grid gap-5 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-[#40504c]">Ideia principal</span>
              <textarea
                value={briefing.idea}
                onChange={(event) => updateField("idea", event.target.value)}
                rows={10}
                className="mt-2 w-full rounded-3xl border border-[#d9ddd9] bg-[#fbf8f1] p-5 text-base leading-7 text-[#173331] outline-none transition focus:border-[#0f5f63] focus:ring-4 focus:ring-[#cde5e8]"
                placeholder="Ex.: Uma crianca que ama foguetes quer conhecer o espaco, mas descobre que voltar para casa tambem e uma aventura."
              />
            </label>

            <button
              type="button"
              onClick={startVoice}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#d9ddd9] px-4 py-3 text-sm font-semibold text-[#173331] transition hover:bg-[#f0ebe0] sm:w-auto"
            >
              <Mic className="size-4" aria-hidden="true" />
              {isRecording ? "Ouvindo..." : "Falar ideia"}
            </button>
          </div>

          <div className="space-y-4 rounded-3xl bg-[#fbf8f1] p-4">
            <label className="block">
              <span className="text-sm font-semibold text-[#40504c]">Nome da crianca</span>
              <input
                value={briefing.childName}
                onChange={(event) => updateChildName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#d9ddd9] bg-white px-4 py-3 text-sm outline-none focus:border-[#0f5f63] focus:ring-4 focus:ring-[#cde5e8]"
                placeholder="Ex.: Miguel"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[#40504c]">Idade de leitura</span>
              <select
                value={briefing.targetAge}
                onChange={(event) => updateField("targetAge", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#d9ddd9] bg-white px-4 py-3 text-sm outline-none focus:border-[#0f5f63] focus:ring-4 focus:ring-[#cde5e8]"
              >
                <option>2 a 4 anos</option>
                <option>2 a 6 anos</option>
                <option>4 a 6 anos</option>
                <option>6 a 8 anos</option>
              </select>
            </label>
            <div className="rounded-2xl border border-[#d9ddd9] bg-white p-4 text-sm leading-6 text-[#59635f]">
              Protagonista: <strong className="text-[#173331]">{heroName}</strong>
            </div>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-6 text-[#68716e]">
              Este resumo define a promessa emocional do livro. Tudo continua editavel.
            </p>
            <button
              type="button"
              onClick={fillFromIdea}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d9ddd9] px-4 py-3 text-sm font-semibold text-[#173331] transition hover:bg-[#fbf8f1]"
            >
              <Sparkles className="size-4 text-[#c77d35]" aria-hidden="true" />
              Sugerir resumo
            </button>
          </div>

          <FieldWithSuggestions
            label="Tema"
            value={briefing.theme}
            onChange={(value) => updateField("theme", value)}
            suggestions={themeSuggestions}
            placeholder="Ex.: uma aventura pelo espaco"
          />
          <FieldWithSuggestions
            label="Mensagem"
            value={briefing.emotionalMessage}
            onChange={(value) => updateField("emotionalMessage", value)}
            suggestions={messageSuggestions}
            placeholder="Ex.: lar e onde a familia esta"
          />
          <FieldWithSuggestions
            label="Titulo"
            value={briefing.title}
            onChange={(value) => updateField("title", value)}
            suggestions={titleSuggestions}
            placeholder="Ex.: Miguel e o Caminho das Estrelas"
          />
          <div className="grid gap-4 md:grid-cols-3">
            <SmallSelect
              label="Tom"
              value={briefing.tone}
              onChange={(value) => updateField("tone", value)}
              options={[
                "magico, afetivo e aventureiro",
                "divertido e carinhoso",
                "poetico e calmo",
                "educativo e leve",
              ]}
            />
            <SmallSelect
              label="Formato"
              value={briefing.format}
              onChange={(value) => updateField("format", value)}
              options={["A5 vertical", "A4 vertical", "21x21 cm quadrado"]}
            />
            <SmallSelect
              label="Paginas"
              value={String(briefing.pages)}
              onChange={(value) => updateField("pages", Number(value))}
              options={["16", "20", "24", "28", "32"]}
            />
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="max-w-3xl text-sm leading-6 text-[#68716e]">
                Cada personagem pode ter foto propria ou descricao. O primeiro cartao e sempre a crianca protagonista.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {characterPresets.map((preset, index) => (
                <button
                  type="button"
                  key={`${preset.label}-${index}`}
                  onClick={() => addCharacter(preset.label, preset.relation)}
                  className="rounded-full border border-[#d9ddd9] bg-white px-3 py-2 text-xs font-semibold text-[#40504c] transition hover:border-[#0f5f63] hover:bg-[#e8f2f4]"
                >
                  + {preset.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => addCharacter()}
                className="inline-flex items-center gap-2 rounded-full bg-[#173331] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0f5f63]"
              >
                <Plus className="size-3.5" aria-hidden="true" />
                Outro
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {briefing.characters.map((character, index) => (
              <CharacterCard
                key={character.id}
                index={index}
                character={character}
                isExpanded={expandedCharacterId === character.id}
                canRemove={index > 0}
                onExpand={() =>
                  setExpandedCharacterId((current) => (current === character.id ? "" : character.id))
                }
                onChange={(patch) => updateCharacter(character.id, patch)}
                onRemove={() => removeCharacter(character.id)}
                onPhoto={(event) => handlePhoto(character.id, event)}
              />
            ))}
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="space-y-6">
          <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
            <div className="space-y-4">
              <div className="rounded-3xl bg-[#e5f3ed] p-5">
                <Check className="size-7 text-[#146448]" aria-hidden="true" />
                <h3 className="mt-4 text-xl font-semibold text-[#173331]">
                  {briefing.title || suggestedTitle(briefing)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#59635f]">
                  Para {heroName}. {briefing.format}, {briefing.pages} paginas.
                </p>
              </div>

              <label className="block">
                <span className="text-sm font-semibold text-[#40504c]">Texto da dedicatoria</span>
                <textarea
                  value={briefing.dedication}
                  onChange={(event) => updateField("dedication", event.target.value)}
                  rows={5}
                  className="mt-2 w-full rounded-2xl border border-[#d9ddd9] bg-[#fbf8f1] p-4 text-sm outline-none focus:border-[#0f5f63] focus:ring-4 focus:ring-[#cde5e8]"
                  placeholder="Ex.: Para Miguel, que seus sonhos sempre encontrem carinho pelo caminho."
                />
              </label>
              <SmallSelect
                label="Local da dedicatoria"
                value={briefing.dedicationPlace}
                onChange={(value) => updateField("dedicationPlace", value)}
                options={["primeira pagina", "ultima pagina", "contracapa", "sem dedicatoria"]}
              />
            </div>

            <div className="rounded-3xl border border-[#d9ddd9] bg-[#fbf8f1] p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-[#173331]">Historia inicial</h3>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0f5f63]">
                  {storyPreview.length} paginas
                </span>
              </div>
              <div className="grid max-h-[620px] gap-3 overflow-y-auto pr-1 md:grid-cols-2">
                {storyPreview.map((page) => (
                  <article key={page.pageNumber} className="rounded-2xl border border-[#e5e3dc] bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="font-semibold text-[#173331]">Pagina {page.pageNumber}</h4>
                      <span className="rounded-full bg-[#e8f2f4] px-3 py-1 text-xs font-semibold text-[#0f5f63]">
                        {page.emotion}
                      </span>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-[#59635f]">{page.scene}</p>
                    <p className="mt-3 text-base leading-7 text-[#173331]">&ldquo;{page.text}&rdquo;</p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          {savedOrderId && (
            <div className="rounded-2xl border border-[#b8decd] bg-[#e5f3ed] p-4 text-sm font-semibold text-[#146448]">
              Pedido salvo: {savedOrderId}
            </div>
          )}
        </section>
      )}

      <div className="mt-8 flex flex-col gap-3 border-t border-[#edf0ec] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          disabled={step === 1}
          onClick={() => {
            setNotice("");
            setStep((current) => Math.max(1, current - 1));
          }}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-[#59635f] disabled:opacity-40"
        >
          Voltar
        </button>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={saveDraft}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d9ddd9] px-5 py-2.5 text-sm font-semibold text-[#173331] transition hover:bg-[#fbf8f1]"
          >
            <Save className="size-4" aria-hidden="true" />
            Salvar rascunho
          </button>
          <button
            type="button"
            onClick={step === steps.length ? saveOrder : nextStep}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#173331] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f5f63]"
          >
            {step === steps.length ? "Enviar para aprovacao" : "Continuar"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldWithSuggestions({
  label,
  value,
  onChange,
  suggestions,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder: string;
}) {
  return (
    <div>
      <label className="block">
        <span className="text-sm font-semibold text-[#40504c]">{label}</span>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-[#d9ddd9] bg-[#fbf8f1] px-4 py-3 text-sm outline-none focus:border-[#0f5f63] focus:ring-4 focus:ring-[#cde5e8]"
          placeholder={placeholder}
        />
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            type="button"
            key={suggestion}
            onClick={() => onChange(suggestion)}
            className="inline-flex items-center gap-2 rounded-full border border-[#d9ddd9] bg-white px-3 py-2 text-xs font-semibold text-[#40504c] transition hover:border-[#0f5f63] hover:bg-[#e8f2f4]"
          >
            <Sparkles className="size-3.5 text-[#c77d35]" aria-hidden="true" />
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

function SmallSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#40504c]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-[#d9ddd9] bg-[#fbf8f1] px-4 py-3 text-sm outline-none focus:border-[#0f5f63] focus:ring-4 focus:ring-[#cde5e8]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function CharacterCard({
  index,
  character,
  isExpanded,
  canRemove,
  onExpand,
  onChange,
  onRemove,
  onPhoto,
}: {
  index: number;
  character: PrototypeCharacter;
  isExpanded: boolean;
  canRemove: boolean;
  onExpand: () => void;
  onChange: (patch: Partial<PrototypeCharacter>) => void;
  onRemove: () => void;
  onPhoto: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const isProtagonist = index === 0;

  return (
    <article className="rounded-3xl border border-[#d9ddd9] bg-[#fbf8f1] p-4 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_210px]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-white text-[#0f5f63] ring-1 ring-[#d9ddd9]">
              <UserRound className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#0f5f63]">
                {isProtagonist ? "Crianca protagonista" : "Personagem"}
              </p>
              <h3 className="text-lg font-semibold text-[#173331]">
                {character.name || (isProtagonist ? "Nome da crianca" : character.role)}
              </h3>
            </div>
            {canRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="inline-flex items-center gap-2 rounded-xl border border-[#efb7ad] px-3 py-2 text-sm font-semibold text-[#9a3f2f] hover:bg-[#fde7e3]"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Remover
              </button>
            )}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <TextInput
              label={isProtagonist ? "Nome ou apelido da crianca" : "Nome ou apelido"}
              value={character.name}
              onChange={(value) => onChange({ name: value })}
            />
            {isProtagonist ? (
              <div className="rounded-2xl border border-[#d9ddd9] bg-white px-4 py-3 text-sm text-[#59635f]">
                Papel: <strong className="text-[#173331]">protagonista da propria historia</strong>
              </div>
            ) : (
              <TextInput
                label="Relacao com a crianca"
                value={character.relation}
                onChange={(value) => onChange({ relation: value })}
              />
            )}
            <TextInput
              label="Objeto importante"
              value={character.specialObject}
              onChange={(value) => onChange({ specialObject: value })}
            />
            <TextInput
              label="Personalidade em poucas palavras"
              value={character.personality}
              onChange={(value) => onChange({ personality: value })}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-[#c8cec9] bg-white p-3">
          {character.photoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={character.photoPreview}
              alt={`Referencia de ${character.name || "personagem"}`}
              className="h-32 w-full rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-32 flex-col items-center justify-center rounded-xl bg-[#e8f2f4] text-center text-xs text-[#59635f]">
              <ImagePlus className="mb-2 size-6 text-[#0f5f63]" aria-hidden="true" />
              Sem referencia
            </div>
          )}
          <label className="mt-3 flex cursor-pointer items-center justify-center rounded-xl bg-[#173331] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f5f63]">
            Adicionar referencia
            <input type="file" accept="image/*" className="sr-only" onChange={onPhoto} />
          </label>
          {character.photoName && <p className="mt-2 truncate text-xs text-[#68716e]">{character.photoName}</p>}
          <label className="mt-3 flex items-center gap-2 text-xs text-[#40504c]">
            <input
              type="checkbox"
              checked={!character.hasPhoto}
              onChange={(event) => onChange({ hasPhoto: !event.target.checked })}
              className="size-4 accent-[#0f5f63]"
            />
            Nao tenho foto
          </label>
        </div>
      </div>

      <button
        type="button"
        onClick={onExpand}
        className="mt-4 inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-[#0f5f63]"
      >
        Detalhes opcionais
        <ChevronDown className={`size-4 transition ${isExpanded ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {isExpanded && (
        <div className="mt-3 grid gap-4 border-t border-[#e5e3dc] pt-4 md:grid-cols-2">
          {!isProtagonist && (
            <TextInput label="Papel na historia" value={character.role} onChange={(value) => onChange({ role: value })} />
          )}
          <TextInput label="Frase ou jeito de falar" value={character.catchphrase} onChange={(value) => onChange({ catchphrase: value })} />
          <label className="block md:col-span-2">
            <span className="text-sm font-semibold text-[#40504c]">Aparencia e roupa</span>
            <textarea
              value={character.appearance}
              onChange={(event) => onChange({ appearance: event.target.value })}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-[#d9ddd9] bg-white p-4 text-sm outline-none focus:border-[#0f5f63] focus:ring-4 focus:ring-[#cde5e8]"
              placeholder="Cabelo, roupa, energia, detalhes que precisam ser mantidos..."
            />
          </label>
          {!character.hasPhoto && (
            <>
              <TextInput label="Pele" value={character.skinTone} onChange={(value) => onChange({ skinTone: value })} />
              <TextInput label="Cabelo" value={character.hair} onChange={(value) => onChange({ hair: value })} />
              <TextInput label="Olhos" value={character.eyes} onChange={(value) => onChange({ eyes: value })} />
            </>
          )}
          <TextInput label="Nao pode mudar" value={character.notes} onChange={(value) => onChange({ notes: value })} />
        </div>
      )}
    </article>
  );
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#40504c]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-[#d9ddd9] bg-white px-4 py-3 text-sm outline-none focus:border-[#0f5f63] focus:ring-4 focus:ring-[#cde5e8]"
      />
    </label>
  );
}

function findSafetyIssues(briefing: PrototypeBriefing) {
  const text = [
    briefing.idea,
    briefing.theme,
    briefing.emotionalMessage,
    briefing.title,
    ...briefing.characters.flatMap((character) => [
      character.name,
      character.role,
      character.personality,
      character.appearance,
      character.notes,
    ]),
  ]
    .join(" ")
    .toLowerCase();

  return blockedTerms.filter((term) => text.includes(term));
}
