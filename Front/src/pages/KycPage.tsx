import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Upload, CheckCircle2, XCircle, ShieldCheck, RefreshCw } from "lucide-react";
import { clsx } from "clsx";
import { api } from "../api/mock";
import { Button, Eyebrow } from "../components/ui";
import { useAuth } from "../store/auth";
import type { KycResult } from "../lib/types";

type Step = "capture" | "processing" | "result";

export function KycPage() {
  const nav = useNavigate();
  const setKyc = useAuth((s) => s.setKyc);
  const [step, setStep] = useState<Step>("capture");
  const [front, setFront] = useState<string | null>(null);
  const [back, setBack] = useState<string | null>(null);
  const [result, setResult] = useState<KycResult | null>(null);

  const submit = async () => {
    if (!front || !back) return;
    setStep("processing");
    setKyc("processing");
    const r = await api.submitKyc(front, back);
    setResult(r);
    setKyc(r.status);
    setStep("result");
  };

  const reset = () => { setFront(null); setBack(null); setResult(null); setStep("capture"); };

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <Eyebrow>Verificación de identidad</Eyebrow>
      <h1 className="font-display text-3xl font-bold">Confirma quién eres</h1>
      <p className="mt-1 text-sm text-ink/55">
        Antes de tu primera reserva validamos tu documento con IA. Solo toma unos segundos
        y protege tanto a huéspedes como a anfitriones.
      </p>

      {/* Stepper */}
      <div className="mt-8 flex items-center gap-2 text-xs font-medium">
        {(["capture", "processing", "result"] as Step[]).map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <span className={clsx(
              "grid h-7 w-7 place-items-center rounded-full",
              step === s ? "bg-moss text-ink" : i < (["capture","processing","result"]).indexOf(step) ? "bg-moss/30 text-moss-deep" : "bg-paper-dim text-ink/40"
            )}>{i + 1}</span>
            {i < 2 && <span className="h-px flex-1 bg-ink/10" />}
          </div>
        ))}
      </div>

      {step === "capture" && (
        <div className="mt-8 space-y-4">
          <UploadSlot label="Frente de la cédula" hint="Asegúrate de que se lea con claridad" image={front} onImage={setFront} />
          <UploadSlot label="Reverso de la cédula" hint="Evita reflejos y sombras" image={back} onImage={setBack} />
          <Button size="lg" className="w-full" disabled={!front || !back} onClick={submit}>
            <ShieldCheck size={18} /> Validar identidad
          </Button>
          <p className="text-center text-xs text-ink/45">
            Tus documentos se cifran y se eliminan de forma segura tras la validación.
          </p>
        </div>
      )}

      {step === "processing" && (
        <div className="mt-12 flex flex-col items-center py-10 text-center">
          <div className="relative grid h-24 w-24 place-items-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-moss/20" />
            <span className="grid h-20 w-20 place-items-center rounded-full bg-moss/15">
              <ShieldCheck className="animate-pulse text-moss-deep" size={34} />
            </span>
          </div>
          <p className="mt-6 font-display text-lg font-semibold">Analizando tu documento…</p>
          <p className="mt-1 text-sm text-ink/55">La IA está extrayendo tus datos y verificando autenticidad.</p>
        </div>
      )}

      {step === "result" && result && (
        <div className="mt-8">
          {result.status === "approved" ? (
            <div className="rounded-xl2 border border-moss/30 bg-moss/[0.06] p-7 text-center">
              <CheckCircle2 className="mx-auto text-moss-deep" size={48} />
              <h2 className="mt-3 font-display text-2xl font-bold">Identidad verificada</h2>
              <p className="mt-1 text-sm text-ink/60">Ya puedes confirmar reservas en RentHub.</p>
              <dl className="mx-auto mt-6 max-w-sm divide-y divide-ink/10 text-left text-sm">
                <Detail k="Nombres" v={result.names} />
                <Detail k="Apellidos" v={result.lastNames} />
                <Detail k="Documento" v={result.documentNumber} />
                <Detail k="Fecha de nacimiento" v={result.birthDate} />
              </dl>
              <Button size="lg" className="mt-7 w-full" onClick={() => nav("/bookings")}>
                Continuar a mi reserva
              </Button>
            </div>
          ) : (
            <div className="rounded-xl2 border border-coral/30 bg-coral/[0.06] p-7 text-center">
              <XCircle className="mx-auto text-coral" size={48} />
              <h2 className="mt-3 font-display text-2xl font-bold">No pudimos verificarte</h2>
              <p className="mx-auto mt-1 max-w-sm text-sm text-ink/60">{result.reason}</p>
              <Button variant="coral" size="lg" className="mt-7 w-full" onClick={reset}>
                <RefreshCw size={18} /> Intentar de nuevo
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Detail({ k, v }: { k: string; v?: string }) {
  return (
    <div className="flex justify-between py-2.5">
      <dt className="text-ink/50">{k}</dt>
      <dd className="font-medium">{v ?? "—"}</dd>
    </div>
  );
}

function UploadSlot({
  label, hint, image, onImage,
}: { label: string; hint: string; image: string | null; onImage: (d: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="rounded-xl2 border border-ink/15 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-xs text-ink/50">{hint}</p>
        </div>
        {image && <CheckCircle2 size={20} className="text-moss-deep" />}
      </div>

      {image ? (
        <img src={image} alt={label} className="mt-3 aspect-[16/10] w-full rounded-xl object-cover" />
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="focusable mt-3 flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink/15 text-ink/50 hover:border-moss hover:text-moss-deep"
        >
          <div className="flex gap-3">
            <Camera size={22} /> <Upload size={22} />
          </div>
          <span className="text-sm">Tomar foto o subir imagen</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"  /* opens rear camera on mobile */
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </div>
  );
}
